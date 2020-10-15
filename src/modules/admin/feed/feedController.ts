"use strict";


import * as _ from "lodash";

import * as config from "@config/index";
import * as feedConstant from "@modules/admin/feed/feedConstant";
import { gratitudeJournalDao } from "@modules/gratitudeJournal/GratitudeJournalDao";
import { shoutoutDao } from '@modules/shoutout/ShoutoutDao';
import * as appUtils from '@utils/appUtils';

class AdminFeedController {

	/**
	 * @function Get listing of shoutout and general gratitude
	 * @description user add event
	 */

    async GetFeed(params: AdminFeedRequest.IGetFeed) {
        try {
            const { status, sortBy, sortOrder, limit, page, searchTerm, fromDate, toDate, type, privacy } = params;
            const aggPipe = [];
            const match: any = {};

            if (status) {
                match["$and"] = [{ status: status }, { status: { "$ne": config.CONSTANT.STATUS.DELETED } }];
            } else {
                match.status = { "$ne": config.CONSTANT.STATUS.DELETED };
            }
            if (privacy) {
                match.privacy = params.privacy;
            }

            const paginateOptions = {
                limit: limit || 10,
                page: page || 1
            }

            let sort = {};
            if (sortBy && sortOrder) {
                if (sortBy === "title") {
                    sort = { "title": sortOrder };
                } else {
                    sort = { "created": sortOrder };
                }
            } else {
                sort = { "_id": -1 };
            }

            if (fromDate && toDate) { match['createdAt'] = { $gte: fromDate, $lte: toDate }; }
            if (fromDate && !toDate) { match['createdAt'] = { $gte: fromDate }; }
            if (!fromDate && toDate) { match['createdAt'] = { $lte: toDate }; }

            aggPipe.push({ "$match": match });
            aggPipe.push({ "$sort": sort });
            aggPipe.push({
                $lookup: {
                    from: 'users',
                    let: { uId: '$userId' },
                    pipeline: [{
                        $match: {
                            $expr: {
                                $and: [
                                    {
                                        $eq: ['$_id', '$$uId']
                                    },
                                    {
                                        $eq: ['$status', config.CONSTANT.STATUS.ACTIVE]
                                    }
                                ]
                            }
                        }
                    },
                    {
                        $project: {
                            firstName: 1,
                            lastName: 1,
                            email: 1,
                            status: 1,
                            fullName: {
                                $cond: {
                                    if: {
                                        $eq: ['$lastName', null]
                                    },
                                    then: '$firstName',
                                    else: { $concat: ['$firstName', ' ', '$lastName'] }
                                }
                            }
                        }
                    }
                    ],
                    as: 'userData'
                }
            })

            if (searchTerm) {
                const reg = new RegExp(searchTerm, 'ig');
                aggPipe.push({
                    $match: {
                        ["$or"]: [
                            { 'userData.fullName': reg },
                            { topic: reg },
                            { description: reg }
                        ]
                    }
                });
            }

            let data;
            aggPipe.push({ '$unwind': { path: '$userData' } });
            if (type == config.CONSTANT.HOME_TYPE.GENERAL_GRATITUDE) {
                data = await gratitudeJournalDao.paginate('gratitude_journals', aggPipe, paginateOptions.limit, paginateOptions.page, true);
            }

            if (type == config.CONSTANT.HOME_TYPE.SHOUTOUT) {
                data = await shoutoutDao.paginate('shoutout', aggPipe, paginateOptions.limit, paginateOptions.page, true);
            }
            return data;

        } catch (error) {
            return Promise.reject(error);
        }
    }

    /**
     * @function updateStatus
     * @description admin update status active ,block ,delete
     */

    async updateStatus(params: AdminFeedRequest.adminUpdateFeedStatus) {
        try {
            const { type, postId, status } = params
            const criteria = {
                _id: postId
            };

            const datatoUpdate = {
                status: status
            };
            if (type == config.CONSTANT.HOME_TYPE.GENERAL_GRATITUDE) {
                const data = await gratitudeJournalDao.findOneAndUpdate('gratitude_journals', criteria, datatoUpdate, { new: true })
                return feedConstant.MESSAGES.SUCCESS.FORUM_STATUS_UPDATED(data.status);

            }
            if (type == config.CONSTANT.HOME_TYPE.SHOUTOUT) {
                const data = await shoutoutDao.findOneAndUpdate('shoutout', criteria, datatoUpdate, { new: true })
                return feedConstant.MESSAGES.SUCCESS.FORUM_STATUS_UPDATED(data.status);

            }
            return;
        } catch (error) {
            return Promise.reject(error)
        }
    }
}
export const adminFeedController = new AdminFeedController();