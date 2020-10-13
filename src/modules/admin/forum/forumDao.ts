"use strict";

import { BaseDao } from "@modules/base/BaseDao";
import * as config from "@config/index";
import * as appUtils from '@utils/appUtils'

export class ForumTopic extends BaseDao {

    async getforumList(params, tokenData) {
        try {
            const { status, sortBy, sortOrder, limit, page, searchTerm, fromDate, toDate, categoryId, userId } = params;
            let aggPipe = [];
            const match: any = {};
            if (userId) {
                match['createrId'] = await appUtils.toObjectId(userId);
            }

            // params["userId"] = tokenData.userId

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
                    }],
                    as: 'userData'
                }
            })
            aggPipe.push({ '$unwind': { path: '$userData', preserveNullAndEmptyArrays: true } });

            // aggPipe.push({
            //     $lookup: {
            //         from: 'admin',
            //         let: { aId: '$createrId' },
            //         pipeline: [{
            //             $match: {
            //                 $expr: {
            //                     $eq: ['$_id', '$$aId']
            //                 }
            //             }
            //         }],
            //         as: 'adminData'
            //     }
            // })
            // aggPipe.push({ '$unwind': { path: '$adminData', preserveNullAndEmptyArrays: true } });


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
                    likeCount: 1,
                    commentCount: 1,
                    "createdAt": 1,
                    reportCount: 1,
                    "updatedAt": 1,
                    categoryData: '$categoryData',
                    'userData.firstName': {
                        $cond: {
                            if: '$userData.firstName',
                            then: '$userData.firstName',
                            else: 'Good Heart'
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
            });

            aggPipe = [...aggPipe, ...await this.addSkipLimit(limit, page)];
            let data = await this.aggregateWithPagination("forum", aggPipe, limit, page, true)

            // const data = await eventDao.aggreagtionWithPaginateTotal('forum', aggPipe, limit, page, true);
            return data;

        } catch (error) {
            return Promise.reject(error)
        }
    }
}
export const AdminForumDao = new ForumTopic();