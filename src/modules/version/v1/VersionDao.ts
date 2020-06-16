"use strict";

import { BaseDao } from "@modules/base/BaseDao";
import * as config from "@config/constant";

export class VersionDao extends BaseDao {

	/**
	 * @function addVersion
	 */
	async addVersion(params: VersionRequest.Add) {
		try {
			params.created = Date.now();
			return await this.save("versions", params);
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function versionList
	 */
	async versionList(params: ListingRequest) {
		try {
			const { pageNo, limit, searchKey, sortBy, sortOrder } = params;
			const aggPipe = [];

			const match: any = {};
			match.status = { "$ne": config.CONSTANT.STATUS.DELETED };
			if (searchKey) {
				match["$or"] = [
					{ "name": { "$regex": searchKey, "$options": "-i" } },
					{ "title": { "$regex": searchKey, "$options": "-i" } }
				];
			}
			aggPipe.push({ "$match": match });

			let sort = {};
			if (sortBy && sortOrder) {
				if (sortBy === "name") {
					sort = { "name": sortOrder };
				} else if (sortBy === "title") {
					sort = { "title": sortOrder };
				} else {
					sort = { "created": sortOrder };
				}
			} else {
				sort = { "created": -1 };
			}
			aggPipe.push({ "$sort": sort });

			return await this.paginate("versions", aggPipe, limit, pageNo, true);
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function deleteVersion
	 */
	async deleteVersion(params: VersionRequest.Id) {
		try {
			const query: any = {};
			query._id = params.versionId;

			const update = {};
			update["$set"] = {
				"status": config.CONSTANT.STATUS.DELETED
			};

			return await this.updateOne("versions", query, update, {});
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function versionDetails
	 */
	async versionDetails(params: VersionRequest.Id) {
		try {
			const query: any = {};
			query._id = params.versionId;

			return await this.findOne("versions", query, {}, {}, {});
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function editVersion
	 */
	async editVersion(params: VersionRequest.Edit) {
		try {
			const query: any = {};
			query._id = params.versionId;

			const update = {};
			update["$set"] = params;

			return await this.updateOne("versions", query, update, {});
		} catch (error) {
			throw error;
		}
	}
}

export const versionDao = new VersionDao();