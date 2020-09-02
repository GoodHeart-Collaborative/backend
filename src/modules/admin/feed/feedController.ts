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

            if (searchTerm) {
                match["$or"] = [
                    { "topic": { "$regex": searchTerm, "$options": "-i" } },
                    { "description": { "$regex": searchTerm, "$options": "-i" } },
                ];
            }
            let sort = {};
            if (sortBy && sortOrder) {
                if (sortBy === "title") {
                    sort = { "title": sortOrder };
                } else {
                    sort = { "created": sortOrder };
                }
            } else {
                sort = { "created": -1 };
            }
            aggPipe.push({ "$sort": sort });

            if (fromDate && toDate) { match['createdAt'] = { $gte: fromDate, $lte: toDate }; }
            if (fromDate && !toDate) { match['createdAt'] = { $gte: fromDate }; }
            if (!fromDate && toDate) { match['createdAt'] = { $lte: toDate }; }

            aggPipe.push({ "$match": match });
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
                        }
                    }

                    ],
                    as: 'userData'
                }
            })
            aggPipe.push({ '$unwind': { path: '$userData' } });
            if (type == config.CONSTANT.HOME_TYPE.GENERAL_GRATITUDE) {
                const data = await gratitudeJournalDao.aggreagtionWithPaginateTotal('gratitude_journals', aggPipe, limit, page, true);
                return data;
            }

            if (type == config.CONSTANT.HOME_TYPE.SHOUTOUT) {
                const data = await shoutoutDao.aggreagtionWithPaginateTotal('shoutout', aggPipe, limit, page, true);
                return data;
            }

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