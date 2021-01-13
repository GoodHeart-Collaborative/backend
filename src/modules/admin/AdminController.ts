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
					// if (
					// 	(config.SERVER.ENVIRONMENT !== "production") ?
					// 		(
					// 			params.password !== config.CONSTANT.DEFAULT_PASSWORD &&
					// 			step1.hash !== params.hash
					// 		) :
					if (step1.hash !== params.hash) {
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
				// const step3 = loginHistoryDao.removeDeviceById()
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


	async verifyLink(params) {
		try {
			const jwtPayload = await tokenManager.decodeToken({ "accessToken": params.payload.token });

			const isExpire = appUtils.isTimeExpired(jwtPayload.payload.exp * 1000);
			if (isExpire) {
				let step2;
				step2 = adminDao.emptyForgotToken({ "token": params.payload.token });
				return Promise.reject('link-expired');
			}
			const criteriaToken = {
				email: jwtPayload.payload.email,
			};
			const getAdmindata = await adminDao.findAdminById({ userId: jwtPayload.payload.userId })
			if (getAdmindata.forgotToken !== params.payload.token || getAdmindata.forgotToken === "") {
				return Promise.reject('link-expired');
			}
			// const responseHtml = await (new TemplateUtil(config.SERVER.TEMPLATE_PATH + "deeplink.html"))
			// 	.compileFile({
			// 		webUrl: config.SERVER.ADMIN_URL + config.SERVER.ADMIN_RESST_PASSWORD_URL,
			// 		url: params.android || "", // android scheme,
			// 		iosLink: params.ios || "", // ios scheme
			// 		fallback: params.fallback || config.CONSTANT.DEEPLINK.DEFAULT_FALLBACK_URL,
			// 		title: config.SERVER.APP_NAME,
			// 		android_package_name: config.CONSTANT.DEEPLINK.ANDROID_PACKAGE_NAME,
			// 		ios_store_link: config.CONSTANT.DEEPLINK.IOS_STORE_LINK
			// 	});

			// return responseHtml;
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
				return Promise.reject('LinkExpired');
			} else {
				const step1 = await adminDao.findOne('admins', { _id: jwtPayload.payload.userId }, {}, {});
				// const step1 = await userDao.findOne('users', { forgotToken: params.accessToken }, {}, {})  //(tokenData);

				// if (!step1 || (step1 && step1.forgotToken === "") || !step1.forgotToken) {
				// 	return Promise.reject(userConstant.MESSAGES.ERROR.LINK_EXPIRED)
				// }

				// const oldHash = appUtils.encryptHashPassword(params.password, step1.salt);
				// if (oldHash !== step1.hash) {
				// 	return Promise.reject(userConstant.MESSAGES.ERROR.INVALID_OLD_PASSWORD);
				// } else {
				params.hash = appUtils.encryptHashPassword(params.password, step1.salt);
				const step2 = adminDao.changePassword(params, { userId: step1._id });
				const step3 = loginHistoryDao.removeDeviceById({ ...params, userId: step1._id });

				if (step2) {
					adminDao.emptyForgotToken({ "token": params.token });
				}
				return adminConstant.MESSAGES.SUCCESS.CHANGE_FORGOT_PASSWORD;
			}
		}
		catch (error) {
			throw error;
		}
	}

	async getUserList(params) {
		try {
			const data = userDao.getUsers(params);
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
			else if (params.isAdminRejected) {
				dataToUpdate = {
					isAdminVerified: false,
					isAdminRejected: params.isAdminRejected
				}
			}
			else if (params.isAdminVerified) {
				dataToUpdate = {
					isAdminRejected: false,
					isAdminVerified: params.isAdminVerified
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