"use strict";

import * as _ from "lodash";

import * as config from "@config/index";
import * as gratitudeConstant from "@modules/admin/gratitudeJournal/gratitudeConstant";
import { gratitudeJournalDao } from "@modules/gratitudeJournal/GratitudeJournalDao";
import * as appUtils from "@utils/appUtils";

class GratitudeController {

	/**
	 * @function addGratitude
	 * @description admin add gratitude 
	 */
    async addGratitude(params: InspirationRequest.InspirationAdd) {
        try {
            // params["postedAt"] = moment(para).format('YYYY-MM-DD')
            const data = await gratitudeJournalDao.insert("inspiration", params, {});
            return gratitudeConstant.MESSAGES.SUCCESS.SUCCESSFULLY_ADDED;

        } catch (error) {
            throw error;
        }
    }

    /**
     * @function getPostById
     * @description admin get gratitude per user 
     */
    async getPostById(params: GratitudeRequest.IgratitudeById) {
        try {
            let aggPipe = [];
            let match: any = {};
            match['_id'] = appUtils.toObjectId(params.Id);

            aggPipe.push({ $match: match })

            aggPipe.push({
                $lookup: {
                    from: 'users',
                    let: { 'uId': '$userId' },
                    as: 'userData',
                    pipeline: [{
                        $match: {
                            $expr: {
                                $and: [{
                                    $eq: ['$_id', '$$uId']
                                },
                                {
                                    $eq: ['$status', config.CONSTANT.STATUS.ACTIVE]
                                }]

                            }
                        }
                    },
                    {
                        $project: {
                            firstName: 1,
                            lastName: 1,
                            profilePicUrl: 1
                        }
                    }]
                }
            });
            aggPipe.push({ '$unwind': { path: '$userData', preserveNullAndEmptyArrays: true } })

            const data = await gratitudeJournalDao.aggregate('gratitude_journals', aggPipe, {})
            if (!data[0]) {
                return gratitudeConstant.MESSAGES.SUCCESS.SUCCESS_WITH_NO_DATA;
            }
            return gratitudeConstant.MESSAGES.SUCCESS.DEFAULT_WITH_DATA(data[0]);

        } catch (error) {
            throw error;
        }
    }

    /**
     * @function getPosts
     * @description admin get gratitude list as in feed 
    */
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

    /**
     * @function updateStatus
     * @description admin update gratitude status  active, block,delete
     */
    async updateStatus(params: GratitudeRequest.IUpdateStatus) {
        try {
            const criteria = {
                _id: params.Id
            };

            const datatoUpdate = {
                status: params.status
            };
            const data = await gratitudeJournalDao.updateOne('gratitude_journals', criteria, datatoUpdate, {})
            if (data && params.status == config.CONSTANT.STATUS.BLOCKED) {
                return gratitudeConstant.MESSAGES.SUCCESS.SUCCESSFULLY_BLOCKED;

            } else if (data && params.status == config.CONSTANT.STATUS.DELETED) {
                return gratitudeConstant.MESSAGES.SUCCESS.SUCCESSFULLY_DELETED;
            }
            return gratitudeConstant.MESSAGES.SUCCESS.SUCCESSFULLY_ACTIVE;

        } catch (error) {
            return Promise.reject(error)
        }
    }


    /**
     * @function updateStatus
     * @description admin update gratitude
     */
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
                return gratitudeConstant.MESSAGES.SUCCESS.SUCCESSFULLY_UPDATED;
            }
        } catch (error) {
            throw error;
        }
    }
}
export const gratitudeController = new GratitudeController();