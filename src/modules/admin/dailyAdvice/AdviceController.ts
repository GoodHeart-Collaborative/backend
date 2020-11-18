"use strict";

import * as _ from "lodash";
import fs = require("fs");

import * as config from "@config/index";
import { adviceDao } from "@modules/admin/dailyAdvice/AdviceDao";


class AdviceController {

	/**
	 * @function addAdvice
	 * @description if IS_REDIS_ENABLE set to true,
	 * than redisClient.storeList() function saves value in redis.
	 */
    async addAdvice(params: AdviceRequest.IAdviceAdd) {
        try {
            const data = await adviceDao.insert("advice", params, {});
            return config.CONSTANT.MESSAGES.SUCCESS.SUCCESSFULLY_ADDED;
        } catch (error) {
            throw error;
        }
    }

    async getPostById(params) {
        try {
            const criteria = {
                _id: params.Id,
            };

            const data = await adviceDao.findOne('advice', criteria, {}, {})
            if (!data) {
                // return inspirationConstant.MESSAGES.SUCCESS.SUCCESS_WITH_NO_DATA;
            }
            // return inspirationConstant.MESSAGES.SUCCESS.DEFAULT_WITH_DATA(data);

        } catch (error) {
            throw error;
        }
    }

    async getPosts(params: AdviceRequest.IGetAdvices) {
        try {
            const { status, sortBy, sortOrder, limit, page, searchTerm, fromDate, toDate } = params;
            const aggPipe = [];
            let sort = {};
            const match: any = {};
            // match.adminType = config.CONSTANT.ADMIN_TYPE.SUB_ADMIN;
            if (status) {
                match["$and"] = [{ status: status }, { status: { $ne: config.CONSTANT.STATUS.DELETED } }];
            } else {
                match.status = { "$ne": config.CONSTANT.STATUS.DELETED };
            }
            if (searchTerm) {
                match["$or"] = [
                    { "title": { "$regex": searchTerm, "$options": "-i" } },
                ];
            }

            if (fromDate && toDate) { match['createdAt'] = { $gte: fromDate, $lte: toDate }; }
            if (fromDate && !toDate) { match['createdAt'] = { $gte: fromDate }; }
            if (!fromDate && toDate) { match['createdAt'] = { $lte: toDate }; }

            aggPipe.push({ "$match": match });

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


            const data = await adviceDao.paginate('advice', aggPipe, limit, page, {}, true);
            return data;
        } catch (error) {
            return Promise.reject(error);
        }
    }

    async UpdateStatus(params: AdviceRequest.IUpdateAdviceStatus) {
        try {
            const criteria = {
                _id: params.Id
            };
            const datatoUpdate = {
                ...params
            };
            const data = await adviceDao.updateOne('advice', criteria, datatoUpdate, {})
            return data;

        } catch (error) {
            return Promise.reject(error)
        }
    }

    async updatePost(params: AdviceRequest.IUpdateAdvice) {
        try {
            const criteria = {
                _id: params.Id
            };
            const datatoUpdate = {
                ...params
            };
            const data = await adviceDao.updateOne('advice', criteria, datatoUpdate, {})
            return data;

        } catch (error) {
            throw error;
        }
    }
}
export const adviceController = new AdviceController();