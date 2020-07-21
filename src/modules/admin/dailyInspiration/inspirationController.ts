"use strict";

import * as _ from "lodash";
import * as moment from 'moment';

import * as config from "@config/index";
import * as inspirationConstant from "@modules/admin/dailyInspiration/inspirationConstant";
import { inspirationDao } from "@modules/admin/dailyInspiration/inspirationDao";


class InspirationController {

	/**
	 * @function signup
	 * @description if IS_REDIS_ENABLE set to true,
	 * than redisClient.storeList() function saves value in redis.
	 */
    async addInspiration(params: InspirationRequest.InspirationAdd) {
        try {
            console.log('paramsparamsparamsparams', params);
            // const dataToInsert =

            // params["postedAt"] = moment(para).format('YYYY-MM-DD')

            const data = await inspirationDao.insert("inspiration", params, {});
            console.log('dataaaaaaaaaaaaa', data);
            return inspirationConstant.MESSAGES.SUCCESS.SUCCESSFULLY_ADDED;

        } catch (error) {
            throw error;
        }
    }

    async getPostById(params: InspirationRequest.IGetInspirationById) {
        try {
            const criteria = {
                _id: params.Id,
            };

            const data = await inspirationDao.findOne('inspiration', criteria, {}, {})
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

    async getPosts(params: InspirationRequest.IGetInspirations) {
        try {
            console.log('paramsparamsparamsparams', params);
            const { status, sortBy, sortOrder, limit, page, searchTerm, fromDate, toDate, } = params;
            const aggPipe = [];

            const match: any = {};

            // const paginateOptions = {
            //     page: page || 1,
            //     limit: limit || Constant.SERVER.LIMIT,
            // };

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
                if (sortBy === "title") {
                    sort = { "title": sortOrder };
                } else {
                    sort = { "createdAt": sortOrder };
                }
            } else {
                sort = { "createdAt": -1 };
            }
            aggPipe.push({ "$sort": sort });


            console.log('aggPipeaggPipeaggPipeaggPipe', aggPipe);

            const data = await inspirationDao.paginate('inspiration', aggPipe, limit, page, {}, true);
            console.log('datadatadata', data);
            return data;
        } catch (error) {
            return Promise.reject(error);
        }
    }

    async updateStatus(params: InspirationRequest.IUpdateStatus) {
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
            return Promise.reject(error)
        }
    }

    async updatePost(params: InspirationRequest.IUpdateInpiration) {
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
export const inspirationController = new InspirationController();