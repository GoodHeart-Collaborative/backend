"use strict";

import * as _ from "lodash";
import fs = require("fs");
import * as promise from "bluebird";

import * as appUtils from "@utils/appUtils";
import * as config from "@config/index";
// import * as sns from "@lib/pushNotification/sns";
import { homeDao } from "@modules/home/HomeDao";


class UnicornController {

	/**
	 * @function signup
	 * @description if IS_REDIS_ENABLE set to true,
	 * than redisClient.storeList() function saves value in redis.
	 */
    async addPost(params: UnicornRequest.IUnicornAdd) {
        try {
            const data = await homeDao.insert("home", params, {});
            return config.CONSTANT.MESSAGES.SUCCESS.SUCCESSFULLY_ADDED;
        } catch (error) {
            throw error;
        }
    }

    async getPostById(params: UnicornRequest.IUnicornById) {
        try {
            const criteria = {
                _id: params.Id,
            };

            const data = await homeDao.findOne('home', criteria, {}, {})
            return data;
        } catch (error) {
            throw error;
        }
    }

    async getPosts(params: UnicornRequest.IGetUnicorn) {
        try {
            const { sortBy, sortOrder, limit, page, searchTerm, status, fromDate, toDate } = params;
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

            if (fromDate && toDate) { match['createdAt'] = { $gte: fromDate, $lte: toDate }; }
            if (fromDate && !toDate) { match['createdAt'] = { $gte: fromDate }; }
            if (!fromDate && toDate) { match['createdAt'] = { $lte: toDate }; }
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


            const data = await homeDao.paginate('home', aggPipe, limit, page, {}, true);
            return data;
        }
        catch (error) {
            return Promise.reject(error);
        }
    }

    async updateStatus(params: UnicornRequest.IUpdateUnicornStatus) {
        try {
            const criteria = {
                _id: params.Id
            }
            const dataToUpdate = {
                ...params
            }
            const data = await homeDao.updateOne('home', criteria, dataToUpdate, {});
            return config.CONSTANT.MESSAGES.SUCCESS.SUCCESSFULLY_UPDATED;


        } catch (error) {
            return Promise.reject(error);
        }
    }

    async updatePost(params: UnicornRequest.IUpdateUnicorn) {
        try {
            const criteria = {
                _id: params.Id
            }
            const dataToUpdate = {
                ...params
            }
            const data = await homeDao.updateOne('home', criteria, dataToUpdate, {});
            return config.CONSTANT.MESSAGES.SUCCESS.SUCCESSFULLY_UPDATED

        } catch (error) {
            return Promise.reject(error);
        }
    }
}


export const unicornController = new UnicornController();