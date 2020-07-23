"use strict";

import { BaseDao } from "@modules/base/BaseDao";
import * as config from "@config/constant";

export class LogDao extends BaseDao {

	async updateUser(params, tokenData: TokenData, type: string) {
		try {
			const data: LogRequest.Add = {
				"collectionName": "users",
				"userId": tokenData.userId,
				"data": params,
				"crudAction": "UPDATE",
				"actionType": type,
				"created": new Date().getTime()
			};
			return await this.save("users", data);
		} catch (error) {
			throw error;
		}
	}

	async deleteUser(params, tokenData: TokenData) {
		try {
			const data: LogRequest.Add = {
				"collectionName": "users",
				"userId": tokenData.userId,
				"data": params,
				"crudAction": "DELETE",
				"actionType": config.CONSTANT.LOG_HISTORY_TYPE.DELETE_USER,
				"created": new Date().getTime()
			};
			return await this.save("users", data);
		} catch (error) {
			throw error;
		}
	}
}

export const logDao = new LogDao();