"use strict";

import * as promise from "bluebird";

import { BaseDao } from "@modules/base/BaseDao";
import * as config from "@config/index";

export class ContentDao extends BaseDao {

	/**
	 * @function isContentExists
	 */
	async isContentExists(params) {
		try {
			const query: any = {};
			query.type = params.type;
			query.status = { "$ne": config.CONSTANT.STATUS.DELETED };

			const options = { lean: true };

			return await this.findOne("contents", query, { title: 0 }, options, {});
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function addContent
	 */
	async addContent(params: ContentRequest.Add) {
		try {
			params["created"] = new Date().getTime()
			return await this.save("contents", params);
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function contentList
	 */
	async contentList(params: ListingRequest) {
		try {
			const { pageNo, limit, searchKey, sortBy, sortOrder } = params;
			const aggPipe = [];

			const match: any = {};
			match.status = { "$ne": config.CONSTANT.STATUS.DELETED };
			if (searchKey) {
				const reg = new RegExp(searchKey, 'ig');
				match.title = reg
				match.question = reg
				match.answer = reg
			}
			aggPipe.push({ "$match": match });

			aggPipe.push({ "$project": { link: { "$concat": [config.SERVER.APP_URL + config.SERVER.API_BASE_URL + "/content/view?type=", "$type"] }, title: 1, description: 1, status: 1, type: 1, created: 1 } });

			let sort = {};
			if (sortBy && sortOrder) {
				if (sortBy === "title") {
					sort = { "title": sortOrder };
				} else {
					sort = { "created": sortOrder };
				}
			} else {
				sort = { "created": -1 };
			}
			aggPipe.push({ "$sort": sort });

			return await this.paginate("contents", aggPipe, limit, pageNo, true);
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function deleteContent
	 */
	async deleteContent(params: ContentRequest.Id) {
		try {
			const query: any = {};
			query._id = params.contentId;

			const update = {};
			update["$set"] = {
				"status": config.CONSTANT.STATUS.DELETED
			};

			return await this.updateOne("contents", query, update, {});
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function contentDetails
	 */
	async contentDetails(params: ContentRequest.Id) {
		try {
			const query: any = {};
			query._id = params.contentId;
			return await this.findOne("contents", query, {}, {}, {});
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function editContent
	 */
	async editContent(params: ContentRequest.Edit) {
		try {
			const query: any = {};
			// query._id = params.contentId;
			query.type = params.type;


			const update = {};
			update["$set"] = {
				// "title": params.title,
				"description": params.description
			};

			return await this.updateOne("contents", query, update, {});
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function addFaq
	 */
	async addFaq(params: ContentRequest.AddFaq) {
		try {
			params.type = config.CONSTANT.CONTENT_TYPE.FAQ;
			params["created"] = new Date().getTime()
			return await this.save("contents", params);
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function faqList
	 */
	async faqList(params?) {
		try {
			console.log('paramsparams', params);

			const query: any = {};
			query.type = config.CONSTANT.CONTENT_TYPE.FAQ;
			query.status = { "$ne": config.CONSTANT.STATUS.DELETED };

			const projection: any = { question: 1, answer: 1, createdAt: 1 };

			const options: any = { lean: true };
			if (params && params.searchKey) {
				// const reg = new RegExp(searchKey, 'ig');
				query['$or'] = [
					{ question: { $regex: params.searchKey, $options: 'i' } },
					{ answer: { $regex: params.searchKey, $options: 'i' } }
					// query.question  { $regex: searchKey },
					// query.answer = { $regex: searchKey }
				]
			};
			if (params && (params.fromDate || params.toDate)) {
				if (params.fromDate && params.toDate) { query['createdAt'] = { $gte: params.fromDate, $lte: params.toDate }; }
				if (params.fromDate && !params.toDate) { query['createdAt'] = { $gte: params.fromDate }; }
				if (!params.fromDate && params.toDate) { query['createdAt'] = { $lte: params.toDate }; }
			}

			const step1 = this.find("contents", query, projection, options, {}, {}, {});
			const step2 = this.countDocuments("contents", query);
			const step3 = await promise.join(step1, step2);

			return { "data": step3[0], "total": step3[1] };
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function editFaq
	 */
	async editFaq(params: ContentRequest.EditFaq) {
		try {
			const query: any = {};
			query._id = params.faqId;

			const update = {};
			update["$set"] = {
				"answer": params.answer,
				"question": params.question
			};

			return await this.updateOne("contents", query, update, {});
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function deleteFaq
	 */
	async deleteFaq(params: ContentRequest.FaqId) {
		try {
			const query: any = {};
			query._id = params.faqId;

			const update = {};
			update["$set"] = {
				"status": config.CONSTANT.STATUS.DELETED
			};

			return await this.updateOne("contents", query, update, {});
		} catch (error) {
			throw error;
		}
	}
}

export const contentDao = new ContentDao();