"use strict";

import * as _ from "lodash";
import * as Jwt from "jsonwebtoken";
import * as jwtRefresh from "jsonwebtoken-refresh";

import * as config from "@config/index";
import { responseHandler } from "@utils/ResponseHandler";

export const generateAdminToken = async function (params) {
	try {
		if (params.type === "CREATE_ADMIN" || params.type === "FORGOT_PASSWORD") {
			return await Jwt.sign(params.object, config.SERVER.JWT_CERT_KEY, { algorithm: config.SERVER.JWT_ALGO, expiresIn: "1h" }); // 10 min
		} else if (params.type === "ADMIN_LOGIN") {
			return await Jwt.sign(params.object, config.SERVER.JWT_CERT_KEY, { algorithm: config.SERVER.JWT_ALGO, expiresIn: 43200000 }); // 180 days (in secs)
			// return await Jwt.sign(params.object, config.SERVER.JWT_CERT_KEY, { algorithm: config.SERVER.JWT_ALGO, expiresIn: config.SERVER.LOGIN_TOKEN_EXPIRATION_TIME / 1000 }); // 180 days (in secs)
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
			return await Jwt.sign(params.object, config.SERVER.JWT_CERT_KEY, { algorithm: config.SERVER.JWT_ALGO, expiresIn: "50m" }); // 10 min
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