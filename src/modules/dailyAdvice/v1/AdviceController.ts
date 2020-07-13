"use strict";

import * as _ from "lodash";
import fs = require("fs");

import * as config from "@config/index";
import * as inspirationConstant from "@modules/dailyAdvice/AdviceConstant";
import { adviceDao } from "@modules/dailyAdvice/v1/AdviceDao";


class AdviceController {

	/**
	 * @function signup
	 * @description if IS_REDIS_ENABLE set to true,
	 * than redisClient.storeList() function saves value in redis.
	 */
    async addAdvice(params) {
        try {
            console.log('paramsparamsparamsparams', params);
            // const dataToInsert =
            const data = await adviceDao.insert("advice", params, {});
            console.log('dataaaaaaaaaaaaa', data);
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
                return inspirationConstant.MESSAGES.SUCCESS.SUCCESS_WITH_NO_DATA;
            }
            console.log('datadatadatadata', data);
            return inspirationConstant.MESSAGES.SUCCESS.DEFAULT_WITH_DATA(data);

            // return data;
        } catch (error) {
            throw error;
        }
    }

    async getPosts(params) {
        try {
            console.log('paramsparamsparamsparams', params);
            const { status, sortBy, sortOrder, limit, page, searchTerm, fromDate, toDate } = params;
            console.log('statusstatusstatusstatus', status);

            const aggPipe = [];

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
            console.log('aggPipeaggPipeaggPipeaggPipe111111111', aggPipe);

            if (fromDate && toDate) { match['createdAt'] = { $gte: fromDate, $lte: toDate }; }
            if (fromDate && !toDate) { match['createdAt'] = { $gte: fromDate }; }
            if (!fromDate && toDate) { match['createdAt'] = { $lte: toDate }; }

            aggPipe.push({ "$match": match });

            console.log('aggPipeaggPipeaggPipeaggPipe3333333333333333', aggPipe);

            // const project = { _id: 1, name: 1, email: 1, created: 1, status: 1 };
            // aggPipe.push({ "$project": project });

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

            console.log('aggPipeaggPipeaggPipeaggPipe', aggPipe);

            const data = await adviceDao.paginate('advice', aggPipe, limit, page, {}, true);
            console.log('datadatadata', data);
            return data;
        } catch (error) {
            return Promise.reject(error);
        }
    }

    async updatePost(params) {
        try {
            const criteria = {
                _id: params.Id
            };
            const datatoUpdate = {
                ...params
            };
            const data = await adviceDao.updateOne('advice', criteria, datatoUpdate, {})
            console.log('datadatadatadatadata', data);
            return data;

        } catch (error) {
            throw error;
        }
    }
}
export const adviceController = new AdviceController();