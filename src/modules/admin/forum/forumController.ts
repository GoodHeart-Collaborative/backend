"use strict";


import * as _ from "lodash";

import * as config from "@config/index";
import * as forumConstant from "@modules/admin/forum/forumConstant";
import { eventDao } from "@modules/event/eventDao";
import * as appUtils from '@utils/appUtils';
import { AdminForumDao } from "@modules/admin/forum/forumDao";

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

            const data = await eventDao.insert("forum", params, {});
            return forumConstant.MESSAGES.SUCCESS.FORUM_ADDED(data);
        } catch (error) {
            throw error;
        }
    }

    async GetFormPosts(params: AdminForumRequest.GetForum) {
        try {
            const data = await AdminForumDao.getforumList(params)
            return data;
        } catch (error) {
            return Promise.reject(error);
        }
    }

    async updateForumTopic(params: AdminForumRequest.UpdateForum) {
        try {
            const criteria = {
                _id: params.postId,
            };
            const dataToUpdate = {
                ...params
            }
            const data = await eventDao.findOneAndUpdate('forum', criteria, dataToUpdate, { new: true })
            if (!data) {
                return forumConstant.MESSAGES.ERROR.INVALID_ID;
            }
            return forumConstant.MESSAGES.SUCCESS.FORUM_UPDATED(data);
        } catch (error) {
            throw error;
        }
    }

    /**
     * @function updateStatus
     * @description admin update status active ,block ,delete
     */

    async updateStatus(params: AdminForumRequest.UpdateForumStatus) {
        try {
            const criteria = {
                _id: params.postId
            };
            const datatoUpdate = {
                status: params.status
            };
            const data = await eventDao.findOneAndUpdate('forum', criteria, datatoUpdate, { new: true })
            return forumConstant.MESSAGES.SUCCESS.FORUM_STATUS_UPDATED(data.status);

        } catch (error) {
            return Promise.reject(error)
        }
    }

    async getForum(params) {
        try {
            let aggPipe = [];
            let match: any = {}

            match['_id'] = appUtils.toObjectId(params.postId)

            aggPipe.push({
                $match: match
            })
            if (params.userType == config.CONSTANT.ACCOUNT_LEVEL.ADMIN) {
                aggPipe.push({
                    $lookup: {
                        from: 'admin',
                        let: { aId: '$createrId' },
                        pipeline: [{
                            $match: {
                                $expr: {
                                    $eq: ['$_id', '$$aId']
                                }
                            }
                        }],
                        as: 'adminData'
                    }
                })
                aggPipe.push({ '$unwind': { path: '$adminData' } });
            }
            if (params.userType == config.CONSTANT.ACCOUNT_LEVEL.USER) {
                aggPipe.push({
                    $lookup: {
                        from: 'users',
                        let: { uId: '$createrId' },
                        pipeline: [{
                            $match: {
                                $expr: {
                                    $and: [
                                        {
                                            $eq: ['$_id', '$$uId']
                                        },
                                        // {
                                        //     $eq: ['$userType', config.CONSTANT.ACCOUNT_LEVEL.USER]
                                        // }
                                    ]
                                }
                            }
                        },
                        {
                            $project: {
                                firstName: 1,
                                lastName: 1,
                                profilePicUrl: 1,
                                status: 1
                            }
                        }],
                        as: 'userData'
                    }
                })
                aggPipe.push({ '$unwind': { path: '$userData' } });

            }

            const data = await eventDao.aggregate('forum', aggPipe, {})
            console.log('datadatadatadata', data);

            return data[0] ? data[0] : {};
        } catch (error) {
            return Promise.reject(error)
        }
    }
}
export const adminForumController = new AdminForumController();