"use strict";

import * as _ from "lodash";
import fs = require("fs");
import * as promise from "bluebird";

import * as appUtils from "@utils/appUtils";
import * as config from "@config/index";
// import * as sns from "@lib/pushNotification/sns";
import * as UnicornConstant from "@modules/admin/unicornHumour/UnicornConstant";
import { homeDao } from "@modules/home/HomeDao";

class AdminHomeController {
    /**
     * @function signup
     * @description if IS_REDIS_ENABLE set to true,
     * than redisClient.storeList() function saves value in redis. 
     */

    async addPost(params: UnicornRequest.IUnicornAdd) {
        try {
            console.log('paramsparamsparamsparams', params);
            // const dataToInsert =

            const data = await homeDao.insert("home", params, {});
            console.log('dataaaaaaaaaaaaa', data);
            return config.CONSTANT.MESSAGES.SUCCESS.SUCCESSFULLY_ADDED;

        } catch (error) {
            throw error;
        }
    }

    async getPostById(params: HomeRequest.IHomeById) {
        try {
            const criteria = {
                _id: params.Id,
            };

            const data = await homeDao.findOne('home', criteria, {}, {})
            console.log('datadatadatadata', data);
            return data;
        } catch (error) {
            throw error;
        }
    }

    async getPosts(params: HomeRequest.IgetHome) {
        try {
            console.log('paramsparamsparamsparams', params);
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


            const data = await homeDao.paginate('home', aggPipe, limit, page, {}, true);
            console.log('datadatadata', data);
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
            console.log('dataToUpdatedataToUpdate', data);
            return config.CONSTANT.MESSAGES.SUCCESS.SUCCESSFULLY_UPDATED;


        } catch (error) {
            return Promise.reject(error);
        }
    }

    async updatePost(params: HomeRequest.updateHome) {
        try {
            const criteria = {
                _id: params.Id
            }
            const dataToUpdate = {
                ...params
            }
            const data = await homeDao.updateOne('home', criteria, dataToUpdate, {});
            console.log('dataToUpdatedataToUpdate', data);
            return config.CONSTANT.MESSAGES.SUCCESS.SUCCESSFULLY_UPDATED

        } catch (error) {
            return Promise.reject(error);
        }
    }
}



export const adminHomeController = new AdminHomeController();