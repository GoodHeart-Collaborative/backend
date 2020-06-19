"use strict";

import * as _ from "lodash";
import fs = require("fs");
import * as promise from "bluebird";

import * as appUtils from "@utils/appUtils";
import * as config from "@config/index";
import { contactDao } from "@modules/contact/v1/ContactDao";
import { logDao } from "@modules/log/LogDao";
import { loginHistoryDao } from "@modules/loginHistory/LoginHistoryDao";
import { mailManager, redisClient } from "@lib/index";
import { smsManager } from "@lib/SMSManager";
// import * as sns from "@lib/pushNotification/sns";
import * as tokenManager from "@lib/tokenManager";
import * as userConstant from "@modules/user/userConstant";
import { userDao } from "@modules/user/index";

export class UserController {

	/**
	 * @function signup
	 * @description if IS_REDIS_ENABLE set to true,
	 * than redisClient.storeList() function saves value in redis.
	 */
	async signup(params: UserRequest.Signup) {
		try {
			console.log('paramsparamsparamsparams', params);

			if (!params.email && (!params.countryCode || !params.mobileNo)) {
				return Promise.reject(userConstant.MESSAGES.ERROR.EMAIL_OR_PHONE_REQUIRED);
			} else {
				const step1 = await userDao.findUserByEmailOrMobileNo(params);
				console.log('step1step1step1step1step1', step1);
				if (step1) {
					if (step1.email === params.email && step1.isEmailVerified) {
						return Promise.reject(userConstant.MESSAGES.ERROR.EMAIL_ALREADY_EXIST);
					}
					if (step1.mobileNo === params.mobileNo && step1.isMobileVerified)
						return Promise.reject(userConstant.MESSAGES.ERROR.MOBILE_NO_ALREADY_EXIST);
				} else {
					const generateOtp = appUtils.generateOtp();
					params['mobileOtp'] = generateOtp;
					const step2 = await userDao.signup(params);
					console.log('step2step2step2step2step2', step2);

					const salt = await appUtils.CryptDataMD5(step2._id + "." + new Date().getTime() + "." + params.deviceId);
					console.log('saltsaltsaltsaltsaltsalt', salt);

					const tokenData = _.extend(params, {
						"userId": step2._id,
						"firstName": step2.firstName,
						"lastName": step2.lastName,
						"countryCode": step2.countryCode,
						"mobileNo": step2.mobileNo,
						"email": step2.email,
						"salt": salt,
						"accountLevel": config.CONSTANT.ACCOUNT_LEVEL.USER
					});
					console.log('tokenDatatokenDatatokenDatatokenDatatokenData', tokenData);

					const userObject = appUtils.buildToken(tokenData);
					console.log('userObjectuserObjectuserObjectuserObject', userObject);

					const accessToken = await tokenManager.generateUserToken({ "type": "USER_SIGNUP", "object": userObject, "salt": salt });
					console.log('accessTokenaccessTokenaccessTokenaccessToken', accessToken);
					// let arn;
					// if (params.platform === config.CONSTANT.DEVICE_TYPE.ANDROID) {
					// 	// arn = await sns.registerAndroidUser(params.deviceToken);
					// 	arn = "";
					// } else if (params.platform === config.CONSTANT.DEVICE_TYPE.IOS) {
					// 	// arn = await sns.registerIOSUser(params.deviceToken);
					// 	arn = "";
					// }
					const refreshToken = appUtils.encodeToBase64(appUtils.genRandomString(32));
					console.log('refreshTokenrefreshTokenrefreshToken', refreshToken);

					params = _.extend(params, { "salt": salt, "refreshToken": refreshToken, "lastLogin": Date.now() });
					console.log('paramsparamsparamsparams', params);

					const step6 = await loginHistoryDao.createUserLoginHistory(params);
					console.log('step6step6step6step6step6step6', step6);

					let step7, step8;
					// if (config.SERVER.IS_REDIS_ENABLE) {
					// 	if (!config.SERVER.IN_ACTIVITY_SESSION)
					// 		step7 = redisClient.storeValue(accessToken, JSON.stringify({ "deviceId": params.deviceId, "salt": salt, "userId": step2._id }));
					// 	else
					// 		step7 = redisClient.setExp(accessToken, config.SERVER.LOGIN_TOKEN_EXPIRATION_TIME / 1000, JSON.stringify({ "deviceId": params.deviceId, "salt": salt, "userId": step2._id }));
					// 	const jobPayload = {
					// 		jobName: config.CONSTANT.JOB_SCHEDULER_TYPE.AUTO_SESSION_EXPIRE,
					// 		time: Date.now() + config.SERVER.LOGIN_TOKEN_EXPIRATION_TIME,
					// 		params: { "userId": step2._id, "deviceId": params.deviceId, "eventAlertTime": Date.now() + config.SERVER.LOGIN_TOKEN_EXPIRATION_TIME }
					// 	};
					// 	step8 = redisClient.createJobs(jobPayload);
					// }
					const step9 = await promise.join(step6, step7, step8);
					console.log('step9step9step9step9', step9);


					let body = userConstant.MESSAGES.OTP_TEXT(generateOtp);
					// smsManager.sendMessageViaAWS(params.countryCode, params.mobileNo, body);

					// let userResponse = appUtils.formatUserData(updateUserQr);
					return userConstant.MESSAGES.SUCCESS.SIGNUP({ "accessToken": accessToken, "refreshToken": refreshToken });
				}
			}
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function login
	 * @description if IS_REDIS_ENABLE set to true,
	 * than redisClient.storeList() function saves value in redis.
	 */
	async login(params: UserRequest.Login) {
		try {
			if (!params.email && (!params.countryCode || !params.mobileNo)) {
				return Promise.reject(userConstant.MESSAGES.ERROR.EMAIL_OR_PHONE_REQUIRED);
			} else {
				const step1 = await userDao.findUserByEmailOrMobileNo(params);
				if (!step1) {
					if (params.email) {
						return Promise.reject(config.CONSTANT.MESSAGES.ERROR.EMAIL_NOT_REGISTERED);
					}
					if (params.mobileNo && !params.isMobileVerified)
						return Promise.reject(userConstant.MESSAGES.ERROR.MOBILE_NO_NOT_REGISTERED);
				} else {
					if (step1.status === config.CONSTANT.STATUS.BLOCKED) {
						return Promise.reject(config.CONSTANT.MESSAGES.ERROR.BLOCKED);
					}
					if (params.email && !params.isEmailVerified) {
						return Promise.reject(config.CONSTANT.MESSAGES.ERROR.EMAIL_NOT_VERIFIED);
					}
					if (params.email && !params.isMobileVerified) {
						return Promise.reject(config.CONSTANT.MESSAGES.ERROR.MOBILE_NOT_VERIFIED)
					}
					else {
						let salt, accessToken;
						if (!step1.hash) {
							return Promise.reject(config.CONSTANT.MESSAGES.ERROR.INCORRECT_PASSWORD);
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
								salt = await appUtils.CryptDataMD5(step1._id + "." + new Date().getTime() + "." + params.deviceId);
								const tokenData = _.extend(params, {
									"userId": step1._id,
									"firstName": step1.firstName,
									"lastName": step1.lastName,
									"email": step1.email,
									"countryCode": step1.countryCode,
									"mobileNo": step1.mobileNo,
									"salt": salt,
									"accountLevel": config.CONSTANT.ACCOUNT_LEVEL.USER
								});
								const userObject = appUtils.buildToken(tokenData);
								accessToken = await tokenManager.generateUserToken({ "type": "USER_LOGIN", "object": userObject, "salt": salt });
							}
						}
						let arn;
						if (params.platform === config.CONSTANT.DEVICE_TYPE.ANDROID) {
							// arn = await sns.registerAndroidUser(params.deviceToken);
							arn = "";
						} else if (params.platform === config.CONSTANT.DEVICE_TYPE.IOS) {
							// arn = await sns.registerIOSUser(params.deviceToken);
							arn = "";
						}
						const refreshToken = appUtils.encodeToBase64(appUtils.genRandomString(32));
						let step3;
						if (config.SERVER.IS_SINGLE_DEVICE_LOGIN) {
							const step2 = await loginHistoryDao.removeDeviceById({ "userId": step1._id });
							step3 = await loginHistoryDao.findDeviceLastLogin({ "userId": step1._id });
						} else {
							const step2 = await loginHistoryDao.removeDeviceById({ "userId": step1._id, "deviceId": params.deviceId });
							step3 = await loginHistoryDao.findDeviceLastLogin({ "userId": step1._id, "deviceId": params.deviceId });
						}
						params = _.extend(params, { "arn": arn, "salt": salt, "refreshToken": refreshToken, "lastLogin": step3 });
						const step4 = loginHistoryDao.createUserLoginHistory(params);
						let step5, step6;
						if (config.SERVER.IS_REDIS_ENABLE) {
							if (!config.SERVER.IN_ACTIVITY_SESSION)
								step5 = redisClient.storeValue(accessToken, JSON.stringify({ "deviceId": params.deviceId, "salt": salt, "userId": step1._id }));
							else
								step5 = redisClient.setExp(accessToken, config.SERVER.LOGIN_TOKEN_EXPIRATION_TIME / 1000, JSON.stringify({ "deviceId": params.deviceId, "salt": salt, "userId": step1._id }));
							const jobPayload = {
								jobName: config.CONSTANT.JOB_SCHEDULER_TYPE.AUTO_SESSION_EXPIRE,
								time: Date.now() + config.SERVER.LOGIN_TOKEN_EXPIRATION_TIME,
								params: { "userId": step1._id, "deviceId": params.deviceId, "eventAlertTime": Date.now() + config.SERVER.LOGIN_TOKEN_EXPIRATION_TIME }
							};
							step6 = redisClient.createJobs(jobPayload);
						}
						const step7 = await promise.join(step4, step5, step6);
						return userConstant.MESSAGES.SUCCESS.LOGIN({ "accessToken": accessToken, "refreshToken": refreshToken });
					}
				}
			}
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function socialLogin
	 * @description if IS_REDIS_ENABLE set to true,
	 * than redisClient.storeList() function saves value in redis.
	 */
	async socialLogin(params: UserRequest.SocialLogin) {
		try {
			const step1 = await userDao.checkSocialId(params);
			if (!step1) {
				return Promise.reject(userConstant.MESSAGES.ERROR.SOCIAL_ACCOUNT_ALREADY_EXIST);
			} else {
				if (step1.status === config.CONSTANT.STATUS.BLOCKED) {
					return Promise.reject(config.CONSTANT.MESSAGES.ERROR.BLOCKED);
				} else {
					const salt = await appUtils.CryptDataMD5(step1._id + "." + new Date().getTime() + "." + params.deviceId);
					const tokenData = _.extend(params, {
						"userId": step1._id,
						"firstName": step1.firstName,
						"lastName": step1.lastName,
						"email": step1.email,
						"countryCode": step1.countryCode,
						"mobileNo": step1.mobileNo,
						"salt": salt,
						"accountLevel": config.CONSTANT.ACCOUNT_LEVEL.USER
					});
					const userObject = appUtils.buildToken(tokenData);
					const accessToken = await tokenManager.generateUserToken({ "type": "USER_LOGIN", "object": userObject, "salt": salt });
					let arn;
					if (params.platform === config.CONSTANT.DEVICE_TYPE.ANDROID) {
						// arn = await sns.registerAndroidUser(params.deviceToken);
						arn = "";
					} else if (params.platform === config.CONSTANT.DEVICE_TYPE.IOS) {
						// arn = await sns.registerIOSUser(params.deviceToken);
						arn = "";
					}
					const refreshToken = appUtils.encodeToBase64(appUtils.genRandomString(32));
					let step3;
					if (config.SERVER.IS_SINGLE_DEVICE_LOGIN) {
						const step2 = await loginHistoryDao.removeDeviceById({ "userId": step1._id });
						step3 = await loginHistoryDao.findDeviceLastLogin({ "userId": step1._id });
					} else {
						const step2 = await loginHistoryDao.removeDeviceById({ "userId": step1._id, "deviceId": params.deviceId });
						step3 = await loginHistoryDao.findDeviceLastLogin({ "userId": step1._id, "deviceId": params.deviceId });
					}
					params = _.extend(params, { "arn": arn, "salt": salt, "refreshToken": refreshToken, "lastLogin": step3 });
					const step4 = loginHistoryDao.createUserLoginHistory(params);
					let step5, step6;
					if (config.SERVER.IS_REDIS_ENABLE) {
						if (!config.SERVER.IN_ACTIVITY_SESSION)
							step5 = redisClient.storeValue(accessToken, JSON.stringify({ "deviceId": params.deviceId, "salt": salt, "userId": step1._id }));
						else
							step5 = redisClient.setExp(accessToken, config.SERVER.LOGIN_TOKEN_EXPIRATION_TIME / 1000, JSON.stringify({ "deviceId": params.deviceId, "salt": salt, "userId": step1._id }));
						const jobPayload = {
							jobName: config.CONSTANT.JOB_SCHEDULER_TYPE.AUTO_SESSION_EXPIRE,
							time: Date.now() + config.SERVER.LOGIN_TOKEN_EXPIRATION_TIME,
							params: { "userId": step1._id, "deviceId": params.deviceId, "eventAlertTime": Date.now() + config.SERVER.LOGIN_TOKEN_EXPIRATION_TIME }
						};
						step6 = redisClient.createJobs(jobPayload);
					}
					const step7 = await promise.join(step4, step5, step6);
					return userConstant.MESSAGES.SUCCESS.LOGIN({ "accessToken": accessToken, "refreshToken": refreshToken });
				}
			}
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function socialSignup
	 * @description if IS_REDIS_ENABLE set to true,
	 * than redisClient.storeList() function saves value in redis.
	 */
	async socialSignup(params: UserRequest.SocialSignup) {
		try {
			if (!params.email && (!params.countryCode || !params.mobileNo)) {
				return Promise.reject(userConstant.MESSAGES.ERROR.EMAIL_OR_PHONE_REQUIRED);
			} else {
				const step1 = await userDao.findUserByEmailOrMobileNo(params);
				if (step1 && !step1.isGoogleLogin && !step1.isFacebookLogin) {
					if (step1.email === params.email) {
						return Promise.reject(userConstant.MESSAGES.ERROR.EMAIL_ALREADY_EXIST);
					} else {
						return Promise.reject(userConstant.MESSAGES.ERROR.MOBILE_NO_ALREADY_EXIST);
					}
				} else {
					const step2 = await userDao.socialSignup(params);
					const salt = await appUtils.CryptDataMD5(step2._id + "." + new Date().getTime() + "." + params.deviceId);
					const tokenData = _.extend(params, {
						"userId": step2._id,
						"firstName": step2.firstName,
						"middleName": step2.middleName,
						"lastName": step2.lastName,
						"email": step2.email,
						"countryCode": step2.countryCode,
						"mobileNo": step2.mobileNo,
						"salt": salt,
						"accountLevel": config.CONSTANT.ACCOUNT_LEVEL.USER
					});
					const userObject = appUtils.buildToken(tokenData); // build token data for generating access token
					const accessToken = await tokenManager.generateUserToken({ "type": "USER_LOGIN", "object": userObject, "salt": salt });
					let arn;
					if (params.platform === config.CONSTANT.DEVICE_TYPE.ANDROID) {
						// arn = await sns.registerAndroidUser(params.deviceToken);
						arn = "";
					} else if (params.platform === config.CONSTANT.DEVICE_TYPE.IOS) {
						// arn = await sns.registerIOSUser(params.deviceToken);
						arn = "";
					}
					const refreshToken = appUtils.encodeToBase64(appUtils.genRandomString(32));
					params = _.extend(params, { "arn": arn, "salt": salt, "refreshToken": refreshToken, "lastLogin": Date.now() });
					const step3 = loginHistoryDao.createUserLoginHistory(params);
					let step4, step5;
					if (config.SERVER.IS_REDIS_ENABLE) {
						if (!config.SERVER.IN_ACTIVITY_SESSION)
							step4 = redisClient.storeValue(accessToken, JSON.stringify({ "deviceId": params.deviceId, "salt": salt, "userId": step2._id }));
						else
							step4 = redisClient.setExp(accessToken, config.SERVER.LOGIN_TOKEN_EXPIRATION_TIME / 1000, JSON.stringify({ "deviceId": params.deviceId, "salt": salt, "userId": step2._id }));
						const jobPayload = {
							jobName: config.CONSTANT.JOB_SCHEDULER_TYPE.AUTO_SESSION_EXPIRE,
							time: Date.now() + config.SERVER.LOGIN_TOKEN_EXPIRATION_TIME,
							params: { "userId": step2._id, "deviceId": params.deviceId, "eventAlertTime": Date.now() + config.SERVER.LOGIN_TOKEN_EXPIRATION_TIME }
						};
						step5 = redisClient.createJobs(jobPayload);
					}
					const step6 = await promise.join(step3, step4, step5);
					return userConstant.MESSAGES.SUCCESS.LOGIN({ "accessToken": accessToken, "refreshToken": refreshToken });
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
			if (!params.email && (!params.countryCode || !params.mobileNo)) {
				return Promise.reject(userConstant.MESSAGES.ERROR.EMAIL_OR_PHONE_REQUIRED);
			} else {
				const step1 = await userDao.findUserByEmailOrMobileNo(params);
				if (!step1) {
					if (params.email) {
						return Promise.reject(config.CONSTANT.MESSAGES.ERROR.EMAIL_NOT_REGISTERED);
					} else {
						return Promise.reject(userConstant.MESSAGES.ERROR.MOBILE_NO_NOT_REGISTERED);
					}
				} else {
					if (step1.isGoogleLogin || step1.isFacebookLogin) {
						return Promise.reject(userConstant.MESSAGES.ERROR.CANNOT_CHANGE_PASSWORD);
					} else {
						const tokenData = _.extend(params, {
							"userId": step1._id,
							"name": step1.name,
							"email": step1.email,
							"countryCode": step1.countryCode,
							"mobileNo": step1.mobileNo,
							"accountLevel": config.CONSTANT.ACCOUNT_LEVEL.USER
						});
						const userObject = appUtils.buildToken(tokenData); // build token data for generating access token
						const accessToken = await tokenManager.generateUserToken({ type: "FORGOT_PASSWORD", object: userObject });
						if (params.email) {
							const step2 = userDao.addForgotToken({ "userId": step1._id, "forgotToken": accessToken }); // add forgot token
							const step3 = mailManager.forgotPasswordEmailToUser({ "email": params.email, "firstName": step1.firstName, "middleName": step1.middleName, "lastName": step1.lastName, "accessToken": accessToken });
							return userConstant.MESSAGES.SUCCESS.FORGOT_PASSWORD_ON_EMAIL;
						} else {
							const step2 = smsManager.sendForgotPasswordLink(params.countryCode, params.mobileNo, accessToken);
							return userConstant.MESSAGES.SUCCESS.FORGOT_PASSWORD_ON_PHONE;
						}
					}
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
			const step1 = await userDao.findUserById(tokenData); // get user details
			params.hash = appUtils.encryptHashPassword(params.password, step1.salt); // generate hash
			const step2 = userDao.changeForgotPassword(params, tokenData);
			const step3 = userDao.emptyForgotToken({ "userId": tokenData.userId });
			const step4 = await promise.join(step2, step3);
			return userConstant.MESSAGES.SUCCESS.CHANGE_FORGOT_PASSWORD;
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function refreshToken
	 */
	async refreshToken(params: RefreshTokenRequest, tokenData: TokenData) {
		try {
			if (!params.refreshToken) {
				return Promise.reject(userConstant.MESSAGES.ERROR.REFRESH_TOKEN_REQUIRED);
			} else {
				const step1 = await loginHistoryDao.findDeviceById(tokenData);
				if (step1.refreshToken !== params.refreshToken) {
					return Promise.reject(userConstant.MESSAGES.ERROR.INVALID_REFRESH_TOKEN);
				} else {
					const accessToken = tokenManager.refreshToken({ "object": tokenData, "salt": step1 ? step1.salt : config.SERVER.JWT_CERT_KEY }, config.CONSTANT.ACCOUNT_LEVEL.USER);
					const refreshToken = appUtils.encodeToBase64(appUtils.genRandomString(32));
					const step2 = loginHistoryDao.updateRefreshToken({
						"deviceId": tokenData.deviceId,
						"userId": tokenData.userId,
						"refreshToken": refreshToken
					});
					const step3 = await promise.join(accessToken, step2);
					return config.CONSTANT.MESSAGES.SUCCESS.REFRESH_TOKEN({ "accessToken": step3[0], "refreshToken": refreshToken });
				}
			}
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function logout
	 */
	async logout(params: Device, tokenData: TokenData) {
		try {
			let step1;
			if (config.SERVER.IS_SINGLE_DEVICE_LOGIN) {
				step1 = loginHistoryDao.removeDeviceById(tokenData);
			} else {
				step1 = loginHistoryDao.removeDeviceById(tokenData);
			}
			let step2;
			if (config.SERVER.IS_REDIS_ENABLE) {
				step2 = redisClient.deleteKey(params.accessToken);
			}
			const step3 = await promise.join(step1, step2);
			return userConstant.MESSAGES.SUCCESS.LOGOUT;
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function deleteUser
	 * @description if IS_REDIS_ENABLE set to true,
	 * than redisClient.storeSet() function saves value in redis.
	 */
	async deleteUser(params: UserId, tokenData: TokenData) {
		try {
			if (
				tokenData.adminType === config.CONSTANT.ADMIN_TYPE.SUPER_ADMIN ||
				tokenData.permission.indexOf("deconst e_user") !== -1
			) {
				// const step1 = userDao.deleteUser(params);
				// store deconst ed_set as a key and userId as a value (redis SET)
				let step2;
				if (config.SERVER.IS_REDIS_ENABLE) {
					step2 = redisClient.storeSet("deconst ed_set", [params.userId]);
				}
				const step3 = contactDao.deleteContactOnRemoveAccount(params); // update contacts & to change isAppUser=false when the account is removed
				const step4 = loginHistoryDao.removeDeviceById({ "userId": params.userId });
				// const step5 = await promise.join(step1, step2, step3, step4);
				// const step6 = await logDao.deleteUser(step5[0], tokenData);
				return userConstant.MESSAGES.SUCCESS.DELETE_USER;
			} else {
				return Promise.reject(config.CONSTANT.MESSAGES.ERROR.UNAUTHORIZED_ACCESS);
			}
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function userDetails
	 */
	// async userDetails(params: UserId, tokenData: TokenData) {
	// 	try {
	// 		if (
	// 			tokenData.adminType === config.CONSTANT.ADMIN_TYPE.SUPER_ADMIN ||
	// 			tokenData.permission.indexOf("view_user") !== -1
	// 		) {
	// 			const step1 = await userDao.findUserById(params);
	// 			return userConstant.MESSAGES.SUCCESS.USER_DETAILS(step1);
	// 		} else {
	// 			return Promise.reject(config.CONSTANT.MESSAGES.ERROR.UNAUTHORIZED_ACCESS);
	// 		}
	// 	} catch (error) {
	// 		throw error;
	// 	}
	// }

	/**
	 * @function profile
	 */
	async profile(tokenData: TokenData) {
		try {
			delete tokenData.deviceId, delete tokenData.deviceToken, delete tokenData.platform, delete tokenData.accountLevel;
			return userConstant.MESSAGES.SUCCESS.PROFILE(tokenData);
		} catch (error) {
			throw error;
		}
	}

	async resendOtp(params: UserRequest.SendOtp) {
		try {
			const criteria = {
				countryCode: params.countryCode,
				mobileNo: params.mobileNo,
			};
			const findByMobile = await userDao.findOne('users', criteria, {}, {}, {});
			if (!findByMobile) {
				return userConstant.MESSAGES.ERROR.MOBILE_NO_NOT_REGISTERED;
			}
			const generateOtp = appUtils.generateOtp();
			const dataToUpdate = {
				mobileOtp: generateOtp
			}
			const updateOTP = await userDao.updateOne('users', findByMobile._id, dataToUpdate, {});
			let body = userConstant.MESSAGES.OTP_TEXT(generateOtp);
			// smsManager.sendMessageViaAWS(params.countryCode, params.mobileNo, body);
			return;

		} catch (error) {
			return Promise.reject(error)
		}
	}


	async verifyOTP(params: UserRequest.verifyOTP) {
		try {
			if (config.SERVER.ENVIRONMENT !== "production") {
				const data = await userDao.checkOTP(params);
				if (data.mobileOtp === params.otp) {
					return userConstant.MESSAGES.SUCCESS.DEFAULT
				}
				return userConstant.MESSAGES.ERROR.OTP_NOT_MATCH;
			} else {
				if (params.otp === config.CONSTANT.BYPASS_OTP) {
					return userConstant.MESSAGES.SUCCESS.DEFAULT;
				}
			}

		} catch (error) {
			return Promise.reject(error)
		}
	}
}

export const userController = new UserController();