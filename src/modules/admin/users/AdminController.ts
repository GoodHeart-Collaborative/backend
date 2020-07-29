"use strict";

import * as _ from "lodash";
import * as promise from "bluebird";

import { adminDao, adminMapper } from "@modules/admin/index";
import * as adminConstant from "@modules/admin/adminConstant";
import * as appUtils from "@utils/appUtils";
import * as config from "@config/index";
import { loginHistoryDao } from "@modules/loginHistory/LoginHistoryDao";
import { mailManager } from "@lib/MailManager";
import * as tokenManager from "@lib/tokenManager";
import { userDao } from "@modules/user/UserDao";
import { AdminuserDao } from "@modules/admin/users/userDao";
import { TemplateUtil } from "@utils/TemplateUtil";

class AdminController {

	/**
	 * @function createAdmin
	 * @description first checking is admin is created or not,
	 * if not then create admin otherwise gives an error admin
	 * already exist.
	 * @param params { "platform": double, "name": string, "email": string, "password": string }
	 * @returns object
	 * @author Rajat Maheshwari
	 */
	async createAdmin(params: AdminRequest.Create) {
		try {
			const isExist = await adminDao.isEmailExists(params, "");
			if (isExist) {
				return Promise.reject(adminConstant.MESSAGES.ERROR.EMAIL_ALREADY_EXIST);
			} else {
				const step1 = adminDao.createAdmin(params);
				return adminConstant.MESSAGES.SUCCESS.ADD_SUB_ADMIN;
			}
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function addSubAdmin
	 */
	async addSubAdmin(params: SubAdminRequest.Create, tokenData: TokenData) {
		try {
			if (tokenData.adminType !== config.CONSTANT.ADMIN_TYPE.SUPER_ADMIN) {
				return Promise.reject(config.CONSTANT.MESSAGES.ERROR.UNAUTHORIZED_ACCESS);
			} else {
				const isExist = await adminDao.isEmailExists(params, "");
				if (isExist) {
					return Promise.reject(adminConstant.MESSAGES.ERROR.EMAIL_ALREADY_EXIST);
				} else {
					params.adminType = config.CONSTANT.ADMIN_TYPE.SUB_ADMIN;
					const step1 = adminDao.createAdmin(params);
					return adminConstant.MESSAGES.SUCCESS.ADD_SUB_ADMIN;
				}
			}
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function subAdminList
	 */
	async subAdminList(params: ListingRequest, tokenData: TokenData) {
		try {
			if (tokenData.adminType !== config.CONSTANT.ADMIN_TYPE.SUPER_ADMIN) {
				return Promise.reject(config.CONSTANT.MESSAGES.ERROR.UNAUTHORIZED_ACCESS);
			} else {
				const step1 = await adminDao.subAdminList(params);
				return adminConstant.MESSAGES.SUCCESS.SUB_ADMIN_LIST({ "subAdminList": step1.data, "totalRecord": step1.total });
			}
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function deleteSubAdmin
	 */
	async deleteSubAdmin(params: UserId, tokenData: TokenData) {
		try {
			if (tokenData.adminType !== config.CONSTANT.ADMIN_TYPE.SUPER_ADMIN) {
				return Promise.reject(config.CONSTANT.MESSAGES.ERROR.UNAUTHORIZED_ACCESS);
			} else {
				const step1 = adminDao.deleteSubAdmin(params);
				return adminConstant.MESSAGES.SUCCESS.DELETE_SUB_ADMIN;
			}
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function editSubAdmin
	 */
	async editSubAdmin(params: SubAdminRequest.Edit, tokenData: TokenData) {
		try {
			if (tokenData.adminType !== config.CONSTANT.ADMIN_TYPE.SUPER_ADMIN) {
				return Promise.reject(config.CONSTANT.MESSAGES.ERROR.UNAUTHORIZED_ACCESS);
			} else {
				const isExist = await adminDao.isEmailExists(params, { "userId": params.userId });
				if (isExist) {
					return Promise.reject(adminConstant.MESSAGES.ERROR.EMAIL_ALREADY_EXIST);
				} else {
					if (params.password) {
						const step1 = await adminDao.findAdminById(params);
						params.hash = appUtils.encryptHashPassword(params.password, step1.salt);
						params.salt = step1.salt;
					}
					const step2 = adminDao.editSubAdmin(params);
					return adminConstant.MESSAGES.SUCCESS.EDIT_SUB_ADMIN;
				}
			}
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function _blockSubAdmin
	 */
	async _blockSubAdmin(params: BlockRequest) {
		try {
			const step1 = adminDao.blockUnblock(params);
			return adminConstant.MESSAGES.SUCCESS.BLOCK_SUB_ADMIN;
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function _unblockSubAdmin
	 */
	async _unblockSubAdmin(params: BlockRequest) {
		try {
			const step1 = adminDao.blockUnblock(params);
			return adminConstant.MESSAGES.SUCCESS.UNBLOCK_SUB_ADMIN;
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function blockUnblock
	 */
	async blockUnblock(params: BlockRequest, tokenData: TokenData) {
		try {
			if (tokenData.adminType !== config.CONSTANT.ADMIN_TYPE.SUPER_ADMIN) {
				return Promise.reject(config.CONSTANT.MESSAGES.ERROR.UNAUTHORIZED_ACCESS);
			} else {
				switch (params.status) {
					case config.CONSTANT.STATUS.BLOCKED:
						return this._blockSubAdmin(params);
					case config.CONSTANT.STATUS.ACTIVE:
						return this._unblockSubAdmin(params);
				}
			}
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function forgotPassword
	 */
	async forgotPassword(params: ForgotPasswordRequest) {
		try {
			const step1 = await adminDao.isEmailExists(params, ""); // check is email exist if not then restrict to send forgot password mail
			if (!step1) {
				return Promise.reject(config.CONSTANT.MESSAGES.ERROR.EMAIL_NOT_REGISTERED);
			} else {
				if (step1.status === config.CONSTANT.STATUS.BLOCKED) {
					return Promise.reject(config.CONSTANT.MESSAGES.ERROR.BLOCKED);
				} else {
					const tokenData = _.extend(params, {
						"userId": step1._id,
						"salt": step1.salt,
						"name": step1.name,
						"email": step1.email,
						"accountLevel": config.CONSTANT.ACCOUNT_LEVEL.ADMIN,
						"adminType": step1.adminType
					});

					const adminObject = appUtils.buildToken(tokenData);

					const accessToken = await tokenManager.generateAdminToken({ "type": "FORGOT_PASSWORD", "object": adminObject });

					const step2 = adminDao.addForgotToken({ "userId": step1._id, "forgotToken": accessToken }); // add forgot token

					const step3 = mailManager.forgotPasswordEmailToAdmin({ "email": params.email, "name": step1.name, "accessToken": accessToken });
					return adminConstant.MESSAGES.SUCCESS.FORGOT_PASSWORD;
				}
			}
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function changeForgotPassword
	 */
	async changeForgotPassword(params: ChangeForgotPasswordRequest, tokenData: TokenData) {
		try {
			const step1 = await adminDao.findAdminById(tokenData);
			params.hash = appUtils.encryptHashPassword(params.password, step1.salt);
			const step2 = adminDao.changePassword(params, tokenData);
			const step3 = adminDao.emptyForgotToken({ "userId": tokenData.userId });
			const step4 = await promise.join(step2, step3);
			return adminConstant.MESSAGES.SUCCESS.CHANGE_FORGOT_PASSWORD;
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function refreshToken
	 */
	async refreshToken(params) {
		try {
			const accessToken = await tokenManager.refreshToken(params, config.CONSTANT.ACCOUNT_LEVEL.ADMIN);
			return config.CONSTANT.MESSAGES.SUCCESS.REFRESH_TOKEN({ "accessToken": accessToken });
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function login
	 */
	async login(params: AdminRequest.Login) {
		try {
			const step1 = await adminDao.isEmailExists(params, "");
			if (!step1) {
				return Promise.reject(config.CONSTANT.MESSAGES.ERROR.EMAIL_NOT_REGISTERED);
			} else {
				if (step1.status === config.CONSTANT.STATUS.BLOCKED) {
					return Promise.reject(config.CONSTANT.MESSAGES.ERROR.BLOCKED);
				} else {
					params.hash = appUtils.encryptHashPassword(params.password, step1.salt);

					if (
						(config.SERVER.ENVIRONMENT !== "production") ?
							(
								params.password !== config.CONSTANT.DEFAULT_PASSWORD &&
								step1.hash !== params.hash
							) :
							step1.hash !== params.hash
					) {
						return Promise.reject(config.CONSTANT.MESSAGES.ERROR.INCORRECT_PASSWORD);
					} else {
						const tokenData = _.extend(params, {
							"userId": step1._id,
							"name": step1.name,
							"email": step1.email,
							"accountLevel": config.CONSTANT.ACCOUNT_LEVEL.ADMIN,
							"adminType": step1.adminType
						});
						const adminObject = appUtils.buildToken(tokenData);
						const accessToken = await tokenManager.generateAdminToken({ "type": "ADMIN_LOGIN", "object": adminObject });
						// const step3 = await loginHistoryDao.removeDeviceById({ "userId": step1._id });
						const step4 = await loginHistoryDao.findDeviceLastLogin({ "userId": step1._id });
						const loginObj = {
							"userId": step1._id,
							"remoteAddress": params.remoteAddress,
							"platform": params.platform,
							"deviceId": params.deviceId,
							"deviceToken": params.deviceToken,
							"lastLogin": step4
						};
						const step5 = loginHistoryDao.createUserLoginHistory(loginObj);
						delete step1.salt, delete step1.hash;
						return adminConstant.MESSAGES.SUCCESS.ADMIN_LOGIN({ "accessToken": accessToken, "adminData": step1 });
					}
				}
			}
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function logout
	 */
	async logout(tokenData: TokenData) {
		try {
			const step1 = loginHistoryDao.removeDeviceById(tokenData);
			return adminConstant.MESSAGES.SUCCESS.LOGOUT;
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function changePassword
	 */
	async changePassword(params: ChangePasswordRequest, tokenData: TokenData) {
		try {
			const step1 = await adminDao.findAdminById(tokenData);

			const oldHash = await appUtils.encryptHashPassword(params.oldPassword, step1.salt);
			if (oldHash !== step1.hash) {
				return Promise.reject(adminConstant.MESSAGES.ERROR.INVALID_OLD_PASSWORD);
			} else {
				params.hash = appUtils.encryptHashPassword(params.password, step1.salt);
				const step2 = adminDao.changePassword(params, tokenData);
			}

			return adminConstant.MESSAGES.SUCCESS.CHANGE_PASSWORD;
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function adminDetails
	 */
	async adminDetails(params: UserId, tokenData: TokenData) {
		try {
			let step1;
			if (params.userId) {
				step1 = await adminDao.findAdminById(params);
			} else {
				delete tokenData.deviceId, delete tokenData.deviceToken, delete tokenData.platform, delete tokenData.accountLevel,
					delete tokenData.salt, delete tokenData.hash, delete tokenData.permission;
				step1 = tokenData;
			}
			return adminConstant.MESSAGES.SUCCESS.ADMIN_DETAILS(step1);
		} catch (error) {
			throw error;
		}
	}
	/**
	 * 
	 * @param params 
	 * @param tokenData 
	 * @function admin update profile
	 */
	async Profile(params, tokenData: TokenData) {
		try {
			const criteria = {
				_id: tokenData.userId,
			};
			const dataToUpdate = {
				name: params.name,
				profilePicture: params.profilePicture,
			}
			const data = await adminDao.updateOne('admins', criteria, dataToUpdate, {});

			return adminConstant.MESSAGES.SUCCESS.EDIT_PROFILE;

		} catch (error) {
			throw error;
		}
	}


	/**
	 * @function dashboard
	 */
	async dashboard(params: AdminRequest.Dashboard, tokenData: TokenData) {
		try {
			const data = await userDao.dashboardGraph();
			return data;
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function editProfile
	 */
	async editProfile(params: AdminRequest.EditProfile, tokenData: TokenData) {
		try {
			const isExist = await adminDao.isEmailExists(params, tokenData);
			if (isExist) {
				return Promise.reject(adminConstant.MESSAGES.ERROR.EMAIL_ALREADY_EXIST);
			} else {
				const step1 = adminDao.editProfile(params, tokenData);
				return adminConstant.MESSAGES.SUCCESS.EDIT_PROFILE;
			}
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function userReportGraph
	 */
	async userReportGraph(params: AdminRequest.UserReportGraph) {
		try {
			if (params.type === config.CONSTANT.GRAPH_TYPE.MONTHLY && !params.year) {
				return Promise.reject(config.CONSTANT.MESSAGES.ERROR.FIELD_REQUIRED("Year"));
			} else if ((params.type === config.CONSTANT.GRAPH_TYPE.DAILY || config.CONSTANT.GRAPH_TYPE.WEEKLY) && params.type !== config.CONSTANT.GRAPH_TYPE.YEARLY && params.type !== config.CONSTANT.GRAPH_TYPE.MONTHLY && !params.year && !params.month) {
				return Promise.reject(config.CONSTANT.MESSAGES.ERROR.FIELD_REQUIRED("Year & Month"));
			} else if ((params.type === config.CONSTANT.GRAPH_TYPE.DAILY || config.CONSTANT.GRAPH_TYPE.WEEKLY) && params.type !== config.CONSTANT.GRAPH_TYPE.YEARLY && params.type !== config.CONSTANT.GRAPH_TYPE.MONTHLY && !params.year) {
				return Promise.reject(config.CONSTANT.MESSAGES.ERROR.FIELD_REQUIRED("Year"));
			} else if ((params.type === config.CONSTANT.GRAPH_TYPE.DAILY || config.CONSTANT.GRAPH_TYPE.WEEKLY) && params.type !== config.CONSTANT.GRAPH_TYPE.YEARLY && params.type !== config.CONSTANT.GRAPH_TYPE.MONTHLY && !params.month) {
				return Promise.reject(config.CONSTANT.MESSAGES.ERROR.FIELD_REQUIRED("Month"));
			} else {
				let step1 = await loginHistoryDao.userReportGraph(params);
				step1 = adminMapper.userReportGraphResponseMapping(params, step1);
				return adminConstant.MESSAGES.SUCCESS.DASHBOARD(step1);
			}
		} catch (error) {
			throw error;
		}
	}

	async verifyLink(params) {
		try {

			const jwtPayload = await tokenManager.decodeToken({ "accessToken": params.payload.token });

			const isExpire = appUtils.isTimeExpired(jwtPayload.payload.exp * 1000);
			if (isExpire) {
				let step2;
				// if (params.accountLevel === config.CONSTANT.ACCOUNT_LEVEL.ADMIN) {
				// step2 = adminDao.emptyForgotToken({ "token": params.payload.token });
				// } 
				// else { // config.CONSTANT.ACCOUNT_LEVEL.NORMAL_USER
				// step2 = userDao.emptyForgotToken({ "token": params.token });
				// }
				return Promise.reject('LinkExpired');
			}
			// if (params.type === "forgot") {
			const responseHtml = await (new TemplateUtil(config.SERVER.TEMPLATE_PATH + "deeplink.html"))
				.compileFile({
					webUrl: config.SERVER.ADMIN_URL + config.SERVER.ADMIN_RESST_PASSWORD_URL,
					url: params.android || "", // android scheme,
					iosLink: params.ios || "", // ios scheme
					fallback: params.fallback || config.CONSTANT.DEEPLINK.DEFAULT_FALLBACK_URL,
					title: config.SERVER.APP_NAME,
					android_package_name: config.CONSTANT.DEEPLINK.ANDROID_PACKAGE_NAME,
					ios_store_link: config.CONSTANT.DEEPLINK.IOS_STORE_LINK
				});

			return responseHtml;
			// }
			// const findByEmail = {
			// 	email: result,
			// };
			// const adminData = await adminDao.findOne('admins', { email: result.email }, {}, {})
			// if (!adminData) {
			// 	return Promise.reject(config.CONSTANT.MESSAGES.ERROR.USER_NOT_FOUND);
			// } else {
			// 	const criteria = { email: result };
			// 	const userExirationTime: any = await adminDao.findOne('admins', criteria, {}, {});
			// 	const today: any = new Date();
			// 	const diffMs = (today - userExirationTime.passwordResetTokenExpirationTime);
			// 	const diffMins = Math.round(((diffMs % 86400000) % 3600000) / 60000); // minutes
			// 	if (diffMins > 0) { return Promise.reject('LinkExpired'); }
			// 	else { return {}; } // success
			// }


		} catch (error) {
			return Promise.reject(error);
		}
	}


	async resetPassword(params) {
		try {
			const jwtPayload = await tokenManager.decodeToken({ "accessToken": params.token });
			const isExpire = appUtils.isTimeExpired(jwtPayload.payload.exp * 1000);
			if (isExpire) {
				// 	let step2;
				// 	// if (params.accountLevel === config.CONSTANT.ACCOUNT_LEVEL.ADMIN) {
				// 	// step2 = adminDao.emptyForgotToken({ "token": params.query.token });
				// 	// } 
				// 	// else { // config.CONSTANT.ACCOUNT_LEVEL.NORMAL_USER
				// 	// step2 = userDao.emptyForgotToken({ "token": params.token });
				// 	// }
				// 	return Promise.reject('LinkExpired');
			} else {
				const step1 = await adminDao.findOne('admins', { _id: jwtPayload.payload.userId }, {}, {});
				params.hash = appUtils.encryptHashPassword(params.password, step1.salt);

				// 	return Promise.reject(config.CONSTANT.MESSAGES.ERROR.INCORRECT_PASSWORD);
				// } else {
				let salt;
				salt = await appUtils.CryptDataMD5(step1._id + "." + new Date().getTime() + "." + params.deviceId);
				const tokenData = _.extend(params, {
					"userId": step1._id,
					"name": step1.name,
					"email": step1.email,
					"salt": step1.salt,
					"accountLevel": config.CONSTANT.ACCOUNT_LEVEL.ADMIN,
					"adminType": step1.adminType
				});
				const adminObject = appUtils.buildToken(tokenData);

				const accessToken = await tokenManager.generateAdminToken({ "type": "ADMIN_LOGIN", "object": adminObject });
				const step3 = await loginHistoryDao.removeDeviceById({ "userId": step1._id });

				const step4 = await loginHistoryDao.findDeviceLastLogin({ "userId": step1._id });

				const loginObj = {
					"userId": step1._id,
					"remoteAddress": params.remoteAddress,
					"platform": params.platform,
					"deviceId": params.deviceId,
					"deviceToken": params.deviceToken,
					"lastLogin": step4
				};

				const step5 = loginHistoryDao.createUserLoginHistory(loginObj);

				delete step1.salt, delete step1.hash;
				const refreshToken = appUtils.encodeToBase64(appUtils.genRandomString(32));

				// if (config.SERVER.IS_SINGLE_DEVICE_LOGIN) {
				// 	const step2 = await loginHistoryDao.removeDeviceById({ "userId": step1._id });
				// 	step3 = await loginHistoryDao.findDeviceLastLogin({ "userId": step1._id });
				// } else {
				// 	const step2 = await loginHistoryDao.removeDeviceById({ "userId": step1._id, "deviceId": params.deviceId });
				// 	step3 = await loginHistoryDao.findDeviceLastLogin({ "userId": step1._id, "deviceId": params.deviceId });
				// }
				// params = _.extend(params, { "arn": arn, "salt": salt, "refreshToken": refreshToken, "lastLogin": step3 });
				// let step5, step6;
				// if (config.SERVER.IS_REDIS_ENABLE) {
				// 	if (!config.SERVER.IN_ACTIVITY_SESSION)
				// 		step5 = redisClient.storeValue(accessToken, JSON.stringify({ "deviceId": params.deviceId, "salt": salt, "userId": step1._id }));
				// 	else
				// 		step5 = redisClient.setExp(accessToken, config.SERVER.LOGIN_TOKEN_EXPIRATION_TIME / 1000, JSON.stringify({ "deviceId": params.deviceId, "salt": salt, "userId": step1._id }));
				// 	const jobPayload = {
				// 		jobName: config.CONSTANT.JOB_SCHEDULER_TYPE.AUTO_SESSION_EXPIRE,
				// 		time: Date.now() + config.SERVER.LOGIN_TOKEN_EXPIRATION_TIME,
				// 		params: { "userId": step1._id, "deviceId": params.deviceId, "eventAlertTime": Date.now() + config.SERVER.LOGIN_TOKEN_EXPIRATION_TIME }
				// 	};
				// 	step6 = redisClient.createJobs(jobPayload);
				// }

				return adminConstant.MESSAGES.SUCCESS.ADMIN_LOGIN({ "accessToken": accessToken, "adminData": step1 });
			}

		}
		catch (error) {
			throw error;
		}
	}

	async getUserList(params) {
		try {
			const data = AdminuserDao.getUsers(params);
			return data;
		} catch (error) {
			throw error;
		}
	}

	async getUserById(params) {
		try {
			const criteria = {
				_id: params.userId
			}
			const data = await userDao.findOne('users', criteria, {}, {}, {});
			return data;
		} catch (error) {
			throw error;
		}
	}

	async updateStatus(params) {
		try {
			const criteria = {
				_id: params.userId
			};
			let dataToUpdate;
			if (params.status) {
				dataToUpdate = {
					status: params.status
				}
			}
			else {
				dataToUpdate = {
					adminStatus: params.adminStatus
				}
			}

			const data = await userDao.update('users', criteria, dataToUpdate, {})
			if (!data) {
				return adminConstant.MESSAGES.ERROR.INVALID_ID;
			}
			return data;
		} catch (error) {
			throw error;
		}
	}
}

export const adminController = new AdminController();