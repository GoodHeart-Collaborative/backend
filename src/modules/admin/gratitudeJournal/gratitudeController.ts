"use strict";

import * as _ from "lodash";

import * as config from "@config/index";
import * as inspirationConstant from "@modules/admin/dailyInspiration/inspirationConstant";
import { gratitudeJournalDao } from "@modules/gratitudeJournal/GratitudeJournalDao";
import * as appUtils from "@utils/appUtils";

class GratitudeController {

	/**
	 * @function signup
	 * @description if IS_REDIS_ENABLE set to true,
	 * than redisClient.storeList() function saves value in redis.
	 */
    async addGratitude(params: InspirationRequest.InspirationAdd) {
        try {
            // params["postedAt"] = moment(para).format('YYYY-MM-DD')

            const data = await gratitudeJournalDao.insert("inspiration", params, {});
            return inspirationConstant.MESSAGES.SUCCESS.SUCCESSFULLY_ADDED;

        } catch (error) {
            throw error;
        }
    }

    async getPostById(params: GratitudeRequest.IgratitudeById) {
        try {
            const criteria = {
                _id: params.Id,
            };

            const data = await gratitudeJournalDao.findOne('gratitude_journals', criteria, {}, {})
            if (!data) {
                return inspirationConstant.MESSAGES.SUCCESS.SUCCESS_WITH_NO_DATA;
            }
            return inspirationConstant.MESSAGES.SUCCESS.DEFAULT_WITH_DATA(data);

            // return data;
        } catch (error) {
            throw error;
        }
    }

    async getPosts(params: GratitudeRequest.IGetGratitude) {
        try {
            const { status, sortBy, sortOrder, limit, page, searchTerm, fromDate, toDate, } = params;
            const aggPipe = [];

            const match: any = {};

            match['userId'] = appUtils.toObjectId(params.userId)
            if (status) {
                match["$and"] = [{ status: status }, { status: { $ne: config.CONSTANT.STATUS.DELETED } }];
            } else {
                match.status = { "$ne": config.CONSTANT.STATUS.DELETED };
            }
            if (searchTerm) {
                match["$or"] = [
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
                sort = { "createdAt": -1 };
            }
            aggPipe.push({ "$sort": sort });

            const data = await gratitudeJournalDao.paginate('gratitude_journals', aggPipe, limit, page, {}, true);
            return data;
        } catch (error) {
            return Promise.reject(error);
        }
    }

    async updateStatus(params: GratitudeRequest.IUpdateStatus) {
        try {
            const criteria = {
                _id: params.Id
            };

            const datatoUpdate = {
                status: params.status
            };
            const data = await gratitudeJournalDao.updateOne('gratitude_journals', criteria, datatoUpdate, {})
            return config.CONSTANT.MESSAGES.SUCCESS.SUCCESSFULLY_UPDATED;

        } catch (error) {
            return Promise.reject(error)
        }
    }

    async updatePost(params: GratitudeRequest.updateGratitude) {
        try {
            const criteria = {
                _id: params.Id
            };
            const datatoUpdate = {
                ...params
            };
            const data = await gratitudeJournalDao.updateOne('gratitude_journals', criteria, datatoUpdate, {})
            if (data) {
                return config.CONSTANT.MESSAGES.SUCCESS.SUCCESSFULLY_UPDATED;
            }
        } catch (error) {
            throw error;
        }
    }
}
export const gratitudeController = new GratitudeController();