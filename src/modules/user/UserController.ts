"use strict";

import * as _ from "lodash";
import fs = require("fs");
import * as promise from "bluebird";

import * as appUtils from "@utils/appUtils";
import * as config from "@config/index";
import { contactDao } from "@modules/contact/ContactDao";
import { loginHistoryDao } from "@modules/loginHistory/LoginHistoryDao";
import { mailManager, redisClient } from "@lib/index";
import { smsManager } from "@lib/SMSManager";
// import * as sns from "@lib/pushNotification/sns";
import * as tokenManager from "@lib/tokenManager";
import * as userConstant from "@modules/user/userConstant";
import { userDao } from "@modules/user/index";
import { Types } from 'mongoose';
import { verifyToken } from '@lib/tokenManager';
import { Config } from "aws-sdk";
var ObjectID = require('mongodb').ObjectID;
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
				// const step1 = await userDao.findVerifiedEmailOrMobile(params)
				const step1 = await userDao.findUserByEmailOrMobileNo(params);
				console.log('step1step1step1step1step1>>>>>>>>LLLLLLLLLL', step1);
				if (step1) {
					console.log('q>>>>>>>>>>>>>>>');
					if (step1.mobileNo === params.mobileNo && step1.email === params.email && step1.isEmailVerified && step1.isMobileVerified) {
						return Promise.reject(userConstant.MESSAGES.ERROR.USER_ALREADY_EXIST);
					}
					if (step1.email === params.email) {
						console.log('LLLLLLLLLLL');
						return Promise.reject(userConstant.MESSAGES.ERROR.EMAIL_ALREADY_EXIST);
					}
					if (step1.mobileNo === params.mobileNo) {
						console.log('KKKKKKKKKKKKKKKKK');
						return Promise.reject(userConstant.MESSAGES.ERROR.MOBILE_NO_ALREADY_EXIST);
					}
				}
				const generateOtp = await appUtils.generateOtp();

				params['mobileOtp'] = generateOtp;

				const step2 = await userDao.signup(params);

				const salt = await appUtils.CryptDataMD5(step2._id + "." + new Date().getTime() + "." + params.deviceId);

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

				const userObject = appUtils.buildToken(tokenData);

				const accessToken = await tokenManager.generateUserToken({ "type": "USER_SIGNUP", "object": userObject, "salt": salt });
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


				console.log('step2._idstep2._idstep2._idstep2._id', step2._id);

				const step3 = mailManager.sendRegisterMailToUser({ "email": params.email, "firstName": params.firstName, "lastName": params.lastName, "token": accessToken, userId: step2._id });
				// let userResponse = appUtils.formatUserData(updateUserQr);
				return userConstant.MESSAGES.SUCCESS.SIGNUP({ "accessToken": accessToken, "refreshToken": refreshToken, mobileNo: step2.mobileNo, countryCode: step2.countryCode });
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
			}
			else {
				const step1 = await userDao.findUserByEmailOrMobileNo(params);
				console.log('step1step1step1', step1);

				if (!step1) {
					if (params.email) {
						return Promise.reject(userConstant.MESSAGES.ERROR.EMAIL_NOT_REGISTERED);
					}
					if (params.mobileNo)
						return Promise.reject(userConstant.MESSAGES.ERROR.MOBILE_NO_NOT_REGISTERED);
				} else {
					if (step1 && step1.hash == null && !step1.hash) {
						return Promise.reject(userConstant.MESSAGES.ERROR.CANNOT_LOGIN);
					}
					params.hash = appUtils.encryptHashPassword(params.password, step1.salt);
					if (
						// (config.SERVER.ENVIRONMENT !== "production") ?
						// (
						// 	params.password !== config.CONSTANT.DEFAULT_PASSWORD &&
						// 	step1.hash !== params.hash
						// ) :
						step1.hash !== params.hash
					) {
						return Promise.reject(config.CONSTANT.MESSAGES.ERROR.INCORRECT_PASSWORD);
					}

					const step2 = await userDao.findVerifiedEmailOrMobile(params);

					const tokenData1 = {
						"userId": step1._id,
						"firstName": step1.firstName,
						"lastName": step1.lastName,
						"countryCode": step1.countryCode,
						"mobileNo": step1.mobileNo,
						"email": step1.email,
						"salt": step1.salt,
						"accountLevel": config.CONSTANT.ACCOUNT_LEVEL.USER
					}
					const tokenData = { ...params, ...tokenData1 };
					console.log('tokenDatatokenData', tokenData);

					const userObject = appUtils.buildToken(tokenData);
					const accessToken = await tokenManager.generateUserToken({ "type": "USER_LOGIN", "object": userObject, "salt": step1.salt });
					const step4 = loginHistoryDao.createUserLoginHistory(tokenData);


					if (params.email && !step2) {
						const step3 = mailManager.sendRegisterMailToUser({ "email": step1.email, "firstName": step1.firstName, "lastName": step1.lastName, "token": accessToken, userId: step1._id });
						return userConstant.MESSAGES.SUCCESS.EMAIL_NOT_VERIFIED({ profileStep: config.CONSTANT.HTTP_STATUS_CODE.EMAIL_NOT_VERIFIED, accessToken: '' })
					}
					if (params.mobileNo && !step2) {
						console.log('SEND_MESSAGE_HERE');
						return userConstant.MESSAGES.SUCCESS.MOBILE_NOT_VERIFIED({ profileStep: config.CONSTANT.HTTP_STATUS_CODE.MOBILE_NO_NOT_VERIFY, accessToken: '' })
					}

					console.log('accessTokenaccessTokenaccessToken', accessToken);

					if (step2.status === config.CONSTANT.STATUS.BLOCKED) {
						return Promise.reject(userConstant.MESSAGES.SUCCESS.BLOCKED({ profileStep: config.CONSTANT.HTTP_STATUS_CODE.BLOCKED_USER, accessToken: '' }));
					}
					if (step2.status === config.CONSTANT.STATUS.DELETED) {
						return Promise.reject(userConstant.MESSAGES.SUCCESS.DELETED({ profileStep: config.CONSTANT.HTTP_STATUS_CODE.BLOCKED_USER, accessToken: '' }));
					}
					else if (step2 && !step2.dob || !step2.dob == null && step2.industryType) {
						return userConstant.MESSAGES.SUCCESS.REGISTER_BDAY({ profileStep: config.CONSTANT.HTTP_STATUS_CODE.REGISTER_BDAY, accessToken: accessToken });
					}
					// else if (step2.isAdminRejected) {
					// 	return userConstant.MESSAGES.SUCCESS.ADMIN_REJECTED_USER_ACCOUNT({ profileStep: config.CONSTANT.HTTP_STATUS_CODE.ADMIN_REJECT_ACCOUNT, accessToken: '' });
					// }
					else if (step2.adminStatus === config.CONSTANT.USER_ADMIN_STATUS.REJECTED) {
						return Promise.reject(userConstant.MESSAGES.SUCCESS.ADMIN_REJECTED_USER_ACCOUNT({ profileStep: config.CONSTANT.HTTP_STATUS_CODE.ADMIN_REJECT_ACCOUNT, accessToken: '' }));
					}
					// else if (!step2.isAdminVerified) {
					// 	return userConstant.MESSAGES.SUCCESS.USER_ACCOUNT_SCREENING({ profileStep: config.CONSTANT.HTTP_STATUS_CODE.ADMIN_ACCOUNT_SCREENING, accessToken: '' });
					// }
					else if (step2.adminStatus === config.CONSTANT.USER_ADMIN_STATUS.PENDING) {
						console.log('333333333333');

						return Promise.reject(userConstant.MESSAGES.SUCCESS.USER_ACCOUNT_SCREENING({ profileStep: config.CONSTANT.HTTP_STATUS_CODE.ADMIN_ACCOUNT_SCREENING, accessToken: '' }));
					}
					else {
						console.log('iiiiiiiiiiiiu');

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
						params = _.extend(params, { "arn": arn, "salt": step1.salt, "refreshToken": refreshToken, "lastLogin": step3 });
						// const step4 = loginHistoryDao.createUserLoginHistory(params);
						let step5, step6;
						if (config.SERVER.IS_REDIS_ENABLE) {
							if (!config.SERVER.IN_ACTIVITY_SESSION)
								step5 = redisClient.storeValue(accessToken, JSON.stringify({ "deviceId": params.deviceId, "salt": step1.salt, "userId": step1._id }));
							else
								step5 = redisClient.setExp(accessToken, config.SERVER.LOGIN_TOKEN_EXPIRATION_TIME / 1000, JSON.stringify({ "deviceId": params.deviceId, "salt": step1.salt, "userId": step1._id }));
							const jobPayload = {
								jobName: config.CONSTANT.JOB_SCHEDULER_TYPE.AUTO_SESSION_EXPIRE,
								time: Date.now() + config.SERVER.LOGIN_TOKEN_EXPIRATION_TIME,
								params: { "userId": step1._id, "deviceId": params.deviceId, "eventAlertTime": Date.now() + config.SERVER.LOGIN_TOKEN_EXPIRATION_TIME }
							};
							step6 = redisClient.createJobs(jobPayload);
						}

						const step7 = await promise.join(step4, step5, step6);
						// const userData = { ...step1.isAppleLogin, ...step1.isMobileVerified, ...step1.isEmailVerified, ...step1.isFacebookLogin, ...step1.isGoogleLogin, ...step1.firstName, ...step1.lastName, ...step1.countryCode, ...step1.}
						delete step1['salt'];
						delete step1['hash'];
						delete step1['mobileOtp'];
						delete step1['forgotToken'];
						delete step1['isAdminRejected'];
						delete step1['isAdminVerified'];
						delete step1['adminStatus'];
						delete step1['forgotToken'];
						delete step1['fullMobileNo']
						delete step1['googleId'];
						delete step1['facebookId'];

						return userConstant.MESSAGES.SUCCESS.LOGIN({ profileStep: config.CONSTANT.HTTP_STATUS_CODE.LOGIN_STATUS_HOME_SCREEN, "accessToken": accessToken, "refreshToken": refreshToken, ...step1 });
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
			console.log('step1step1step1', step1);
			if (!step1) {
				return Promise.reject(userConstant.MESSAGES.ERROR.SOCIAL_ACCOUNT_NOT_REGISTERED);
			} else {

				//  if email unverifiec false hai to 411 de dena hai

				const tokenData = _.extend(params, {
					"userId": step1._id,
					"firstName": step1.firstName,
					"lastName": step1.lastName,
					"email": step1.email,
					"countryCode": step1.countryCode,
					"mobileNo": step1.mobileNo,
					"salt": step1.salt,
					"accountLevel": config.CONSTANT.ACCOUNT_LEVEL.USER
				});

				const userObject = appUtils.buildToken(tokenData);
				console.log('userObjectuserObject', userObject);

				const accessToken = await tokenManager.generateUserToken({ "type": "USER_LOGIN", "object": userObject, "salt": step1.salt });

				console.log('accessTokenaccessTokenaccessToken', accessToken);
				const step4 = loginHistoryDao.createUserLoginHistory(params);

				if (step1.status === config.CONSTANT.STATUS.BLOCKED) {
					return Promise.reject(userConstant.MESSAGES.SUCCESS.BLOCKED({ profileStep: config.CONSTANT.HTTP_STATUS_CODE.BLOCKED_USER, accessToken: '' }));
				}
				else if (step1.status === config.CONSTANT.STATUS.DELETED) {
					return Promise.reject(userConstant.MESSAGES.SUCCESS.BLOCKED({ profileStep: config.CONSTANT.HTTP_STATUS_CODE.BLOCKED_USER, accessToken: '' }));
				}
				// else if (step1.isAdminRejected) {
				// 	return userConstant.MESSAGES.SUCCESS.ADMIN_REJECTED_USER_ACCOUNT({ profileStep: config.CONSTANT.HTTP_STATUS_CODE.ADMIN_REJECT_ACCOUNT, accessToken: accessToken });
				// 	// return Promise.reject(userConstant.MESSAGES.ERROR.ADMIN_REJECTED_USER_ACCOUNT);
				// }
				if (!step1.isEmailVerified) {
					const step3 = mailManager.sendRegisterMailToUser({ "email": step1.email, "firstName": step1.firstName, "lastName": step1.lastName, "token": accessToken, userId: step1._id });
					return userConstant.MESSAGES.SUCCESS.EMAIL_NOT_VERIFIED({ profileStep: config.CONSTANT.HTTP_STATUS_CODE.EMAIL_NOT_VERIFIED, accessToken: '' })
				}

				else if (step1 && !step1.dob || !step1.dob == null && step1.industryType) {
					return userConstant.MESSAGES.SUCCESS.REGISTER_BDAY({ profileStep: config.CONSTANT.HTTP_STATUS_CODE.REGISTER_BDAY, accessToken: accessToken });
				}
				// else if (step1.isAdminRejected) {
				// 	return userConstant.MESSAGES.SUCCESS.ADMIN_REJECTED_USER_ACCOUNT({ profileStep: config.CONSTANT.HTTP_STATUS_CODE.ADMIN_REJECT_ACCOUNT, accessToken: '' });
				// }
				else if (step1.adminStatus == config.CONSTANT.USER_ADMIN_STATUS.REJECTED) {
					return Promise.reject(userConstant.MESSAGES.SUCCESS.ADMIN_REJECTED_USER_ACCOUNT({ profileStep: config.CONSTANT.HTTP_STATUS_CODE.ADMIN_REJECT_ACCOUNT, accessToken: '' }));
				}
				// else if (!step1.isAdminVerified) {
				// 	return userConstant.MESSAGES.SUCCESS.USER_ACCOUNT_SCREENING({ profileStep: config.CONSTANT.HTTP_STATUS_CODE.ADMIN_ACCOUNT_SCREENING, accessToken: '' });
				// }
				else if (step1.adminStatus == config.CONSTANT.USER_ADMIN_STATUS.PENDING) {
					return Promise.reject(userConstant.MESSAGES.SUCCESS.USER_ACCOUNT_SCREENING({ profileStep: config.CONSTANT.HTTP_STATUS_CODE.ADMIN_ACCOUNT_SCREENING, accessToken: '' }));
				}
				else {

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
					params = _.extend(params, { "arn": arn, "salt": step1.salt, "refreshToken": refreshToken, "lastLogin": step3 });
					let step5, step6;
					if (config.SERVER.IS_REDIS_ENABLE) {
						if (!config.SERVER.IN_ACTIVITY_SESSION)
							step5 = redisClient.storeValue(accessToken, JSON.stringify({ "deviceId": params.deviceId, "salt": step1.salt, "userId": step1._id }));
						else
							step5 = redisClient.setExp(accessToken, config.SERVER.LOGIN_TOKEN_EXPIRATION_TIME / 1000, JSON.stringify({ "deviceId": params.deviceId, "salt": step1.salt, "userId": step1._id }));
						const jobPayload = {
							jobName: config.CONSTANT.JOB_SCHEDULER_TYPE.AUTO_SESSION_EXPIRE,
							time: Date.now() + config.SERVER.LOGIN_TOKEN_EXPIRATION_TIME,
							params: { "userId": step1._id, "deviceId": params.deviceId, "eventAlertTime": Date.now() + config.SERVER.LOGIN_TOKEN_EXPIRATION_TIME }
						};
						step6 = redisClient.createJobs(jobPayload);
					}
					const step7 = await promise.join(step4, step5, step6);
					// return userConstant.MESSAGES.SUCCESS.LOGIN({ "accessToken": accessToken, "refreshToken": refreshToken });
					delete step1['salt'];
					delete step1['hash'];
					delete step1['mobileOtp'];
					delete step1['forgotToken'];
					delete step1['isAdminRejected'];
					delete step1['isAdminVerified'];
					delete step1['forgotToken'];
					delete step1['fullMobileNo']
					delete step1['googleId'];
					delete step1['facebookId'];
					return userConstant.MESSAGES.SUCCESS.LOGIN({ profileStep: config.CONSTANT.HTTP_STATUS_CODE.LOGIN_STATUS_HOME_SCREEN, "accessToken": accessToken, "refreshToken": refreshToken, ...step1 });

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
				const step = await userDao.checkSocialId(params);
				console.log('step1step1step1', step);
				if (step) {
					return Promise.reject(userConstant.MESSAGES.ERROR.SOCIAL_ACCOUNT_ALREADY_EXIST);
				}
				let step1 = await userDao.findUserByEmailOrMobileNo(params);

				if ((step1 && !step1.isGoogleLogin) || (step1 && !step1.isFacebookLogin) || (step1 && !step1.isAppleLogin)) {
					// if (params.socialLoginType === config.CONSTANT.SOCIAL_LOGIN_TYPE.FACEBOOK) {
					const mergeUser = await userDao.mergeAccountAndCheck(step1, params);
					// console.log('mergeUsermergeUsermergeUser', mergeUser);
				}
				let salt;
				if (!step1) {
					const newObjectId = new ObjectID();
					params['_id'] = newObjectId;
					console.log('paramsparams', params['_id']);
					salt = await appUtils.CryptDataMD5(params['_id'] + "." + new Date().getTime() + "." + params.deviceId);
					params['salt'] = salt;
					step1 = await userDao.socialSignup(params);
				}
				const tokenData = _.extend(params, {
					"userId": step1._id,
					"firstName": step1.firstName,
					"middleName": step1.middleName,
					"lastName": step1.lastName,
					"email": step1.email,
					"countryCode": step1.countryCode,
					"mobileNo": step1.mobileNo,
					"salt": step1.salt || salt,
					"accountLevel": config.CONSTANT.ACCOUNT_LEVEL.USER
				});
				console.log('tokenDatatokenDatatokenData', tokenData);

				const userObject = appUtils.buildToken(tokenData); // build token data for generating access token
				console.log('userObjectuserObjectuserObjectuserObject', userObject);

				const accessToken = await tokenManager.generateUserToken({ "type": "USER_LOGIN", "object": userObject, "salt": step1.salt || salt });
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
						step4 = redisClient.storeValue(accessToken, JSON.stringify({ "deviceId": params.deviceId, "salt": salt, "userId": step1._id }));
					else
						step4 = redisClient.setExp(accessToken, config.SERVER.LOGIN_TOKEN_EXPIRATION_TIME / 1000, JSON.stringify({ "deviceId": params.deviceId, "salt": salt, "userId": step1._id }));
					const jobPayload = {
						jobName: config.CONSTANT.JOB_SCHEDULER_TYPE.AUTO_SESSION_EXPIRE,
						time: Date.now() + config.SERVER.LOGIN_TOKEN_EXPIRATION_TIME,
						params: { "userId": step1._id, "deviceId": params.deviceId, "eventAlertTime": Date.now() + config.SERVER.LOGIN_TOKEN_EXPIRATION_TIME }
					};
					step5 = redisClient.createJobs(jobPayload);
				}
				const step6 = await promise.join(step3, step4, step5);
				return userConstant.MESSAGES.SUCCESS.LOGIN({ "accessToken": accessToken, "refreshToken": refreshToken, "countryCode": step1.countryCode, "mobileNo": step1.mobileNo });
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
				const step = await userDao.findUserByEmailOrMobileNo(params)
				console.log('stepstep', step);

				if (!step) {
					if (params.email) {
						return Promise.reject(config.CONSTANT.MESSAGES.ERROR.EMAIL_NOT_REGISTERED);
					} else {
						return Promise.reject(userConstant.MESSAGES.ERROR.MOBILE_NO_NOT_REGISTERED);
					}
				}
				const step1 = await userDao.findForGotVerifiedEmailOrMobile(params);
				console.log('step1step1', step1);

				if (!step1) {
					if (params.email) {
						return Promise.reject(userConstant.MESSAGES.ERROR.EMAIL_NOT_VERIFIED);
					} else {
						return Promise.reject(userConstant.MESSAGES.ERROR.MOBILE_NOT_VERIFIED);
					}
				}
				else {
					if ((step1.isGoogleLogin || step1.isFacebookLogin || step1.isAppleLogin) && !step1.hash) {
						return Promise.reject(userConstant.MESSAGES.ERROR.CANNOT_CHANGE_PASSWORD);
					}
					// else {
					const tokenData = _.extend(params, {
						"userId": step1._id,
						"countryCode": step1.countryCode,
						"mobileNo": step1.mobileNo,
						"accountLevel": config.CONSTANT.ACCOUNT_LEVEL.USER
					});
					const userObject = appUtils.buildToken(tokenData); // build token data for generating access token
					const accessToken = await tokenManager.generateUserToken({ type: "FORGOT_PASSWORD", object: userObject });
					if (params.email) {
						console.log('LLLLLLLLLLLLLLLLLLparams.emailparams.email');

						const step2 = userDao.addForgotToken({ "userId": step1._id, "forgotToken": accessToken }); // add forgot token
						const step3 = mailManager.forgotPasswordEmailToUser({ "email": params.email, "firstName": step1.firstName, "lastName": step1.lastName, "token": accessToken });
						return userConstant.MESSAGES.SUCCESS.FORGOT_PASSWORD_ON_EMAIL;
					} else {
						console.log('FOR_MOBILE_MESSAGE_OTP',);
						const step2 = smsManager.sendForgotPasswordLink(params.countryCode, params.mobileNo, accessToken);
						return userConstant.MESSAGES.SUCCESS.FORGOT_PASSWORD_ON_PHONE({});
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

	async updateProfile(params, userData) {
		try {
			const updateCriteria = {
				_id: userData.userId
			};
			const dataToUpdate = {
				...params
			}

			const data = await userDao.updateOne('users', updateCriteria, dataToUpdate, {});
			return {};
		} catch (error) {
			return Promise.reject(error);
		}
	}

	async resendOtp(params: UserRequest.SendOtp) {
		try {
			const criteria = {
				countryCode: params.countryCode,
				mobileNo: params.mobileNo,
			};
			const findByMobile = await userDao.findOne('users', criteria, {}, {}, {});
			console.log('findByMobilefindByMoblefindByMobile', findByMobile);
			if (!findByMobile) {
				return Promise.reject(userConstant.MESSAGES.ERROR.MOBILE_NO_NOT_REGISTERED);
			}
			const generateOtp = await appUtils.generateOtp();
			const dataToUpdate = {
				mobileOtp: generateOtp
			}
			const updateOTP = await userDao.updateOne('users', { _id: Types.ObjectId(findByMobile._id) }, dataToUpdate, {});
			let body = userConstant.MESSAGES.OTP_TEXT(generateOtp);
			// smsManager.sendMessageViaAWS(params.countryCode, params.mobileNo, body);
			return {};

		} catch (error) {
			return Promise.reject(error)
		}
	}


	async verifyOTP(params: UserRequest.verifyOTP, userData: TokenData) {
		try {
			// if (config.SERVER.ENVIRONMENT === 'development') {
			// 	console.log('111111111');
			// 	if (params.otp === config.CONSTANT.BYPASS_OTP) {
			// 		return userConstant.MESSAGES.SUCCESS.DEFAULT;
			// 	}
			// }
			console.log('params.otpparams.otpparams.otp', params.otp);

			if (params.otp = '0000') {
				console.log('insideeeeeee 00000000000000000000000000000');
				return Promise.reject(config.CONSTANT.MESSAGES.ERROR.INVALID_OTP)
			}
			const data = await userDao.checkOTP(params, userData);
			if (config.SERVER.ENVIRONMENT !== "production") {
				console.log('111111111');
				if (params.otp === config.CONSTANT.BYPASS_OTP) {
					if (params.type === 'mobile') {
						const dataToUpdate = {
							isMobileVerified: true,
						}
						const statusUpdate = await userDao.updateOne('users', { _id: userData.userId }, dataToUpdate, {});

						return userConstant.MESSAGES.SUCCESS.DEFAULT_WITH_DATA(data);
					}
					else if (params.type === 'email') {
						const dataToUpdate = {
							isEmailVerified: true,
						}
						const statusUpdate = await userDao.updateOne('users', { _id: userData.userId }, dataToUpdate, {});
						return userConstant.MESSAGES.SUCCESS.DEFAULT_WITH_DATA({});
					}
					return userConstant.MESSAGES.SUCCESS.DEFAULT_WITH_DATA({});
				}
				return Promise.reject(userConstant.MESSAGES.ERROR.OTP_NOT_MATCH);
			}
			else if (config.SERVER.ENVIRONMENT == "production") {
				// const data = await userDao.checkOTP(params);
				// console.log('data', data);
				if (params.type === 'mobile') {
					if (data.mobileOtp === params.otp) {
						const dataToUpdate = {
							isMobileVerified: true,
							mobileOtp: 0
						}
						const statusUpdate = await userDao.updateOne('users', { _id: userData.userId }, dataToUpdate, {});
						return userConstant.MESSAGES.SUCCESS.DEFAULT_WITH_DATA({})
					};
				}
				else if (params.type === 'email') {
					if (data.emailOtp === params.otp) {
						const dataToUpdate = {
							isEmailVerified: true,
						}
						const statusUpdate = await userDao.updateOne('users', { _id: userData.userId }, dataToUpdate, {});
						return userConstant.MESSAGES.SUCCESS.DEFAULT;
					};
				}
				return Promise.reject(userConstant.MESSAGES.ERROR.OTP_NOT_MATCH);
			}

		} catch (error) {
			return Promise.reject(error)
		}
	}

	async verifyForGotOTP(params: UserRequest.verifyOTP) {
		try {
			// if (config.SERVER.ENVIRONMENT === 'development') {
			// 	console.log('111111111');
			// 	if (params.otp === config.CONSTANT.BYPASS_OTP) {
			// 		return userConstant.MESSAGES.SUCCESS.DEFAULT;
			// 	}
			// }

			if (params.otp === '0000') {
				console.log('in 0000000000000000000000 condition');
				return Promise.reject(Promise.reject(config.CONSTANT.MESSAGES.ERROR.INVALID_OTP))
			}


			const data = await userDao.checkForgotOtp(params);
			console.log('datadatadatadata', data);
			if (!data) {
				return Promise.reject(config.CONSTANT.MESSAGES.ERROR.INVALID_MOBILE_NUMBER)
			}
			if (!data.salt || !data.hash) {
				return Promise.reject(userConstant.MESSAGES.ERROR.CANNOT_CHANGE_PASSWORD);
			}
			console.log('params.otpppppppppppppppp', params.otp, typeof params.otp);

			console.log('datadatadatadata', data);

			if (config.SERVER.ENVIRONMENT !== "production") {
				console.log('111111111');

				if (params.otp === config.CONSTANT.BYPASS_OTP) {
					const dataToUpdate = {
						isMobileVerified: true,
						mobileOtp: 0
					}
					const criteria = {
						countryCode: params.countryCode,
						mobileNo: params.mobileNo,
					}
					const updatedData = await userDao.updateOne('users', criteria, dataToUpdate, { new: true });
					// return userConstant.MESSAGES.SUCCESS.PROFILE(tokenData);
					console.log('updatedDataupdatedDataupdatedData', updatedData);

					const tokenData = _.extend(params, {
						"userId": data._id,
						"firstName": data.firstName,
						"lastName": data.lastName,
						"countryCode": data.countryCode,
						"mobileNo": data.mobileNo,
						"email": data.email,
						"salt": data.salt,
						"accountLevel": config.CONSTANT.ACCOUNT_LEVEL.USER
					});
					console.log('tokenDatatokenDatatokenDatatokenDatatokenData', tokenData);

					// const salt = await appUtils.CryptDataMD5(data._id + "." + new Date().getTime() + "." + params.deviceId);
					// console.log('saltsaltsaltsaltsaltsalt', salt);

					const userObject = appUtils.buildToken(tokenData);
					console.log('userObjectuserObjectuserObjectuserObject', userObject);

					const accessToken = await tokenManager.generateUserToken({ "type": "FORGOT_PASSWORD", "object": userObject, "salt": data.salt });
					console.log('accessTokenaccessTokenaccessTokenaccessToken', accessToken);

					// return userConstant.MESSAGES.SUCCESS.FORGET_PASSWORD({ "accessToken": accessToken, userData: data });

					const refreshToken = appUtils.encodeToBase64(appUtils.genRandomString(32));
					let step3;
					if (config.SERVER.IS_SINGLE_DEVICE_LOGIN) {
						const step2 = await loginHistoryDao.removeDeviceById({ "userId": data._id });
						step3 = await loginHistoryDao.findDeviceLastLogin({ "userId": data._id });
					} else {
						const step2 = await loginHistoryDao.removeDeviceById({ "userId": data._id, "deviceId": params.deviceId });
						step3 = await loginHistoryDao.findDeviceLastLogin({ "userId": data._id, "deviceId": params.deviceId });
					}
					params = _.extend(params, { "salt": data.salt, "refreshToken": refreshToken, "lastLogin": step3 });
					const step4 = loginHistoryDao.createUserLoginHistory(params);
					let step5, step6;
					if (config.SERVER.IS_REDIS_ENABLE) {
						if (!config.SERVER.IN_ACTIVITY_SESSION)
							step5 = redisClient.storeValue(accessToken, JSON.stringify({ "deviceId": params.deviceId, "salt": data.salt, "userId": data._id }));
						else
							step5 = redisClient.setExp(accessToken, config.SERVER.LOGIN_TOKEN_EXPIRATION_TIME / 1000, JSON.stringify({ "deviceId": params.deviceId, "salt": data.salt, "userId": data._id }));
						const jobPayload = {
							jobName: config.CONSTANT.JOB_SCHEDULER_TYPE.AUTO_SESSION_EXPIRE,
							time: Date.now() + config.SERVER.LOGIN_TOKEN_EXPIRATION_TIME,
							params: { "userId": data._id, "deviceId": params.deviceId, "eventAlertTime": Date.now() + config.SERVER.LOGIN_TOKEN_EXPIRATION_TIME }
						};
						step6 = redisClient.createJobs(jobPayload);
					}
					const step7 = await promise.join(step4, step5, step6);
					return userConstant.MESSAGES.SUCCESS.OTP_VERIFIED_SUCCESSFULLY({ "accessToken": accessToken });
				}
				return Promise.reject(userConstant.MESSAGES.ERROR.OTP_NOT_MATCH);
			}
			else {
				// const data = await userDao.checkOTP(params);
				// console.log('data', data);
				if (params.type === 'mobile') {
					if (data.mobileOtp === params.otp) {
						const dataToUpdate = {
							isMobileVerified: true,
							mobileOtp: 0
						}
						const criteria = {
							countryCode: params.countryCode,
							mobileNo: params.mobileNo,
						}
						const statusUpdate = await userDao.updateOne('users', criteria, dataToUpdate, {});
						return userConstant.MESSAGES.SUCCESS.DEFAULT;
					};
				}
				// else if (params.type === 'email') {
				// 	if (data.emailOtp === params.otp) {
				// 		const dataToUpdate = {
				// 			isEmailVerified: true,
				// 		}
				// 		const statusUpdate = await userDao.updateOne('users', { _id: userData.userId }, dataToUpdate, {});
				// 		return userConstant.MESSAGES.SUCCESS.DEFAULT;
				// 	};
				// }
				return userConstant.MESSAGES.ERROR.OTP_NOT_MATCH;


				// if (data.mobileOtp === params.otp) {
				// 	return userConstant.MESSAGES.SUCCESS.DEFAULT
				// }

			}

		} catch (error) {
			return Promise.reject(error)
		}
	}

	async resetPassword(params) {
		try {
			if (params.token) {
				params['accessToken'] = params.token;
			}
			if (params.type === 'mobile') {
				const tokenData = await verifyToken(params, 'FORGOT_PASSWORD', false)
				console.log('tokeDatatokeDatatokeData', tokenData);

				console.log('paramsparamsparamsparams', params);
				params['countryCode'] = tokenData['countryCode'];
				params['mobileNo'] = tokenData['mobileNo'];

				// const checkMobile = await userDao.findUserByEmailOrMobileNo(params);
				// console.log('checkMobilecheckMobile', checkMobile);

				const step1 = await userDao.findOne('users', { _id: tokenData.userId }, {}, {})  //(tokenData);
				console.log('step1step1step1', step1);

				params.hash = appUtils.encryptHashPassword(params.password, step1.salt);
				const step2 = userDao.changeForgotPassword(params, { userId: tokenData.userId });
				// }
				return userConstant.MESSAGES.SUCCESS.DEFAULT_WITH_DATA({});

			} else {
				// if (params.token) {
				// 	params['accessToken'] = params.token;
				// }
				const tokenData = await verifyToken(params, 'FORGOT_PASSWORD', false)
				console.log('tokeDatatokeDatatokeData', tokenData);

				// const step1 = await userDao.findUserByEmailOrMobileNo(params);
				// const step1 = await userDao.findOne('users', { _id: tokeData.userId }, {}, {})
				// console.log('step1step1step1step1', step1);

				const step1 = await userDao.findOne('users', { _id: tokenData.userId }, {}, {})  //(tokenData);
				console.log('step1step1step1', step1);

				const oldHash = appUtils.encryptHashPassword(params.password, step1.salt);
				// if (oldHash !== step1.hash) {
				// 	return Promise.reject(adminConstant.MESSAGES.ERROR.INVALID_OLD_PASSWORD);
				// } else {

				params.hash = appUtils.encryptHashPassword(params.password, step1.salt);
				const step2 = userDao.changeForgotPassword(params, tokenData);
				// }
				return userConstant.MESSAGES.SUCCESS.PASSWORD_SUCCESSFULLY_CHANGED;


				// const salt = await appUtils.CryptDataMD5(step2._id + "." + new Date().getTime() + "." + params.deviceId);

			}

		} catch (error) {
			throw error;
		}
	}
}

export const userController = new UserController();