"use strict";

import * as _ from "lodash";

import * as appUtils from "@utils/appUtils";
import { BaseDao } from "@modules/base/BaseDao";
import * as config from "@config/constant";

export class AdminDao extends BaseDao {

	/**
	 * @function isEmailExists
	 */
	async isEmailExists(params, tokenData?: TokenData | any) {
		try {
			const query: any = {};
			query.email = params.email;
			if (tokenData.userId) {
				query._id = { "$not": { "$eq": tokenData.userId } };
			}
			query.status = { "$ne": config.CONSTANT.STATUS.DELETED };

			const projection = { updatedAt: 0 };

			const options = { new: true, lean: true };

			return await this.findOne("admins", query, projection, options, {});
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function findAdminById
	 */
	async findAdminById(params: UserId) {
		try {
			const query: any = {};
			query._id = params.userId;
			query.status = { "$ne": config.CONSTANT.STATUS.DELETED };

			const projection = { updatedAt: 0 };

			const options = { new: true, lean: true };

			return await this.findOne("admins", query, projection, options, {});
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function createAdmin
	 */
	async createAdmin(params: SubAdminRequest.Create) {
		try {
			params.created = Date.now();
			return await this.save("admins", params);
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function addForgotToken
	 */
	async addForgotToken(params: ForgotPasswordRequest) {
		try {
			const query: any = {};
			query._id = params.userId;

			const update = {};
			update["$set"] = {
				"forgotToken": params.forgotToken
			};

			return await this.updateOne("admins", query, update, {});
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function emptyForgotToken
	 */
	async emptyForgotToken(params) {
		try {
			const query: any = {};
			if (params.token) {
				query.forgotToken = params.token;
			}
			if (params.userId) {
				query._id = params.userId;
			}

			const update = {};
			update["$unset"] = {
				"forgotToken": ""
			};

			return await this.updateOne("admins", query, update, {});
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function subAdminList
	 */
	async subAdminList(params: ListingRequest) {
		try {
			const { pageNo, limit, searchKey, sortBy, sortOrder, status } = params;
			const aggPipe = [];

			const match: any = {};
			match.adminType = config.CONSTANT.ADMIN_TYPE.SUB_ADMIN;
			if (status) {
				match["$and"] = [{ status: status }, { "$ne": config.CONSTANT.STATUS.DELETED }];
			} else {
				match.status = { "$ne": config.CONSTANT.STATUS.DELETED };
			}
			if (searchKey) {
				match["$or"] = [
					{ "name": { "$regex": searchKey, "$options": "-i" } },
					{ "email": { "$regex": searchKey, "$options": "-i" } }
				];
			}
			aggPipe.push({ "$match": match });

			const project = { _id: 1, name: 1, email: 1, created: 1, status: 1 };
			aggPipe.push({ "$project": project });

			let sort = {};
			if (sortBy && sortOrder) {
				if (sortBy === "name") {
					sort = { "name": sortOrder };
				} else {
					sort = { "created": sortOrder };
				}
			} else {
				sort = { "created": -1 };
			}
			aggPipe.push({ "$sort": sort });

			return await this.paginate("admins", aggPipe, limit, pageNo, true);
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function deleteSubAdmin
	 */
	async deleteSubAdmin(params: UserId) {
		try {
			const query: any = {};
			query._id = params.userId;

			const update = {};
			update["$set"] = {
				"status": config.CONSTANT.STATUS.DELETED
			};

			return await this.updateOne("admins", query, update, {});
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function editSubAdmin
	 */
	async editSubAdmin(params: SubAdminRequest.Edit) {
		try {
			params.permission = params.permission ? params.permission : [];
			const query: any = {};
			query._id = params.userId;

			let set = {};
			const update = {};
			update["$set"] = set;

			const fieldsToFill = ["name", "email", "salt", "hash", "permission"];
			set = appUtils.setInsertObject(params, set, fieldsToFill);

			return await this.updateOne("admins", query, update, {});
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function blockUnblock
	 */
	async blockUnblock(params: BlockRequest) {
		try {
			const query: any = {};
			query._id = params.userId;

			const update = {};
			update["$set"] = {
				"status": params.status
			};

			return await this.updateOne("admins", query, update, {});
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function changePassword
	 */
	async changePassword(params: ChangeForgotPasswordRequest | ChangePasswordRequest, tokenData: TokenData) {
		try {
			const query: any = {};
			query._id = tokenData.userId;

			const update = {};
			update["$set"] = {
				"hash": params.hash
			};

			return await this.updateOne("admins", query, update, {});
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function editProfile
	 */
	async editProfile(params: AdminRequest.EditProfile, tokenData: TokenData) {
		try {
			const query: any = {};
			query._id = tokenData.userId;

			const update = {};
			update["$set"] = {
				"name": params.name,
				"email": params.email
			};

			const options = { new: true };

			return await this.findOneAndUpdate("admins", query, update, options);
		} catch (error) {
			throw error;
		}
	}
}

export const adminDao = new AdminDao();