"use strict";

import * as _ from "lodash";
import fs = require("fs");
import * as config from "@config/index";
import * as HOME_CONSTANT from './HomeConstant';
// import * as sns from "@lib/pushNotification/sns";
import { homeDao } from "@modules/admin/Home/adminHomeDao";
import { CONSTANT } from "@config/index";
import * as moment from 'moment';


class AdminHomeController {
    /**
     * @function signup
     * @description if IS_REDIS_ENABLE set to true,
     * than redisClient.storeList() function saves value in redis. 
     */

    async addPost(params: HomeRequest.HomeRequestAdd) {
        try {
            // if (params.type == 2 && params.thumbnailUrl) {
            //     return Promise.reject(HOME_CONSTANT.MESSAGES.ERROR.THUMBAIL_URL)
            // }
            if(params.postedAt) {
                params.postedAt =  moment(new Date(params.postedAt)).format('YYYY-MM-DD')
            }
            const data = await homeDao.insert("home", params, {});
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
            return data;
        } catch (error) {
            throw error;
        }
    }

    async getPosts(params: HomeRequest.IgetHome) {
        try {
            const { sortBy, sortOrder, limit, page, status, fromDate, toDate } = params;
            let { searchTerm } = params
            const aggPipe = [];

            const match: any = {};
            match['type'] = params.type

            // match.adminType = config.CONSTANT.ADMIN_TYPE.SUB_ADMIN;
            if (status) {
                match["$and"] = [{ status: status }, { status: { $ne: config.CONSTANT.STATUS.DELETED } }];
            } else {
                match.status = { "$ne": config.CONSTANT.STATUS.DELETED };
            }
            if (searchTerm) {
                searchTerm = searchTerm.replace(/[&\/\\#,+()$~%'":*?<>{}]/g, '')
                match["$or"] = [
                    { "title": { "$regex": searchTerm, "$options": "-i" } },
                    { "description": { "$regex": searchTerm, "$options": "-i" } },
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
                sort = { "created": -1 };
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

    async updatePost(params: HomeRequest.updateHome) {
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



export const adminHomeController = new AdminHomeController();