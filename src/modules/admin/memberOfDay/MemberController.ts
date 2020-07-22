"use strict";

import * as _ from "lodash";
import fs = require("fs");
import * as promise from "bluebird";

import * as config from "@config/index";
import * as inspirationConstant from "@modules/admin/dailyInspiration/inspirationConstant";
import { inspirationDao } from "@modules/admin/dailyInspiration/inspirationDao";
import { userDao } from "@modules/user";


class MemberController {

	/**
	 * @function signup
	 * @description if IS_REDIS_ENABLE set to true,
	 * than redisClient.storeList() function saves value in redis.
	 */
    async saveMembers(params) {
        try {
            console.log('paramsparamsparamsparams', params);
            // const dataToInsert =
            // const data = await inspirationDao.insert("users", params, {});
            // console.log('dataaaaaaaaaaaaa', data);
            if (!params['memberCreatedAt']) {
                params['memberCreatedAt'] = new Date();
            }
            const criteria = {
                _id: params.userId
            }
            const data = await userDao.updateOne('users', criteria, params, {})
            return data;
            // return inspirationConstant.MESSAGES.SUCCESS.SUCCESSFULLY_ADDED;

        } catch (error) {
            throw error;
        }
    }

    async getMemberstById(params) {
        try {
            const criteria = {
                _id: params.Id,
            };

            const data = await inspirationDao.findOne('users', criteria, {}, {})
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

    async getMembers(params) {
        try {
            console.log('paramsparamsparamsparams', params);
            const { status, sortBy, sortOrder, limit, page, searchTerm, fromDate, toDate } = params;
            console.log('statusstatusstatusstatus', status);

            const aggPipe = [];

            const match: any = {};
            match.memberCreatedAt = { $exists: true };
            // match.adminType = config.CONSTANT.ADMIN_TYPE.SUB_ADMIN;
            if (status) {
                match["$and"] = [{ status: status }, { status: { $ne: config.CONSTANT.STATUS.DELETED } }];
            } else {
                match.status = { "$ne": config.CONSTANT.STATUS.DELETED };
            }
            if (searchTerm) {
                match["$or"] = [
                    { "firstName": { "$regex": searchTerm, "$options": "-i" } },
                    { "lastName": { "$regex": searchTerm, "$options": "-i" } },
                    { "email": { "$regex": searchTerm, "$options": "-i" } },

                ];
            }
            console.log('aggPipeaggPipeaggPipeaggPipe111111111', aggPipe);


            console.log('aggPipeaggPipeaggPipeaggPipe3333333333333333', aggPipe);

            // const project = { _id: 1, name: 1, email: 1, created: 1, status: 1 };
            // aggPipe.push({ "$project": project });

            if (fromDate && toDate) { match['createdAt'] = { $gte: fromDate, $lte: toDate }; }
            if (fromDate && !toDate) { match['createdAt'] = { $gte: fromDate }; }
            if (!fromDate && toDate) { match['createdAt'] = { $lte: toDate }; }
            console.log('matchmatchmatchmatch', match);

            aggPipe.push({ "$match": match });

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

            const data = await inspirationDao.paginate('users', aggPipe, limit, page, {}, true);
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
            const data = await inspirationDao.updateOne('inspiration', criteria, datatoUpdate, {})
            console.log('datadatadatadatadata', data);
            return config.CONSTANT.MESSAGES.SUCCESS.SUCCESSFULLY_UPDATED;

        } catch (error) {
            throw error;
        }
    }
}
export const memberController = new MemberController();