"use strict";

import { BaseDao } from "@modules/base/BaseDao";
import * as config from "@config/constant";

export class LoginHistoryDao extends BaseDao {

	/**
	 * @function findDeviceLastLogin
	 */
	async findDeviceLastLogin(params: Device) {
		try {
			const query: any = {};
			query.userId = params.userId;
			if (params.deviceId) {
				query.deviceId = params.deviceId;
			}
			query.isLogin = false;

			const projection = { lastLogin: 1 };

			const options: any = { lean: true };

			const response = await this.find("login_histories", query, projection, options, {}, {}, {});
			return response.length ? response[response.length - 1].lastLogin : Date.now();
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function createUserLoginHistory
	 */
	async createUserLoginHistory(params: any) { // LoginHistoryRequest
		try {
			params.isLogin = true;
			params["created"] = new Date().getTime()
			return await this.save("login_histories", params);
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function removeDeviceById
	 */
	async removeDeviceById(params: Device) {
		try {
			const query: any = {};
			query.userId = params.userId;
			if (params.deviceId) {
				query.deviceId = params.deviceId;
			}
			query.isLogin = true;

			const update = {};
			update["$set"] = {
				"isLogin": false,
				"lastLogin": Date.now()
			};
			update["$unset"] = { deviceToken: "", arn: "", refreshToken: "" };

			const options: any = { multi: true };

			return await this.updateMany("login_histories", query, update, options);
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function findDeviceById
	 */
	async findDeviceById(params: Device) {
		try {
			const query: any = {};
			query.deviceId = params.deviceId;
			query.userId = params.userId;
			if (params.salt) {
				query.salt = params.salt;
			}
			query.isLogin = true;

			const projection = { salt: 1, refreshToken: 1, lastLogin: 1 };

			const options = { lean: true };

			return await this.findOne("login_histories", query, projection, options, {});
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function updateRefreshToken
	 */
	async updateRefreshToken(params: Device) {
		try {
			const query: any = {};
			query.deviceId = params.deviceId;
			query.userId = params.userId;
			query.isLogin = true;

			const update = {};
			update["$set"] = {
				"refreshToken": params.refreshToken
			};

			return await this.updateOne("login_histories", query, update, {});
		} catch (error) {
			throw error;
		}
	}
}

export const loginHistoryDao = new LoginHistoryDao();