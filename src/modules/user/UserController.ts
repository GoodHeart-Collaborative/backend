"use strict";

import * as _ from "lodash";
import fs = require("fs");
import * as promise from "bluebird";

import * as appUtils from "@utils/appUtils";
import * as config from "@config/index";
import { loginHistoryDao } from "@modules/loginHistory/LoginHistoryDao";
import { mailManager } from "@lib/index";
import { smsManager } from "@lib/SMSManager";
import * as tokenManager from "@lib/tokenManager";
import * as userConstant from "@modules/user/userConstant";
import { userDao } from "@modules/user/index";
import * as  userDaoMember from '@modules/user/v1/UserDao';
import { Types } from 'mongoose';
import { verifyToken } from '@lib/tokenManager';
import { gratitudeJournalDao } from "@modules/gratitudeJournal/GratitudeJournalDao";
import { discoverDao } from "../discover/DiscoverDao";
import { CONSTANT } from "@config/index";
import { forumtopicDao } from "@modules/forum/forumDao";
import { errorReporter } from "@lib/flockErrorReporter";
import { homeDao } from "@modules/home/HomeDao";

var ObjectID = require('mongodb').ObjectID;
export class UserController {

	/**
	 * @function signup
	 * @description if IS_REDIS_ENABLE set to true,
	 * than redisClient.storeList() function saves value in redis.
	 */
	async signup(params: UserRequest.Signup) {
		try {
			if (!params.email && (!params.countryCode || !params.mobileNo)) {
				return Promise.reject(userConstant.MESSAGES.ERROR.EMAIL_OR_PHONE_REQUIRED);
			} else {
				// const step1 = await userDao.findVerifiedEmailOrMobile(params)
				const step = await userDao.findUserByEmailOrMobileNoForSocialSignUp(params, { type: "email" });

				const step1 = await userDao.findUserByEmailOrMobileNoForSocialSignUp(params, {});
				if (step || step1) {
					if ((step && step.status === config.CONSTANT.STATUS.DELETED) || (step1 && step1.status === config.CONSTANT.STATUS.DELETED)) {
						return Promise.reject(userConstant.MESSAGES.ERROR.DELETED_USER_TRYING_TO_REGISTER);
					}
					if ((step && step.status === config.CONSTANT.STATUS.BLOCKED) || (step1 && step1.status === config.CONSTANT.STATUS.BLOCKED)) {
						return Promise.reject(userConstant.MESSAGES.ERROR.BLOCKED_USER_TRYING_TO_REGISTER_OR_LOGIN);
					}
					// if (step.mobileNo === params.mobileNo && step.email === params.email && step.isEmailVerified && step.isMobileVerified) {
					// 	return Promise.reject(userConstant.MESSAGES.ERROR.BLOCKED_USER_TRYING_TO_REGISTER_OR_LOGIN);
					// }
					if (step && step.email === params.email && step.isEmailVerified === true) {
						return Promise.reject(userConstant.MESSAGES.ERROR.EMAIL_ALREADY_EXIST);
					}
					if (step1 && step1.mobileNo === params.mobileNo && step1.isMobileVerified === true) {
						return Promise.reject(userConstant.MESSAGES.ERROR.MOBILE_NO_ALREADY_EXIST);
					}
				}

				if (step && step1 && step1.isMobileVerified === false && step.isEmailVerified === false && step._id.toString() === step1._id.toString()) {
					console.log('EEEEEEEEEEEEEEEEEEEEEEEEEEEEE111111111111');
					const tokenData = _.extend(params, {
						"userId": step1._id,
						"firstName": step1.firstName,
						"lastName": step1.lastName,
						"countryCode": step1.countryCode,
						"mobileNo": step1.mobileNo,
						"email": step1.email,
						"salt": step1.salt,
						"accountLevel": config.CONSTANT.ACCOUNT_LEVEL.USER
					});

					const userObject = appUtils.buildToken(tokenData);

					const accessToken = await tokenManager.generateUserToken({ "type": "USER_SIGNUP", "object": userObject, "salt": step1.salt });

					console.log('accessTokenaccessToken12343456789>>>>>>>>>>>>>>', accessToken);

					// mailManager.sendRegisterMailToUser({ "email": params.email, "firstName": params.firstName, "lastName": params.lastName, "token": accessToken, userId: step1._id });

					// return Promise.reject(userConstant.MESSAGES.ERROR.MOBILE_NO_ALREADY_EXIST);
					// const updateEmailToNA = await userDao.findOneAndUpdate('users', { _id: step1._id }, { mobileNo: 'N/A' }, {})

					const removeLoginHistory = await loginHistoryDao.removeDeviceById({ ...params, userId: step1._id });
					console.log('removeLoginHistoryremoveLoginHistoryremoveLoginHistory', removeLoginHistory);

					const step6 = await loginHistoryDao.createUserLoginHistory(params);

					return userConstant.MESSAGES.SUCCESS.SIGNUP({ "accessToken": accessToken, mobileNo: step1.mobileNo, countryCode: step1.countryCode });
				}

				if (step && !step1 && step.isEmailVerified === false) {
					const updateEmailToNA = await userDao.findOneAndUpdate('users', { _id: step._id }, { email: 'N/A' }, {})
				}
				if (!step && step1 && step1.isMobileVerified === false) {
					const updateEmailToNA = await userDao.findOneAndUpdate('users', { _id: step1._id }, { mobileNo: 'N/A' }, {})
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

				const refreshToken = appUtils.encodeToBase64(appUtils.genRandomString(32));

				params = _.extend(params, { "salt": salt, "refreshToken": refreshToken, "lastLogin": Date.now() });

				const removeLoginHistory = await loginHistoryDao.removeDeviceById({ ...params, userId: step2._id });
				console.log('removeLoginHistoryremoveLoginHistoryremoveLoginHistory', removeLoginHistory);

				const step6 = await loginHistoryDao.createUserLoginHistory(params);

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


				let body = userConstant.MESSAGES.OTP_TEXT(generateOtp);
				// smsManager.sendMessageViaAWS(params.countryCode, params.mobileNo, body);

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
				if (!step1) {
					if (params.email) {
						return Promise.reject(userConstant.MESSAGES.ERROR.EMAIL_NOT_REGISTERED);
					}
					if (params.mobileNo)
						return Promise.reject(userConstant.MESSAGES.ERROR.MOBILE_NO_NOT_REGISTERED);
				} else {
					if (step1 && step1.status === config.CONSTANT.STATUS.DELETED) {
						return Promise.reject(userConstant.MESSAGES.ERROR.DELETED_USER_TRYING_TO_REGISTER);
					}
					else if (step1 && step1.status === config.CONSTANT.STATUS.BLOCKED) {
						return Promise.reject(userConstant.MESSAGES.ERROR.BLOCKED_USER_TRYING_TO_REGISTER_OR_LOGIN);
					}
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
					console.log('step2step2step2', step2);

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

					const userObject = appUtils.buildToken(tokenData);
					const accessToken = await tokenManager.generateUserToken({ "type": "USER_LOGIN", "object": userObject, "salt": step1.salt });
					const step4 = loginHistoryDao.createUserLoginHistory(tokenData);


					if (params.email && !step2) {
						const step3 = mailManager.sendRegisterMailToUser({ "email": step1.email, "firstName": step1.firstName, "lastName": step1.lastName, "token": accessToken, userId: step1._id });
						return userConstant.MESSAGES.SUCCESS.EMAIL_NOT_VERIFIED({ profileStep: config.CONSTANT.HTTP_STATUS_CODE.EMAIL_NOT_VERIFIED, accessToken: '' })
					}
					if (params.mobileNo && !step2) {
						// const step4 = loginHistoryDao.createUserLoginHistory(tokenData);
						return userConstant.MESSAGES.SUCCESS.MOBILE_NOT_VERIFIED({ profileStep: config.CONSTANT.HTTP_STATUS_CODE.MOBILE_NO_NOT_VERIFY, accessToken: accessToken })
					}


					if (step2.status === config.CONSTANT.STATUS.BLOCKED) {
						return Promise.reject(userConstant.MESSAGES.SUCCESS.BLOCKED({ profileStep: config.CONSTANT.HTTP_STATUS_CODE.BLOCKED_USER, accessToken: '' }));
					}
					if (step2.status === config.CONSTANT.STATUS.DELETED) {
						return Promise.reject(userConstant.MESSAGES.SUCCESS.DELETED({ profileStep: config.CONSTANT.HTTP_STATUS_CODE.BLOCKED_USER, accessToken: '' }));
					}
					else if (step2 && !step2.dob || !step2.dob == null && step2.industryType) {
						// const step4 = loginHistoryDao.createUserLoginHistory(tokenData);
						return userConstant.MESSAGES.SUCCESS.REGISTER_BDAY({ profileStep: config.CONSTANT.HTTP_STATUS_CODE.REGISTER_BDAY, accessToken: accessToken });

					}
					// else if (step2.isAdminRejected) {
					// 	return userConstant.MESSAGES.SUCCESS.ADMIN_REJECTED_USER_ACCOUNT({ profileStep: config.CONSTANT.HTTP_STATUS_CODE.ADMIN_REJECT_ACCOUNT, accessToken: '' });
					// }
					else if (step2.adminStatus === config.CONSTANT.USER_ADMIN_STATUS.REJECTED) {
						return userConstant.MESSAGES.SUCCESS.ADMIN_REJECTED_USER_ACCOUNT({ profileStep: config.CONSTANT.HTTP_STATUS_CODE.ADMIN_REJECT_ACCOUNT, accessToken: '' });
					}
					// else if (!step2.isAdminVerified) {
					// 	return userConstant.MESSAGES.SUCCESS.USER_ACCOUNT_SCREENING({ profileStep: config.CONSTANT.HTTP_STATUS_CODE.ADMIN_ACCOUNT_SCREENING, accessToken: '' });
					// }
					else if (step2.adminStatus === config.CONSTANT.USER_ADMIN_STATUS.PENDING) {
						return userConstant.MESSAGES.SUCCESS.USER_ACCOUNT_SCREENING({ profileStep: config.CONSTANT.HTTP_STATUS_CODE.ADMIN_ACCOUNT_SCREENING, accessToken: '' });
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
							// step3 = await loginHistoryDao.findDeviceLastLogin({ "userId": step1._id });
							const step4 = loginHistoryDao.createUserLoginHistory(tokenData);
						} else {
							const step2 = await loginHistoryDao.removeDeviceById({ "userId": step1._id, "deviceId": params.deviceId });
							// step3 = await loginHistoryDao.findDeviceLastLogin({ "userId": step1._id, "deviceId": params.deviceId });
						}
						params = _.extend(params, { "arn": arn, "salt": step1.salt, "refreshToken": refreshToken });
						// const step4 = loginHistoryDao.createUserLoginHistory(params);
						// const step4 = loginHistoryDao.createUserLoginHistory(tokenData);

						step1['isPasswordAvailable'] = (step1 && step1['hash']) ? true : false;
						// const step7 = await promise.join(step4, step5, step6);
						// const userData = { ...step1.isAppleLogin, ...step1.isMobileVerified, ...step1.isEmailVerified, ...step1.isFacebookLogin, ...step1.isGoogleLogin, ...step1.firstName, ...step1.lastName, ...step1.countryCode, ...step1.}
						delete step1['salt'];
						delete step1['mobileOtp'];
						delete step1['forgotToken'];
						delete step1['isAdminRejected'];
						delete step1['isAdminVerified'];
						delete step1['adminStatus'];
						delete step1['forgotToken'];
						delete step1['fullMobileNo']
						delete step1['googleId'];
						delete step1['facebookId'];
						delete step1['badgeCount'];
						delete step1['location'];
						delete step1['likeCount'];
						delete step1['commentCount'];
						delete step1['refreshToken'];
						delete step1['salt'];
						delete step1['hash'];
						delete step1['members'];
						delete step1['myConnection']
						delete step1['countMember'];
						delete step1['memberCreatedAt'];
						delete step1['isMemberOfDay'];
						delete step1['reportCount'];
						delete step1['status'];


						step1['subscriptionData'] = {
							// isSubscribed: step1.isSubscribed,  //(step1.subscriptionType !== config.CONSTANT.USER_SUBSCRIPTION_PLAN.NONE.value) ? true : false,
							isSubscribed: (step1.subscriptionEndDate < new Date().getTime()) ? false : true,
							subscriptionType: step1.subscriptionType,
							subscriptionEndDate: step1.subscriptionEndDate,
							// subscriptionPlatform: (step1.subscriptionType === config.CONSTANT.USER_SUBSCRIPTION_PLAN.FREE.value || step1.subscriptionType === config.CONSTANT.USER_SUBSCRIPTION_PLAN.NONE) ? "0" : step1.subscriptionPlatform
							subscriptionPlatform: (step1.subscriptionType === config.CONSTANT.USER_SUBSCRIPTION_PLAN.FREE.value || step1.subscriptionType === config.CONSTANT.USER_SUBSCRIPTION_PLAN.NONE.value) ? params.platform : step1.subscriptionPlatform
						}

						delete step1['subscriptionType'];
						delete step1['subscriptionEndDate'];
						delete step1['subscriptionPlatform'];
						return userConstant.MESSAGES.SUCCESS.LOGIN({ profileStep: config.CONSTANT.HTTP_STATUS_CODE.LOGIN_STATUS_HOME_SCREEN, "accessToken": accessToken, ...step1 });
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
			console.log('step1step1step1step1', step1);

			if (step1 && step1.status === config.CONSTANT.STATUS.DELETED) {
				return Promise.reject(userConstant.MESSAGES.ERROR.DELETED_USER_TRYING_TO_REGISTER);
			}
			if (step1 && step1.status === config.CONSTANT.STATUS.BLOCKED) {
				return Promise.reject(userConstant.MESSAGES.ERROR.BLOCKED_USER_TRYING_TO_REGISTER_OR_LOGIN);
			}
			if (!step1) {
				const findEmail = await userDao.findOne('users', { email: params.email, isEmailVerified: true }, {}, {})
				console.log('findEmailfindEmailfindEmail', findEmail);

				if (findEmail) {
					let tokenData = _.extend(params, {
						"userId": findEmail._id,
						"firstName": findEmail.firstName,
						"lastName": findEmail.lastName,
						"email": findEmail.email,
						"countryCode": findEmail.countryCode,
						"mobileNo": findEmail.mobileNo,
						"salt": findEmail.salt,
						"accountLevel": config.CONSTANT.ACCOUNT_LEVEL.USER
					});

					const mergeUser = await userDao.mergeAccountAndCheck(findEmail, params);

					let step3, step2;
					if (config.SERVER.IS_SINGLE_DEVICE_LOGIN) {
						console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
						step2 = await loginHistoryDao.removeDeviceById({ "userId": findEmail._id });
						console.log('step2step2step2', step2);
						step3 = await loginHistoryDao.findDeviceLastLogin({ "userId": findEmail._id });
						console.log('step3step3step3step3step3step3', step3);
					}
					params = _.extend(params, { "salt": findEmail.salt, "lastLogin": step3 });

					// const step4 = loginHistoryDao.createUserLoginHistory(findEmail);

					tokenData = { ...params, ...tokenData };

					const userObject = appUtils.buildToken(tokenData);
					console.log('userObjectuserObjectuserObject', userObject);
					const accessToken = await tokenManager.generateUserToken({ "type": "USER_LOGIN", "object": userObject, "salt": findEmail.salt });
					console.log('accessTokenaccessTokenaccessToken', accessToken);

					params = _.extend(params, { "salt": findEmail.salt, "lastLogin": step3 });

					const step4 = await loginHistoryDao.createUserLoginHistory(tokenData);

					console.log('step4step4step4step4>>>>>>>>>>>>>>>>>>>>>>>>', step4);


					if (!findEmail.isEmailVerified) {
						console.log('111111111111111');
						const step3 = mailManager.sendRegisterMailToUser({ "email": findEmail.email, "firstName": findEmail.firstName, "lastName": findEmail.lastName, "token": accessToken, userId: findEmail._id });
						return userConstant.MESSAGES.SUCCESS.EMAIL_NOT_VERIFIED({ profileStep: config.CONSTANT.HTTP_STATUS_CODE.EMAIL_NOT_VERIFIED, accessToken: '' })
					}

					else if (findEmail && !findEmail.dob || !findEmail.dob == null && findEmail.industryType) {
						console.log('22222222222222222');
						return userConstant.MESSAGES.SUCCESS.REGISTER_BDAY({ profileStep: config.CONSTANT.HTTP_STATUS_CODE.REGISTER_BDAY, accessToken: accessToken });
					}
					// else if (step1.isAdminRejected) {
					// 	return userConstant.MESSAGES.SUCCESS.ADMIN_REJECTED_USER_ACCOUNT({ profileStep: config.CONSTANT.HTTP_STATUS_CODE.ADMIN_REJECT_ACCOUNT, accessToken: '' });
					// }
					else if (findEmail.adminStatus == config.CONSTANT.USER_ADMIN_STATUS.REJECTED) {
						console.log('333333333333333333333333');
						return userConstant.MESSAGES.SUCCESS.ADMIN_REJECTED_USER_ACCOUNT({ profileStep: config.CONSTANT.HTTP_STATUS_CODE.ADMIN_REJECT_ACCOUNT, accessToken: '' });
					}
					// else if (!step1.isAdminVerified) {
					// 	return userConstant.MESSAGES.SUCCESS.USER_ACCOUNT_SCREENING({ profileStep: config.CONSTANT.HTTP_STATUS_CODE.ADMIN_ACCOUNT_SCREENING, accessToken: '' });
					// }
					else if (findEmail.adminStatus == config.CONSTANT.USER_ADMIN_STATUS.PENDING) {
						console.log(4444444444444444444);

						return userConstant.MESSAGES.SUCCESS.USER_ACCOUNT_SCREENING({ profileStep: config.CONSTANT.HTTP_STATUS_CODE.ADMIN_ACCOUNT_SCREENING, accessToken: '' });
					}
					else {
						// let step3;
						// if (config.SERVER.IS_SINGLE_DEVICE_LOGIN) {
						// 	console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
						// 	const step2 = await loginHistoryDao.removeDeviceById({ "userId": findEmail._id });
						// 	console.log('step2step2step2', step2);
						// 	step3 = await loginHistoryDao.findDeviceLastLogin({ "userId": findEmail._id });
						// 	console.log('step3step3step3step3step3step3', step3);
						// }
						// params = _.extend(params, { "salt": findEmail.salt, "lastLogin": step3 });

						// return userConstant.MESSAGES.SUCCESS.LOGIN({ "accessToken": accessToken, "refreshToken": refreshToken });
						findEmail['isPasswordAvailable'] = (findEmail && findEmail['hash']) ? true : false;
						delete findEmail['salt']; delete findEmail['hash']; delete findEmail['mobileOtp']; delete findEmail['forgotToken']; delete findEmail['isAdminRejected']; delete findEmail['isAdminVerified']; delete findEmail['forgotToken']; delete findEmail['fullMobileNo']; delete findEmail['googleId']; delete findEmail['facebookId'];
						console.log('findEmailfindEmailfindEmailfindEmail', findEmail);

						return userConstant.MESSAGES.SUCCESS.LOGIN({ profileStep: config.CONSTANT.HTTP_STATUS_CODE.LOGIN_STATUS_HOME_SCREEN, "accessToken": accessToken, ...findEmail });

					}
				} else {
					return Promise.reject(userConstant.MESSAGES.ERROR.SOCIAL_ACCOUNT_NOT_REGISTERED);
				}
			}
			else if (!step1) {
				return Promise.reject(userConstant.MESSAGES.ERROR.SOCIAL_ACCOUNT_NOT_REGISTERED);
			} else {
				console.log('2222222222222222222222222222');

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
				console.log('userObjectuserObjectuserObject', userObject);
				const accessToken = await tokenManager.generateUserToken({ "type": "USER_LOGIN", "object": userObject, "salt": step1.salt });
				console.log('accessTokenaccessTokenaccessToken', accessToken);

				// const step4 = loginHistoryDao.createUserLoginHistory(tokenData);
				// console.log('step4step4step4step4step4', step4);

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
					return userConstant.MESSAGES.SUCCESS.ADMIN_REJECTED_USER_ACCOUNT({ profileStep: config.CONSTANT.HTTP_STATUS_CODE.ADMIN_REJECT_ACCOUNT, accessToken: '' });
				}
				else if (step1.adminStatus == config.CONSTANT.USER_ADMIN_STATUS.PENDING) {
					return userConstant.MESSAGES.SUCCESS.USER_ACCOUNT_SCREENING({ profileStep: config.CONSTANT.HTTP_STATUS_CODE.ADMIN_ACCOUNT_SCREENING, accessToken: '' });
				}
				else {
					let step3;
					if (config.SERVER.IS_SINGLE_DEVICE_LOGIN) {
						console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
						const step2 = await loginHistoryDao.removeDeviceById({ "userId": step1._id });
						console.log('step2step2step2', step2);
						step3 = await loginHistoryDao.findDeviceLastLogin({ "userId": step1._id });
						console.log('step3step3step3step3step3step3', step3);
					}
					const step4 = loginHistoryDao.createUserLoginHistory(tokenData);
					console.log('step4step4step4step4step4', step4);
					params = _.extend(params, { "salt": step1.salt, "lastLogin": step3 });

					// return userConstant.MESSAGES.SUCCESS.LOGIN({ "accessToken": accessToken, "refreshToken": refreshToken });
					step1['isPasswordAvailable'] = (step1 && step1['hash']) ? true : false;
					delete step1['salt']; delete step1['hash']; delete step1['mobileOtp']; delete step1['forgotToken']; delete step1['isAdminRejected']; delete step1['isAdminVerified']; delete step1['forgotToken']; delete step1['fullMobileNo']; delete step1['googleId']; delete step1['facebookId'];
					return userConstant.MESSAGES.SUCCESS.LOGIN({ profileStep: config.CONSTANT.HTTP_STATUS_CODE.LOGIN_STATUS_HOME_SCREEN, "accessToken": accessToken, ...step1 });

				}
			}
		} catch (error) {
			return Promise.reject(error);
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
				console.log('stepstepstepstep', step);

				if (step) {
					return Promise.reject(userConstant.MESSAGES.ERROR.SOCIAL_ACCOUNT_ALREADY_EXIST);
				}
				// let step1 = await userDao.findUserByEmailOrMobileNo(params);
				let step1 = await userDao.findUserByEmailOrMobileNoForSocialSignUp(params, { type: "email" });
				let step2 = await userDao.findUserByEmailOrMobileNoForSocialSignUp(params, {});


				console.log('step1step1step1step1step1step1', step1);
				if (step1 && step1.status === config.CONSTANT.STATUS.DELETED || step1 && step1.status === config.CONSTANT.STATUS.BLOCKED) {
					return Promise.reject(userConstant.MESSAGES.ERROR.PLEASE_CONTACT_ADMIN);
				}
				// if mobile no is verified and attached to other account
				if (!step1 && step2 && step2.isMobileVerified === true) {
					return Promise.reject(userConstant.MESSAGES.ERROR.MOBILE_ALREADY_IN_USER_SOCIAL_CASE)
				}

				if (step1 && step2 && step1._id !== step2._id && step2.isMobileVerified === true) {
					return Promise.reject(userConstant.MESSAGES.ERROR.MOBILE_ALREADY_IN_USER_SOCIAL_CASE)
				}

				let step3;
				// if both email and mobile are verified
				if (step1 && step2 && step1.isEmailVerified === true && step1.isMobileVerified === true && step1._id.toString() === step2._id.toString()) {
					console.log('22222222222222222222222222222222222222222');
					step3 = await userDao.mergeAccountAndCheck(step1, params);
					console.log('					step6					step6', step3);
				}
				else if (step1 && step2 && step1.isEmailVerified === false && step2.isMobileVerified === false && step1._id.toString() === step2._id.toString()) {
					console.log('step6step6step6step6step6step6step6step6666666666666666666666^^^>>>>>>>>>>>>>>>>>',);
					step3 = await userDao.mergeAccountAndCheck(step1, params);
					console.log('					step6					step6					step6', step3);
				}

				if (step1 || step2) {
					if (step1 && !step2 && step1.isEmailVerified === false) {
						const updateEmailToNA = await userDao.findOneAndUpdate('users', { _id: step1._id }, { email: 'N/A' }, {})
					}
					if (!step1 && step2 && step2.isMobileVerified === false) {
						const updateEmailToNA = await userDao.findOneAndUpdate('users', { _id: step1._id }, { mobileNo: 'N/A' }, {})
					}
				}

				let salt;
				let tokenData;
				// if (!step1) {
				const newObjectId = new ObjectID();
				if (!step3) {
					// params['_id'] = newObjectId;
					// salt = await appUtils.CryptDataMD5(params['_id'] + "." + new Date().getTime() + "." + params.deviceId);
					// params['salt'] = salt;
					// const salt = this.salt = bcrypt.genSaltSync(config.SERVER.SALT_ROUNDS);
					salt = appUtils.genRandomString(config.SERVER.SALT_ROUNDS);
					params['salt'] = salt;
					// this.hash = appUtils.encryptHashPassword(password, salt);
					console.log('saltsaltsalt111111111111111111111', params['salt']);


					step3 = await userDao.socialSignup(params);
					// params['salt'] = salt;

					tokenData = _.extend(params, {
						"userId": step3._id,
						"firstName": step3.firstName,
						"middleName": step3.middleName,
						"lastName": step3.lastName,
						"email": step3.email,
						"countryCode": step3.countryCode,
						"mobileNo": step3.mobileNo,
						"salt": step3.salt,
						"accountLevel": config.CONSTANT.ACCOUNT_LEVEL.USER
					});
				} else {
					// salt = await appUtils.CryptDataMD5(params[step3._id] + "." + new Date().getTime() + "." + params.deviceId);
					params['salt'] = step3.salt;
					tokenData = _.extend(params, {
						"userId": step3._id,
						"firstName": step3.firstName,
						"middleName": step3.middleName,
						"lastName": step3.lastName,
						"email": step3.email,
						"countryCode": step3.countryCode,
						"mobileNo": step3.mobileNo,
						"salt": step3.salt,
						"accountLevel": config.CONSTANT.ACCOUNT_LEVEL.USER
					});
				}
				// params['_id'] = newObjectId;
				// salt = await appUtils.CryptDataMD5(params['_id'] + "." + new Date().getTime() + "." + params.deviceId);


				const userObject = appUtils.buildToken(tokenData); // build token data for generating access token

				const accessToken = await tokenManager.generateUserToken({ "type": "USER_LOGIN", "object": userObject, "salt": step3.salt || salt });

				let arn;
				if (params.platform === config.CONSTANT.DEVICE_TYPE.ANDROID) {
					// arn = await sns.registerAndroidUser(params.deviceToken);
					arn = "";
				} else if (params.platform === config.CONSTANT.DEVICE_TYPE.IOS) {
					// arn = await sns.registerIOSUser(params.deviceToken);
					arn = "";
				}
				const refreshToken = appUtils.encodeToBase64(appUtils.genRandomString(32));
				params = _.extend(params, { "arn": arn, "salt": step3.salt || salt, "refreshToken": refreshToken, "lastLogin": Date.now() });
				const step34 = loginHistoryDao.createUserLoginHistory(tokenData);

				// const step6 = await promise.join(step3, step4, step5);
				// await userDao.updateLikeAndCommentCount({ _id: appUtils.toObjectId(step1._id) }, { "$set": { isEmailVerified: true } })
				step3['isPasswordAvailable'] = (step3 && step3['hash']) ? true : false;

				delete step3['salt'];
				delete step3['mobileOtp'];
				delete step3['forgotToken'];
				delete step3['isAdminRejected'];
				delete step3['isAdminVerified'];
				delete step3['adminStatus'];
				delete step3['forgotToken'];
				delete step3['fullMobileNo']
				delete step3['googleId'];
				delete step3['facebookId'];
				delete step3['badgeCount'];
				delete step3['location'];
				delete step3['likeCount'];
				delete step3['commentCount'];
				delete step3['refreshToken'];
				delete step3['salt'];
				delete step3['hash'];
				delete step3['members'];
				delete step3['myConnection']
				delete step3['countMember'];
				delete step3['memberCreatedAt'];
				delete step3['isMemberOfDay'];
				delete step3['reportCount'];
				delete step3['status'];

				console.log('accessTokenaccessTokenaccessToken', accessToken);

				if (step3 && step3._id && !step3.dob || !step3.dob == null && step3.industryType) {
					return userConstant.MESSAGES.SUCCESS.REGISTER_BDAY({ profileStep: config.CONSTANT.HTTP_STATUS_CODE.REGISTER_BDAY, "accessToken": accessToken });
				}

				return userConstant.MESSAGES.SUCCESS.LOGIN({ profileStep: config.CONSTANT.HTTP_STATUS_CODE.LOGIN_STATUS_HOME_SCREEN, "accessToken": accessToken, ...step1 });
			}
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function forgotPassword
	 * @description user forgot password
	 */
	async forgotPassword(params: ForgotPasswordRequest) {
		try {
			if (!params.email && (!params.countryCode || !params.mobileNo)) {
				return Promise.reject(userConstant.MESSAGES.ERROR.EMAIL_OR_PHONE_REQUIRED);
			} else {
				const step = await userDao.findUserByEmailOrMobileNo(params)

				if (!step) {
					if (params.email) {
						return Promise.reject(config.CONSTANT.MESSAGES.ERROR.EMAIL_NOT_REGISTERED);
					} else {
						return Promise.reject(userConstant.MESSAGES.ERROR.MOBILE_NO_NOT_REGISTERED);
					}
				}
				const step1 = await userDao.findForGotVerifiedEmailOrMobile(params);

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
						const step2 = userDao.addForgotToken({ "userId": step1._id, "forgotToken": accessToken }); // add forgot token
						const step3 = mailManager.forgotPasswordEmailToUser({ "email": params.email, "firstName": step1.firstName, "lastName": step1.lastName, "token": accessToken });
						return userConstant.MESSAGES.SUCCESS.FORGOT_PASSWORD_ON_EMAIL;
					} else {
						console.log('FOR_MOBILE_MESSAGE_OTP',);
						// const step2 = smsManager.sendForgotPasswordLink(params.countryCode, params.mobileNo, accessToken);
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
			if (step1 && !step1.forgotToken) {
				return userConstant.MESSAGES.ERROR.LINK_EXPIRED;
			}
			params.hash = appUtils.encryptHashPassword(params.password, step1.salt); // generate hash
			const step2 = userDao.changeForgotPassword(params, tokenData);
			const step3 = userDao.emptyForgotToken({ "userId": tokenData.userId });
			const step4 = await promise.join(step2, step3);
			return userConstant.MESSAGES.SUCCESS.CHANGE_FORGOT_PASSWORD;
		} catch (error) {
			throw error;
		}
	}



	async redirectResetPassword(token) {
		try {
			return;
		} catch (error) {
			return Promise.reject(error);
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
			return userConstant.MESSAGES.SUCCESS.LOGOUT;
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function profile
	 * @description profile detail
	 */
	async profile(tokenData: TokenData, userId) {
		try {
			if (tokenData.userId === userId || !userId) {
				const data = await userDao.findOne('users', { _id: tokenData.userId }, { deviceId: 0, deviceToken: 0 }, {})
				return data;
			} else {
				const data = await userDao.findOne('users', { _id: userId }, { deviceId: 0, deviceToken: 0 }, {})
				return userConstant.MESSAGES.SUCCESS.PROFILE(data);
			}

		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function updateProfile
	 * @description user update profile for the first time register before verify 
	 */
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

	/**
	 * @function updateProfile
	 * @description user update profile change email or phone
	 */
	async updateProfileUser(params, userData, token) {
		try {
			const updateCriteria = {
				_id: userData.userId
			};
			let dataToUpdate: any = {};

			let checkUser = await userDao.findUserByEmailOrMobileNo({ mobileNo: params.mobileNo, countryCode: params.countryCode })
			let checkEmail = await userDao.findUserByEmailOrMobileNo({ email: params.email })

			if (userData.isEmailVerified === false && userData.mobileNo !== params.mobileNo) {
				return Promise.reject(userConstant.MESSAGES.ERROR.CAN_NOT_CHANGE_MOBILE)
			}
			// else if (userData.isEmailVerified === true && userData.mobileNo !== params.mobileNo) {
			if (checkUser) {
				if (checkUser._id.toString() != userData.userId.toString() && checkUser.isMobileVerified === true) {
					return Promise.reject(userConstant.MESSAGES.ERROR.MOBILE_NO_ALREADY_EXIST)
				}
				// }
				// else if (userData.isEmailVerified === true && userData.isMobileVerified === true) {
				if (checkUser.isMobileVerified === false && checkUser._id.toString() != userData.userId.toString()) {
					const removePhoneNo = await userDao.findOneAndUpdate('users', { _id: checkUser._id }, { mobileNo: 'N/A' }, {});
					const updateUserNewPhoneNo = await userDao.findOneAndUpdate('users', { _id: userData.userId }, { mobileNo: params.mobileNo }, {});
				}
				if (checkUser.mobileNo !== params.mobileNo) {
					dataToUpdate['isMobileVerified'] = false;
				}
			}
			if (!checkUser && userData.mobileNo !== params.mobileNo) {
				dataToUpdate['isMobileVerified'] = false;
			}

			if (checkEmail) {
				if (checkEmail.isEmailVerified === true && checkEmail._id.toString() !== userData.userId.toString()) {
					return Promise.reject(userConstant.MESSAGES.ERROR.EMAIL_ALREADY_EXIST);
				}
				if (checkEmail.isEmailVerified === false && checkEmail._id.toString() !== userData.userId.toString()) {
					// return Promise.reject(userConstant.MESSAGES.ERROR.EMAIL_ALREADY_EXIST);
					const removeEmail = await userDao.findOneAndUpdate('users', { _id: checkEmail._id }, { email: 'N/A' }, {});
					// const updateEmail = await userDao.findOneAndUpdate('users', { _id: userData.userId }, { mobileNo: params.mobileNo }, {});
				}
			}
			// const checkVerifiedEmailORPhone = await userDao.findVerifiedEmailOrMobile(params)
			dataToUpdate['dob'] = params.dob;
			dataToUpdate['profession'] = params.profession;
			dataToUpdate['email'] = params.email;
			dataToUpdate['firstName'] = params.firstName;
			dataToUpdate['lastName'] = params.lastName;
			dataToUpdate['mobileNo'] = params.mobileNo;
			dataToUpdate['countryCode'] = params.countryCode;
			dataToUpdate['industryType'] = params.industryType;
			dataToUpdate['experience'] = params.experience;
			dataToUpdate['about'] = params.about;
			dataToUpdate['profilePicUrl.0'] = params.profilePicUrl;
			dataToUpdate['companyName'] = params.companyName;

			const data = await userDao.findOneAndUpdate('users', updateCriteria, dataToUpdate, { new: true, lean: true });
			data['accessToken'] = token.Token;
			delete data['salt'];
			delete data['hash'];
			delete data['mobileOtp'];
			delete data['forgotToken'];
			delete data['isAdminRejected'];
			delete data['isAdminVerified'];
			delete data['adminStatus'];
			delete data['forgotToken'];
			delete data['fullMobileNo']
			delete data['googleId'];
			delete data['facebookId'];
			delete data['badgeCount'];
			delete data['location'];
			delete data['likeCount'];
			delete data['commentCount'];
			delete data['refreshToken'];
			delete data['salt'];
			delete data['hash'];
			delete data['members'];
			delete data['myConnection']
			delete data['countMember'];
			delete data['memberCreatedAt'];
			delete data['isMemberOfDay'];
			delete data['reportCount'];


			data['subscriptionData'] = {
				isSubscribed: data.isSubscribed,  // (data.subscriptionType !== config.CONSTANT.USER_SUBSCRIPTION_PLAN.NONE.value) ? true : false,
				subscriptionType: data.subscriptionType,
				subscriptionEndDate: data.subscriptionEndDate,
			};
			delete data['subscriptionType'];
			delete data['subscriptionEndDate'];

			return userConstant.MESSAGES.SUCCESS.PROFILE_UPDATE(data);

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

	/**
	 * 
	 * @param verifyOTP 
	 * @description user verifyOtp registeration login time 
	 */
	async verifyOTP(params: UserRequest.verifyOTP, userData: TokenData) {
		try {
			const headers = params.authorization;
			const accessToken = headers.substr(headers.indexOf(" ") + 1);
			console.log('accessTokenaccessToken', accessToken);
			// const accessToken = params.substr(oriuginal.indexOf(" ") + 1);
			// if (config.SERVER.ENVIRONMENT === 'development') {
			// 	if (params.otp === config.CONSTANT.BYPASS_OTP) {
			// 		return userConstant.MESSAGES.SUCCESS.DEFAULT;
			// 	}
			// }

			if (params.otp == '0000') {
				return Promise.reject(config.CONSTANT.MESSAGES.ERROR.INVALID_OTP)
			}
			const data = await userDao.checkOTP(params, userData);
			if (config.SERVER.ENVIRONMENT !== "production") {
				if (params.otp === config.CONSTANT.BYPASS_OTP) {
					if (params.type === 'mobile') {
						const dataToUpdate = {
							isMobileVerified: true,
						}
						const statusUpdate = await userDao.updateOne('users', { _id: userData.userId }, dataToUpdate, {});
						// return userConstant.MESSAGES.SUCCESS.DEFAULT_WITH_DATA(data);
						if (data && !data.dob || !data.dob == null && data.industryType) {
							return userConstant.MESSAGES.SUCCESS.REGISTER_BDAY({ profileStep: config.CONSTANT.HTTP_STATUS_CODE.REGISTER_BDAY, accessToken: accessToken });
						}
						data['isPasswordAvailable'] = (data && data['hash']) ? true : false;
						return userConstant.MESSAGES.SUCCESS.LOGIN({ profileStep: config.CONSTANT.HTTP_STATUS_CODE.LOGIN_STATUS_HOME_SCREEN, "accessToken": accessToken, ...data });
					}
					else if (params.type === 'email') {
						const dataToUpdate = {
							isEmailVerified: true,
						}
						await userDao.updateOne('users', { _id: userData.userId }, dataToUpdate, {});
						return userConstant.MESSAGES.SUCCESS.DEFAULT_WITH_DATA({});
					}
					return userConstant.MESSAGES.SUCCESS.DEFAULT_WITH_DATA({});
				}
				return Promise.reject(userConstant.MESSAGES.ERROR.OTP_NOT_MATCH);
			}
			else if (config.SERVER.ENVIRONMENT == "production") {
				// const data = await userDao.checkOTP(params);
				if (params.type === 'mobile') {
					if (data.mobileOtp === params.otp) {
						const dataToUpdate = {
							isMobileVerified: true,
							mobileOtp: 0
						}
						await userDao.updateOne('users', { _id: userData.userId }, dataToUpdate, {});
						// return userConstant.MESSAGES.SUCCESS.DEFAULT_WITH_DATA({})
						// return userConstant.MESSAGES.SUCCESS.LOGIN({ profileStep: config.CONSTANT.HTTP_STATUS_CODE.LOGIN_STATUS_HOME_SCREEN, "accessToken": accessToken, "refreshToken": refreshToken, ...step1 });
						if (data && !data.dob || !data.dob == null && data.industryType) {
							return userConstant.MESSAGES.SUCCESS.REGISTER_BDAY({ profileStep: config.CONSTANT.HTTP_STATUS_CODE.REGISTER_BDAY, accessToken: accessToken });
						}
						return userConstant.MESSAGES.SUCCESS.LOGIN({ profileStep: config.CONSTANT.HTTP_STATUS_CODE.LOGIN_STATUS_HOME_SCREEN, "accessToken": accessToken, ...data });
					};
				}

				return Promise.reject(userConstant.MESSAGES.ERROR.OTP_NOT_MATCH);
			}

		} catch (error) {
			return Promise.reject(error)
		}
	}
	/**
	 * 
	 * @verifyForGotOTP user verify forGotOtp
	 * @description user veify forgot password otp 
	 */
	async verifyForGotOTP(params: UserRequest.verifyOTP) {
		try {
			if (params.otp === '0000') {
				return Promise.reject(config.CONSTANT.MESSAGES.ERROR.INVALID_OTP)
			}
			const data = await userDao.checkForgotOtp(params);
			if (!data) {
				return Promise.reject(config.CONSTANT.MESSAGES.ERROR.INVALID_MOBILE_NUMBER)
			}
			if (!data.salt || !data.hash) {
				return Promise.reject(userConstant.MESSAGES.ERROR.CANNOT_CHANGE_PASSWORD);
			}

			if (config.SERVER.ENVIRONMENT !== "production") {
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

					// const salt = await appUtils.CryptDataMD5(data._id + "." + new Date().getTime() + "." + params.deviceId);

					const userObject = appUtils.buildToken(tokenData);

					const accessToken = await tokenManager.generateUserToken({ "type": "FORGOT_PASSWORD", "object": userObject, "salt": data.salt });
					const refreshToken = appUtils.encodeToBase64(appUtils.genRandomString(32));
					let step3;
					if (config.SERVER.IS_SINGLE_DEVICE_LOGIN) {
						await loginHistoryDao.removeDeviceById({ "userId": data._id });
						step3 = await loginHistoryDao.findDeviceLastLogin({ "userId": data._id });
					} else {
						await loginHistoryDao.removeDeviceById({ "userId": data._id, "deviceId": params.deviceId });
						step3 = await loginHistoryDao.findDeviceLastLogin({ "userId": data._id, "deviceId": params.deviceId });
					}
					params = _.extend(params, { "salt": data.salt, "refreshToken": refreshToken, "lastLogin": step3 });
					loginHistoryDao.createUserLoginHistory(params);
					return userConstant.MESSAGES.SUCCESS.OTP_VERIFIED_SUCCESSFULLY({ "accessToken": accessToken });
				}
				return Promise.reject(userConstant.MESSAGES.ERROR.OTP_NOT_MATCH);
			}
			else {
				// const data = await userDao.checkOTP(params);
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
						await userDao.updateOne('users', criteria, dataToUpdate, {});
						return userConstant.MESSAGES.SUCCESS.DEFAULT;
					};
				}
				return userConstant.MESSAGES.ERROR.OTP_NOT_MATCH

			}

		} catch (error) {
			return Promise.reject(error)
		}
	}
	/**
	 * @function resetPassword
	 * @default user reset password after verify lonk of phne number 
	 */
	async resetPassword(params) {
		try {
			if (params.token) {
				params['accessToken'] = params.token;
			}

			// let jwtPayload = await tokenManager.decodeToken({ "accessToken": params.accessToken });
			// console.log('jwtPayloadjwtPayload', jwtPayload);

			// const isExpire = appUtils.isTimeExpired(jwtPayload.payload.exp * 1000);
			// console.log('isExpireisExpireisExpireisExpireisExpireisExpire', isExpire);

			if (params.type === 'mobile') {
				const tokenData = await verifyToken(params, 'FORGOT_PASSWORD', false)

				params['countryCode'] = tokenData['countryCode'];
				params['mobileNo'] = tokenData['mobileNo'];

				const step1 = await userDao.findOne('users', { _id: tokenData.userId }, {}, {})  //(tokenData);

				params.hash = appUtils.encryptHashPassword(params.password, step1.salt);
				const step2 = userDao.changeForgotPassword(params, { userId: tokenData.userId });
				return userConstant.MESSAGES.SUCCESS.RESET_PASSWORD_SUCCESSFULLY

			} else {
				const step1 = await userDao.findOne('users', { forgotToken: params.accessToken }, {}, {})  //(tokenData);
				console.log('step1step1step1', step1);

				if (!step1 || (step1 && step1.forgotToken === "") || !step1.forgotToken) {
					return Promise.reject(userConstant.MESSAGES.ERROR.LINK_EXPIRED)
				}
				params.hash = appUtils.encryptHashPassword(params.password, step1.salt);
				const step2 = userDao.changeForgotPassword(params, { userId: step1._id });
				if (step2) {
					userDao.emptyForgotToken({ "token": params.token });
				}
				return userConstant.MESSAGES.SUCCESS.RESET_PASSWORD_SUCCESSFULLY
			}
		} catch (error) {
			throw error;
		}
	}
	/**
	 * 
	 * @function getProfileHome 
	 * @description user profile from 3 section inside home screen  
	 */
	async getProfileHome(query, tokenData) {
		try {
			let getData: any = {}
			if (query.type === config.CONSTANT.USER_PROFILE_TYPE.POST) {
				// getData = await gratitudeJournalDao.userProfileHome(query, tokenData);
				getData = await forumtopicDao.getFormPostsForProfile(query, tokenData);
			} else if (query.type === config.CONSTANT.USER_PROFILE_TYPE.DISCOVER) {
				getData = await discoverDao.getDiscoverData(query, { userId: tokenData.userId }, true)
				if (query && query.userId && getData && getData.data && getData.data.length > 0) {
					for (let i = 0; i < getData.data.length; i++) {
						let members = await userDao.getMembers({ followerId: getData.data[i].user._id.toString(), userId: tokenData.userId })
						if (members) {
							getData.data[i].user.discover_status = CONSTANT.DISCOVER_STATUS.ACCEPT
							getData.data[i].discover_status = CONSTANT.DISCOVER_STATUS.ACCEPT
						} else {
							let params: any = {}
							params = {
								pageNo: 1,
								limit: 1,
								followerId: getData.data[i].user._id.toString()
							}
							let getDataa = await discoverDao.getDiscoverData(params, { userId: tokenData.userId }, false)
							if (getDataa && getDataa.total && getDataa.total > 0) {
								getData.data[i].user.discover_status = getDataa.data[0].user.discover_status
								getData.data[i].discover_status = getDataa.data[0].user.discover_status
							} else {
								getData.data[i].user.discover_status = CONSTANT.DISCOVER_STATUS.NO_ACTION
								getData.data[i].discover_status = CONSTANT.DISCOVER_STATUS.NO_ACTION
							}
						}
					}
				}
			} else {
				getData = await gratitudeJournalDao.userProfileHome(query, tokenData)
			}
			return getData;
		} catch (error) {
			return Promise.reject(error);
		}
	}
	/**
	 * @function changePassword 
	 * @description user chanage passord from application  
	 */
	async changePassword(params, tokenData) {
		try {
			const step1 = await userDao.findUserById(tokenData);
			const oldHash = await appUtils.encryptHashPassword(params.oldPassword, step1.salt);
			if (oldHash !== step1.hash) {
				return Promise.reject(userConstant.MESSAGES.ERROR.INVALID_OLD_PASSWORD);
			} else {
				params.hash = appUtils.encryptHashPassword(params.newPassword, step1.salt);
				const step2 = userDao.changePassword(params, tokenData);
			}

			return userConstant.MESSAGES.SUCCESS.CHANGE_PASSWORD;
		} catch (error) {
			errorReporter(error);
			return Promise.reject(error);
		}
	}


	async getMemberOfDayDetail(tokenData) {
		try {
			const data = await userDaoMember.userDao.getMemberOfDays({ userId: tokenData.userId });
			return data;
		} catch (error) {
			errorReporter(error);
			return Promise.reject(error);
		}
	}

	/**
	 * @function updateUserLocation
	*/
	async updateUserLocation(params: UserRequest.Location, tokenData: TokenData) {
		try {
			let getUser = await userDao.findUserById(tokenData); // get user details
			if (getUser && getUser.status === CONSTANT.STATUS.ACTIVE) {
				await userDao.changeUserLocation(params, tokenData);
			}
			return userConstant.MESSAGES.SUCCESS.CHANGE_LOCATION;
		} catch (error) {
			throw error;
		}
	}

}

export const userController = new UserController();