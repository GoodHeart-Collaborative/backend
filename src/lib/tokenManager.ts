"use strict";

import * as _ from "lodash";
import * as Jwt from "jsonwebtoken";
import * as jwtRefresh from "jsonwebtoken-refresh";

import * as config from "@config/index";
import { loginHistoryDao } from "@modules/loginHistory/LoginHistoryDao";
import { redisClient } from "@lib/redis/RedisClient";
import { responseHandler } from "@utils/ResponseHandler";
import { userDao } from "@modules/user/v1/UserDao";

export const generateAdminToken = async function (params) {
	try {
		if (params.type === "CREATE_ADMIN" || params.type === "FORGOT_PASSWORD") {
			return await Jwt.sign(params.object, config.SERVER.JWT_CERT_KEY, { algorithm: config.SERVER.JWT_ALGO, expiresIn: "10m" }); // 10 min
		} else if (params.type === "ADMIN_LOGIN") {
			return await Jwt.sign(params.object, config.SERVER.JWT_CERT_KEY, { algorithm: config.SERVER.JWT_ALGO, expiresIn: config.SERVER.LOGIN_TOKEN_EXPIRATION_TIME / 1000 }); // 180 days (in secs)
		}
	} catch (error) {
		return Promise.reject(responseHandler.sendError(config.CONSTANT.MESSAGES.ERROR.TOKEN_GENERATE_ERROR(error)));
	}
};

export const generateUserToken = async function (params) {
	try {
		if (params.type === "USER_SIGNUP" || params.type === "USER_LOGIN") {
			return await Jwt.sign(params.object, params.salt, { algorithm: config.SERVER.JWT_ALGO, expiresIn: config.SERVER.LOGIN_TOKEN_EXPIRATION_TIME / 1000 }); // 180 days
		} else if (params.type === "FORGOT_PASSWORD") {
			return await Jwt.sign(params.object, config.SERVER.JWT_CERT_KEY, { algorithm: config.SERVER.JWT_ALGO, expiresIn: "10m" }); // 10 min
		}
	} catch (error) {
		return Promise.reject(responseHandler.sendError(config.CONSTANT.MESSAGES.ERROR.TOKEN_GENERATE_ERROR(error)));
	}
};

const _verifyTokenError = async function (error, auth) {
	if (auth && error.name === "TokenExpiredError") {
		return Promise.reject(responseHandler.sendError(config.CONSTANT.MESSAGES.ERROR.SESSION_EXPIRED));
	} else if (auth && error.name !== "TokenExpiredError") {
		return Promise.reject(responseHandler.sendError(config.CONSTANT.MESSAGES.ERROR.INVALID_TOKEN));
	} else if (!auth && error.name === "TokenExpiredError") {
		return Promise.reject(config.CONSTANT.MESSAGES.ERROR.SESSION_EXPIRED);
	} else if (!auth && error.name !== "TokenExpiredError") {
		return Promise.reject(config.CONSTANT.MESSAGES.ERROR.INVALID_TOKEN);
	}
};

export const verifyToken = async function (params, accountLevel, auth) {
	try {
		switch (accountLevel) {
			case "common":
				return await Jwt.verify(params.accessToken, config.SERVER.JWT_CERT_KEY, { algorithms: [config.SERVER.JWT_ALGO] });
			case config.CONSTANT.ACCOUNT_LEVEL.ADMIN:
				return await Jwt.verify(params.accessToken, config.SERVER.JWT_CERT_KEY, { algorithms: [config.SERVER.JWT_ALGO] });
			case config.CONSTANT.ACCOUNT_LEVEL.USER:
				return await Jwt.verify(params.accessToken, params.salt, { algorithms: [config.SERVER.JWT_ALGO] });
		}
		return await Jwt.verify(params.accessToken, config.SERVER.JWT_CERT_KEY, { algorithms: [config.SERVER.JWT_ALGO] });
	} catch (error) {
		console.log("verifyToken=======================>", error);
		return _verifyTokenError(error, auth);
	}
};

export const decodeToken = async function (params) {
	try {
		const jwtPayload = await Jwt.decode(params.accessToken, { complete: true });
		if (!jwtPayload) {
			return Promise.reject(responseHandler.sendError(config.CONSTANT.MESSAGES.ERROR.INVALID_TOKEN));
		} else {
			return jwtPayload;
		}
	} catch (error) {
		console.log("decodeToken=======================>", error);
		return Promise.reject(responseHandler.sendError(config.CONSTANT.MESSAGES.ERROR.INVALID_TOKEN));
	}
};

export const refreshToken = async function (params, accountLevel) {
	try {
		switch (accountLevel) {
			case config.CONSTANT.ACCOUNT_LEVEL.ADMIN:
				return await jwtRefresh.refresh(params, "180d", config.SERVER.JWT_CERT_KEY);
			case config.CONSTANT.ACCOUNT_LEVEL.USER:
				return await jwtRefresh.refresh(params.object, "180d", params.salt);
		}
	} catch (error) {
		console.log("refreshToken=======================>", error);
		return Promise.reject(responseHandler.sendError(config.CONSTANT.MESSAGES.ERROR.INVALID_TOKEN));
	}
};

export const verifySocketToken = async function (socket, accessToken) {
	try {
		const jwtPayload = await decodeToken({ accessToken });
		const tokenData = await verifyToken({ "accessToken": accessToken, "salt": jwtPayload.payload.salt }, config.CONSTANT.ACCOUNT_LEVEL.USER, false);
		if (config.SERVER.IS_REDIS_ENABLE) {
			const step1 = await redisClient.getValue(accessToken);
			if (!step1) {
				if (config.SERVER.IS_SINGLE_DEVICE_LOGIN) {
					const step2 = loginHistoryDao.removeDeviceById({ "userId": tokenData.userId });
				} else {
					const step2 = loginHistoryDao.removeDeviceById({ "userId": tokenData.userId, "deviceId": tokenData.deviceId });
				}
				socket.emit(config.CONSTANT.SOCKET.EVENT.SOCKET_ERROR, config.CONSTANT.MESSAGES.ERROR.SESSION_EXPIRED);
			}
		}
		let userData = await userDao.findUserById({ "userId": tokenData.userId });
		if (!userData) {
			socket.emit(config.CONSTANT.SOCKET.EVENT.SOCKET_ERROR, config.CONSTANT.MESSAGES.ERROR.USER_NOT_FOUND);
		} else {
			if (userData.status === config.CONSTANT.STATUS.BLOCKED) {
				return Promise.reject(responseHandler.sendError(config.CONSTANT.MESSAGES.ERROR.BLOCKED));
			} else if (userData.status === config.CONSTANT.STATUS.DELETED) {
				socket.emit(config.CONSTANT.SOCKET.EVENT.SOCKET_ERROR, config.CONSTANT.MESSAGES.ERROR.DELETED);
			} else {
				const step3 = await loginHistoryDao.findDeviceById({ "userId": tokenData.userId, "deviceId": tokenData.deviceId, "salt": jwtPayload.payload.salt });
				if (!step3) {
					socket.emit(config.CONSTANT.SOCKET.EVENT.SOCKET_ERROR, config.CONSTANT.MESSAGES.ERROR.SESSION_EXPIRED);
				} else {
					userData = _.extend(userData, { "deviceId": tokenData.deviceId, "accountLevel": tokenData.accountLevel, "platform": tokenData.platform, "userId": tokenData.userId });
					return tokenData["userData"] = userData;
				}
			}
		}
	} catch (error) {
		throw error;
	}
};