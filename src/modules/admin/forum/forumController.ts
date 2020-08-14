"use strict";


import * as _ from "lodash";

import * as config from "@config/index";
import * as forumConstant from "@modules/admin/forum/forumConstant";
import { eventDao } from "@modules/event/eventDao";
import * as appUtils from '@utils/appUtils';

class AdminForumController {

    getTypeAndDisplayName(findObj, num: number) {
        const obj = findObj;
        const data = Object.values(obj);
        const result = data.filter((x: any) => {
            return x.VALUE === num;
        });
        console.log('resultresultresult', result);
        return result[0];
    }
	/**
	 * @function add event
	 * @description user add event
	 */
    async addForum(params: AdminForumRequest.AddForum) {
        try {
            params["created"] = new Date().getTime()

            const data = await eventDao.insert("forum_topic", params, {});
            return forumConstant.MESSAGES.SUCCESS.FORUM_ADDED(data);
        } catch (error) {
            throw error;
        }
    }

    async GetFormPosts(params: AdminForumRequest.GetForum) {
        try {

            const { status, sortBy, sortOrder, limit, page, searchTerm, fromDate, toDate, categoryId } = params;
            const aggPipe = [];
            const match: any = {};
            if (categoryId) {
                match['categoryId'] = await appUtils.toObjectId(categoryId);
            }
            if (status) {
                match["$and"] = [{ status: status }, { status: { "$ne": config.CONSTANT.STATUS.DELETED } }];
            } else {
                match.status = { "$ne": config.CONSTANT.STATUS.DELETED };
            }

            if (searchTerm) {
                match["$or"] = [
                    { "topic": { "$regex": searchTerm, "$options": "-i" } },
                    { "description": { "$regex": searchTerm, "$options": "-i" } },
                ];
            }
            aggPipe.push({ "$match": match });
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


            aggPipe.push({
                '$lookup': {
                    from: 'categories',
                    let: {
                        cId: '$categoryId'
                    },
                    pipeline: [{
                        '$match': {
                            '$expr': {
                                $and: [{
                                    '$eq': ['$_id', '$$cId']
                                },
                                {
                                    '$ne': ['$status', config.CONSTANT.STATUS.DELETED]
                                }
                                ]
                            }
                        },

                    },
                    {
                        $project:
                            { "name": 1, "status": 1, imageUrl: 1, title: 1 }
                    }
                    ],
                    as: 'categoryData'
                }
            })

            aggPipe.push({ '$unwind': { path: '$categoryData' } });

            const data = await eventDao.aggreagtionWithPaginateTotal('forum_topic', aggPipe, limit, page, true);
            return data;

        } catch (error) {
            return Promise.reject(error);
        }
    }

    async updateForumTopic(params: AdminExpertRequest.updateExpert) {
        try {
            const criteria = {
                _id: params.expertId,
            };

            const data = await eventDao.updateOne('expert', criteria, params, {})
            if (!data) {
                // return forumConstant.MESSAGES.SUCCESS.SUCCESS_WITH_NO_DATA;
            }
            // return forumConstant.MESSAGES.SUCCESS.DEFAULT_WITH_DATA(data);
        } catch (error) {
            throw error;
        }
    }

    /**
     * @function updateStatus
     * @description admin update status active ,block ,delete
     */

    async updateStatus(params: AdminExpertRequest.updateStatus) {
        try {
            const criteria = {
                _id: params.expertId
            };
            const datatoUpdate = {
                status: params.status
            };
            const data = await eventDao.updateOne('expert', criteria, datatoUpdate, {})
            return config.CONSTANT.MESSAGES.SUCCESS.SUCCESSFULLY_UPDATED;
        } catch (error) {
            return Promise.reject(error)
        }
    }
}
export const adminForumController = new AdminForumController();