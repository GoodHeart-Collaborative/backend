"use strict";

import * as _ from "lodash";
import * as AuthBearer from "hapi-auth-bearer-token";
import { Request, ResponseToolkit } from "hapi";

import { adminDao } from "@modules/admin/users/AdminDao";
import * as config from "@config/index";
import { loginHistoryDao } from "@modules/loginHistory/LoginHistoryDao";
import { redisClient } from "@lib/redis/RedisClient";
import { responseHandler } from "@utils/ResponseHandler";
import * as tokenManager from "@lib/tokenManager";
import { userDao } from "@modules/user/v1/UserDao";

// Register Authorization Plugin
export const plugin = {
	name: "auth-token-plugin",
	register: async function (server) {
		await server.register(AuthBearer);

		/**
		 * @function AdminAuth
		 */
		server.auth.strategy("AdminAuth", "bearer-access-token", {
			allowQueryToken: false,
			allowMultipleHeaders: true,
			accessTokenName: "accessToken",
			validate: async (request: Request, accessToken: string, h: ResponseToolkit) => {
				try {
					const isValid = await apiKeyFunction(request.headers.api_key);
					console.log('isValidisValidisValid', isValid);

					if (!isValid) {
						return ({ isValid: false, credentials: { accessToken: accessToken, tokenData: {} } });
					} else {
						const tokenData = await tokenManager.verifyToken({ accessToken }, config.CONSTANT.ACCOUNT_LEVEL.ADMIN, true);
						console.log('tokenDatatokenDatatokenData>>>>>>>>>.', tokenData);

						let adminData = await adminDao.findAdminById({ "userId": tokenData.userId });
						if (!adminData) {
							return Promise.reject(responseHandler.sendError(config.CONSTANT.MESSAGES.ERROR.INVALID_TOKEN));
						}
						delete adminData._id, delete adminData.createdAt;
						if (adminData.status === config.CONSTANT.STATUS.BLOCKED) {
							return Promise.reject(responseHandler.sendError(config.CONSTANT.MESSAGES.ERROR.BLOCKED));
						} else {
							const step1 = await loginHistoryDao.findDeviceById({ "userId": tokenData.userId, "deviceId": tokenData.deviceId });
							if (!step1) {
								return Promise.reject(responseHandler.sendError(config.CONSTANT.MESSAGES.ERROR.SESSION_EXPIRED));
							}
							adminData = _.extend(adminData, { "deviceId": tokenData.deviceId, "accountLevel": tokenData.accountLevel, "platform": tokenData.platform, "userId": tokenData.userId, "lastLogin": step1.lastLogin });
							tokenData["adminData"] = adminData;
							return ({ isValid: true, credentials: { accessToken: accessToken, tokenData: tokenData } });
						}
					}
				} catch (error) {
					throw error;
				}
			}
		});

		/**
		 * @function UserAuth
		 * @description if IS_REDIS_ENABLE set to true,
		 * than redisClient.getList() function fetch value from redis.
		 */
		server.auth.strategy("UserAuth", "bearer-access-token", {
			allowQueryToken: false,
			allowMultipleHeaders: true,
			accessTokenName: "accessToken",
			allowChaining: false,
			validate: async (request: Request, accessToken: string, h: ResponseToolkit) => {
				try {
					console.log('UserAuthUserAuthUserAuthUserAuthUserAuthUserAuth', accessToken);

					const isValid = await apiKeyFunction(request.headers.api_key);
					console.log('isValidisValidisValid', isValid);
					if (!isValid) {

						return ({ isValid: false, credentials: { accessToken: accessToken, tokenData: {} } });
					} else {
						// const jwtPayload = JSON.parse(appUtils.decodeBase64(accessToken.split('.')[1]));
						const jwtPayload = await tokenManager.decodeToken({ accessToken });
						console.log('jwtPayloadjwtPayloadjwtPayloadjwtPayload', jwtPayload);
						const tokenData = await tokenManager.verifyToken({ "accessToken": accessToken, "salt": jwtPayload.payload.salt }, config.CONSTANT.ACCOUNT_LEVEL.USER, true);
						console.log('tokenDatatokenDatatokenDatatokenData', tokenData);

						if (config.SERVER.IS_REDIS_ENABLE) {
							const step1 = await redisClient.getValue(accessToken);
							if (!step1) {
								if (config.SERVER.IS_SINGLE_DEVICE_LOGIN) {
									const step2 = loginHistoryDao.removeDeviceById({ "userId": tokenData.userId });
								} else {
									const step2 = loginHistoryDao.removeDeviceById({ "userId": tokenData.userId, "deviceId": tokenData.deviceId });
								}
								return Promise.reject(responseHandler.sendError(config.CONSTANT.MESSAGES.ERROR.SESSION_EXPIRED));
							} else {
								if (config.SERVER.IN_ACTIVITY_SESSION) {
									redisClient.setExp(accessToken, config.SERVER.LOGIN_TOKEN_EXPIRATION_TIME / 1000, step1);
								}
							}
						}
						let userData = await userDao.findUserById({ "userId": tokenData.userId });
						console.log('userDatauserData', userData);

						if (!userData) {
							return Promise.reject(responseHandler.sendError(config.CONSTANT.MESSAGES.ERROR.INVALID_TOKEN));
						} else {
							delete userData._id, delete userData.createdAt;
							if (userData.status === config.CONSTANT.STATUS.BLOCKED) {
								return Promise.reject(responseHandler.sendError(config.CONSTANT.MESSAGES.ERROR.BLOCKED));
							} else {
								const step3 = await loginHistoryDao.findDeviceById({ "userId": tokenData.userId, "deviceId": tokenData.deviceId, "salt": jwtPayload.payload.salt });
								console.log('step3step3step3', step3);
								if (!step3) {
									return Promise.reject(responseHandler.sendError(config.CONSTANT.MESSAGES.ERROR.SESSION_EXPIRED));
								} else {
									userData = _.extend(userData, { "deviceId": tokenData.deviceId, "accountLevel": tokenData.accountLevel, "platform": tokenData.platform, "userId": tokenData.userId, "lastLogin": step3.lastLogin });
									tokenData["userData"] = userData;
									console.log('tokenDatatokenDatatokenData', tokenData);
									return ({ isValid: true, credentials: { accessToken: accessToken, tokenData: tokenData } });
								}
							}
						}
					}
				} catch (error) {
					throw error;
				}
			}
		});

		await server.register(require("hapi-auth-basic"));

		// /**
		//  * @function BasicAuth
		//  */
		// server.auth.strategy("BasicAuth", "basic", {
		// 	allowQueryToken: false,
		// 	allowMultipleHeaders: true,
		// 	accessTokenName: "accessToken",
		// 	allowChaining: true,
		// 	validate: async (request: Hapi.Request, username: string, password: string, h: Hapi.ResponseToolkit) => {
		// 		try {
		// 			if (!username || !password || username !== config.SERVER.BASIC_AUTH.NAME || password !== config.SERVER.BASIC_AUTH.PASS) {
		// 				return ({ isValid: false, credentials: {} });
		// 			} else {
		// 				return ({ isValid: true, credentials: {} });
		// 			}
		// 		} catch (error) {
		// 			throw error;
		// 		}
		// 	}
		// });

		/**
		 * @function BasicAuth
		 */
		server.auth.strategy("BasicAuth", "bearer-access-token", {
			tokenType: "Basic",
			validate: async (request: Request, token, h: ResponseToolkit) => {
				// validate user and pwd here
				const checkFunction = await basicAuthFunction(token);
				console.log('checkFunctioncheckFunctioncheckFunction', checkFunction);

				if (!checkFunction) {
					return ({ isValid: false, credentials: { token, userData: {} } });
				}
				return ({ isValid: true, credentials: { token, userData: {} } });
			}
		});

		/**
		 * DoubleAuth -: conbination of both basic auth and userAuth
		 */
		server.auth.strategy("DoubleAuth", "bearer-access-token", {
			allowQueryToken: false,
			allowMultipleHeaders: true,
			// accessTokenName: "accessToken",
			// tokenType: "Basic" || "Bearer" || "bearer",
			validate: async (request: Request, accessToken, h: ResponseToolkit) => {
				console.log('accessToken11111111111111111111111', accessToken);

				const checkFunction = await basicAuthFunction(accessToken);
				if (checkFunction) {
					return ({ isValid: true, credentials: { token: accessToken, userData: {} } });
				} else {
					const jwtPayload = await tokenManager.decodeToken({ accessToken });
					const tokenData = await tokenManager.verifyToken({ "accessToken": accessToken, "salt": jwtPayload.payload.salt }, config.CONSTANT.ACCOUNT_LEVEL.USER, true);
					if (config.SERVER.IS_REDIS_ENABLE) {
						const step1 = await redisClient.getValue(accessToken);
						if (!step1) {
							if (config.SERVER.IS_SINGLE_DEVICE_LOGIN) {
								const step2 = loginHistoryDao.removeDeviceById({ "userId": tokenData.userId });
							} else {
								const step2 = loginHistoryDao.removeDeviceById({ "userId": tokenData.userId, "deviceId": tokenData.deviceId });
							}
							return Promise.reject(responseHandler.sendError(config.CONSTANT.MESSAGES.ERROR.SESSION_EXPIRED));
						} else {
							if (config.SERVER.IN_ACTIVITY_SESSION) {
								redisClient.setExp(accessToken, config.SERVER.LOGIN_TOKEN_EXPIRATION_TIME / 1000, step1);
							}
						}
					}
					let userData = await userDao.findUserById({ "userId": tokenData.userId });
					if (!userData) {
						return Promise.reject(responseHandler.sendError(config.CONSTANT.MESSAGES.ERROR.INVALID_TOKEN));
					} else {
						delete userData._id, delete userData.createdAt;
						if (userData.status === config.CONSTANT.STATUS.BLOCKED) {
							return Promise.reject(responseHandler.sendError(config.CONSTANT.MESSAGES.ERROR.BLOCKED));
						} else {
							const step3 = await loginHistoryDao.findDeviceById({ "userId": tokenData.userId, "deviceId": tokenData.deviceId, "salt": jwtPayload.payload.salt });
							if (!step3) {
								return Promise.reject(responseHandler.sendError(config.CONSTANT.MESSAGES.ERROR.SESSION_EXPIRED));
							} else {
								userData = _.extend(userData, { "deviceId": tokenData.deviceId, "accountLevel": tokenData.accountLevel, "platform": tokenData.platform, "userId": tokenData.userId, "lastLogin": step3.lastLogin });
								tokenData["userData"] = userData;
								return ({ isValid: true, credentials: { accessToken: accessToken, tokenData: tokenData } });
							}
						}
					}
				}
			}
		});

		/**
		 * @function RefreshToken
		 */
		server.auth.strategy("RefreshToken", "bearer-access-token", {
			allowQueryToken: false,
			allowMultipleHeaders: true,
			accessTokenName: "accessToken",
			validate: async (request: Request, accessToken: string, h: ResponseToolkit) => {
				try {
					const isValid = await apiKeyFunction(request.headers.api_key);

					if (!isValid) {
						return ({ isValid: false, credentials: {} });
					} else {
						const jwtPayload = await tokenManager.decodeToken({ accessToken });
						if (!jwtPayload) {
							return Promise.reject(responseHandler.sendError(config.CONSTANT.MESSAGES.ERROR.INVALID_TOKEN));
						} else {
							return ({ isValid: true, credentials: { accessToken: accessToken, tokenData: jwtPayload } });
						}
					}
				} catch (error) {
					throw error;
				}
			}
		});

		// server.auth.default('BasicAuth');
	}
};

const apiKeyFunction = async function (apiKey) {
	try {
		return (apiKey === config.SERVER.API_KEY) ? true : false;
	} catch (error) {
		throw error;
	}
};

const basicAuthFunction = async function (accessToken) {
	console.log('accessTokenaccessTokenaccessToken,accessToken', accessToken);

	const credentials = Buffer.from(accessToken, "base64").toString("ascii");
	const [username, password] = credentials.split(":");
	if (username !== config.SERVER.BASIC_AUTH.NAME || password !== config.SERVER.BASIC_AUTH.PASS) { return false; }
	return true;
};