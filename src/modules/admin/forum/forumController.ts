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

            const data = await eventDao.insert("forum", params, {});
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
                                    // {
                                    //     $eq: ['$userType', config.CONSTANT.ACCOUNT_LEVEL.USER]
                                    // }
                                ]
                            }
                        }
                    }],
                    as: 'userData'
                }
            })
            aggPipe.push({ '$unwind': { path: '$userData', preserveNullAndEmptyArrays: true } });

            aggPipe.push({
                $lookup: {
                    from: 'admin',
                    let: { aId: '$userId' },
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
            aggPipe.push({ '$unwind': { path: '$adminData', preserveNullAndEmptyArrays: true } });


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

            aggPipe.push({
                $project: {
                    "_id": 1,
                    "status": 1,
                    "categoryId": 1,
                    "categoryName": 1,
                    "userId": 1,
                    "userType": 1,
                    "topic": 1,
                    "mediaUrl": 1,
                    "description": 1,
                    "postAnonymous": 1,
                    "created": 1,
                    "createdAt": 1,
                    "updatedAt": 1,
                    categoryData: '$categoryData',
                    'userData.firstName': {
                        $cond: {
                            if: '$userData.firstName',
                            then: '$userData.firstName',
                            else: '$adminData.name'
                        }
                    },
                    'userData.lastName': {
                        $cond: {
                            if: '$userData.lastName',
                            // {
                            //     $ne: [{
                            //         $size: '$userData'
                            //     }, 0
                            //     ]
                            // },
                            then: '$userData.lastName',
                            else: ''

                        }
                    },
                    'userData.profilePic': {
                        $cond: {
                            if: '$userData.profilePicUrl',
                            //     $ne: [{
                            //         $size: '$userData'
                            //     }, 0
                            //     ]
                            // },
                            then: '$userData.profilePicUrl',
                            else: ['$adminData.profilePicture']

                        }
                    }
                }
            })
            const data = await eventDao.aggreagtionWithPaginateTotal('forum', aggPipe, limit, page, true);
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
                // return forumConstant.MESSAGES.SUCCESS.SUCCESS_WITH_NO_DATA;
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
                        let: { aId: '$userId' },
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
                        let: { uId: '$userId' },
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
            return data[0];
        } catch (error) {
            return Promise.reject(error)
        }
    }
}
export const adminForumController = new AdminForumController();