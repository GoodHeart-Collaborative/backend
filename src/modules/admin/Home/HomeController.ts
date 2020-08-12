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
            if (params.postedAt) {
                params.postedAt = new Date(params.postedAt)//moment(new Date(params.postedAt)).format('YYYY-MM-DD')
            } else {
                params.postedAt = new Date()//moment(new Date()).format('YYYY-MM-DD')
            }
            // if (!params.postedAt) {
            //     params.postedAt = new Date();
            // }
            // console.log('paramsparams', params);

            const data = await homeDao.insert("home", params, {});
            if (data && params.type == config.CONSTANT.HOME_TYPE.UNICORN) {
                return HOME_CONSTANT.MESSAGES.SUCCESS.DAILY_SMILES
            } else if (data && params.type == config.CONSTANT.HOME_TYPE.INSPIRATION) {
                return HOME_CONSTANT.MESSAGES.SUCCESS.UNICORN_ADDED
            } else {
                return HOME_CONSTANT.MESSAGES.SUCCESS.DAILY_PEP_TALK
            }
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

            const data = await homeDao.findOneAndUpdate('home', criteria, dataToUpdate, { new: true, lean: true });
            console.log('datadatadatadatadata>>>>>>>>', data);
            if (data.type == config.CONSTANT.HOME_TYPE.UNICORN) {
                data.type = config.CONSTANT.HOME_TYPES.UNICORN
            }
            if (data.type == config.CONSTANT.HOME_TYPE.INSPIRATION) {
                data.type = config.CONSTANT.HOME_TYPES.INSPIRATION
            }
            if (data.type == config.CONSTANT.HOME_TYPE.DAILY_ADVICE) {
                data.type = config.CONSTANT.HOME_TYPES.DAILY_ADVICE
            }
            console.log('data.type =data.type =', data.type);

            if (data && params.status == config.CONSTANT.STATUS.BLOCKED) {
                return HOME_CONSTANT.MESSAGES.SUCCESS.BLOCKED(data.type);

            } else if (data && params.status == config.CONSTANT.STATUS.DELETED) {
                return HOME_CONSTANT.MESSAGES.SUCCESS.DELETED(data.type);
            }
            return HOME_CONSTANT.MESSAGES.SUCCESS.ACTIVE(data.type);
        } catch (error) {
            return Promise.reject(error);
        }
    }

    async updatePost(params: HomeRequest.updateHome) {
        try {
            const criteria = {
                _id: params.Id
            }
            if (params.postedAt) {
                params.postedAt = new Date(params.postedAt)//moment(new Date(params.postedAt)).format('YYYY-MM-DD')
            } else {
                params.postedAt = new Date()//moment(new Date()).format('YYYY-MM-DD')
            }
            const dataToUpdate = {
                ...params
            }
            const data = await homeDao.findOneAndUpdate('home', criteria, dataToUpdate, { new: true, lean: true });
            console.log('updateOneupdateOne', data);
            if (data.type == config.CONSTANT.HOME_TYPE.UNICORN) {
                data.type = config.CONSTANT.HOME_TYPES.UNICORN
            }
            if (data.type == config.CONSTANT.HOME_TYPE.INSPIRATION) {
                data.type = config.CONSTANT.HOME_TYPES.INSPIRATION
            }
            if (data.type == config.CONSTANT.HOME_TYPE.DAILY_ADVICE) {
                data.type = config.CONSTANT.HOME_TYPES.DAILY_ADVICE
            }
            console.log('data.type =data.type =', data.type);
            return HOME_CONSTANT.MESSAGES.SUCCESS.UPDATED_SUCCESSFULLY(data.type)

        } catch (error) {
            return Promise.reject(error);
        }
    }
}



export const adminHomeController = new AdminHomeController();