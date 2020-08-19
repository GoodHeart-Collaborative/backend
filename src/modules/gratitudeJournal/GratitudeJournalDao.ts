"use strict";

import { BaseDao } from "@modules/base/BaseDao";
import * as config from "@config/index";
import * as appUtils from '@utils/appUtils'
import { DataSync } from "aws-sdk";

export class GratitudeJournalDao extends BaseDao {

    async getGratitudeJournalData(params, userId) {
        try {
            let { startDate, endDate } = params
            let match: any = {};
            let aggPipe = [];
            let result: any = {}
            match["status"] = config.CONSTANT.STATUS.ACTIVE
            match["userId"] = await appUtils.toObjectId(userId.userId)
            aggPipe.push({ "$sort": { "postAt": -1 } });
            if (startDate && endDate) {
                match['postAt'] = { $gte: startDate, $lte: endDate }
            }
            aggPipe.push({ "$match": match });
            aggPipe.push({
                $project:
                {
                    _id: 1,
                    mediaUrl: 1,
                    privacy: 1,
                    title: 1,
                    description: 1,
                    postAt: 1
                }
            })
            result = await this.aggregate('gratitude_journals', aggPipe, {})
            return result
        } catch (error) {
            throw error;
        }
    }
    async getGratitudeJournalHomeData(params, userId) {
        try {
            let { pageNo, limit, postAt, startDate, endDate } = params
            let match: any = {};
            let aggPipe = [];
            let result: any = {}
            match["status"] = config.CONSTANT.STATUS.ACTIVE
            if (postAt) {
                match["postAt"] = postAt
            }
            if (startDate && endDate) {
                match['createdAt'] = { $gte: endDate, $lte: startDate }
            }
            if (!startDate && endDate) {
                match["createdAt"] = { $lt: new Date(endDate) };
            }
            match["userId"] = { $ne: await appUtils.toObjectId(userId.userId) }
            match["privacy"] = config.CONSTANT.PRIVACY_STATUS.PUBLIC
            aggPipe.push({ "$sort": { "createdAt": -1 } });
            aggPipe.push({ "$match": match });
            aggPipe.push({
                $lookup: {
                    "from": "users",
                    "localField": "userId",
                    "foreignField": "_id",
                    "as": "users"
                }
            })
            aggPipe.push({ '$unwind': { path: '$users', preserveNullAndEmptyArrays: true } })
            aggPipe.push({
                $lookup: {
                    from: "likes",
                    let: { "post": "$_id", "user": await appUtils.toObjectId(userId.userId) },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        {
                                            $eq: ["$postId", "$$post"]
                                        },
                                        {
                                            $eq: ["$userId", "$$user"]
                                        },
                                        {
                                            $eq: ["$category", config.CONSTANT.COMMENT_CATEGORY.POST]
                                        },
                                        {
                                            $eq: ["$type", config.CONSTANT.HOME_TYPE.GENERAL_GRATITUDE]
                                        }
                                    ]
                                }
                            }
                        }
                    ],
                    as: "likeData"
                }
            })
            aggPipe.push({
                $lookup: {
                    from: "comments",
                    let: { "post": "$_id", "user": await appUtils.toObjectId(userId.userId) },
                    pipeline: [{
                        $match: {
                            $expr: {
                                $and: [
                                    {
                                        $eq: ["$postId", "$$post"]
                                    },
                                    {
                                        $eq: ["$userId", "$$user"]
                                    },
                                    {
                                        $eq: ['$category', config.CONSTANT.COMMENT_CATEGORY.POST]
                                    },
                                    {
                                        $eq: ["$type", config.CONSTANT.HOME_TYPE.GENERAL_GRATITUDE]
                                    }
                                ]
                            }
                        }

                    }],
                    as: "commentData",
                }
            })
            aggPipe.push({ "$addFields": { created: { "$subtract": ["$createdAt", new Date("1970-01-01")] } } });
            aggPipe.push({
                $project:
                {
                    _id: 1,
                    likeCount: 1,
                    commentCount: 1,
                    mediaType: 1,
                    mediaUrl: 1,
                    thumbnailUrl: 1,
                    description: 1,
                    created: 1,
                    postAt: 1,
                    postedAt: 1,
                    createdAt: 1,
                    user: {
                        _id: "$users._id",
                        name: { $ifNull: ["$users.firstName", ""] },
                        profilePicUrl: "$users.profilePicUrl",
                        profession: { $ifNull: ["$users.profession", ""] }
                    },
                    isComment: {
                        $cond: { if: { "$eq": [{ $size: "$commentData" }, 0] }, then: false, else: true }
                    },
                    isLike: {
                        $cond: { if: { "$eq": [{ $size: "$likeData" }, 0] }, then: false, else: true }
                    }
                }
            })
            aggPipe = [...aggPipe, ...await this.addSkipLimit(limit, pageNo)];
            result = await this.aggregateWithPagination("gratitude_journals", aggPipe, limit, pageNo, true)
            result["type"] = config.CONSTANT.HOME_TYPE.GENERAL_GRATITUDE
            return result
        } catch (error) {
            throw error;
        }
    }
    async checkGratitudeJournal(params) {
        try {
            return await this.findOne('gratitude_journals', params, {}, {});
        } catch (error) {
            throw error;
        }
    }
    async updateGratitudeJournal(query, update) {
        try {
            return await this.update('gratitude_journals', query, update, {});
        } catch (error) {
            throw error;
        }
    }
    async addGratitudeJournal(payload) {
        try {
            payload["created"] = new Date().getTime()
            return await this.save('gratitude_journals', payload);
        } catch (error) {
            throw error;
        }
    }
    async updateLikeAndCommentCount(query, update) {
        try {
            return await this.updateOne('gratitude_journals', query, update, {});
        } catch (error) {
            throw error;
        }
    }

    async userProfileHome(params, tokenData) {
        try {

            // query['userId'] = query.userId ? query.userId : tokenData['userId'];
            let match: any = {};
            let aggPipe = [];
            let result: any = {}
            let criteria: any = {};
            // if (params.userId) {
            //     match['status'] = config.CONSTANT.STATUS.ACTIVE;
            //     match['privacy'] = config.CONSTANT.PRIVACY_STATUS.PUBLIC
            // } else {
            //     // match['status'] = config.CONSTANT.STATUS.ACTIVE;
            //     match['_id'] = appUtils.toObjectId(tokenData['userId']);
            match['status'] = config.CONSTANT.STATUS.ACTIVE;
            // }

            const _id = params.userId ? appUtils.toObjectId(params.userId) : appUtils.toObjectId(tokenData.userId)

            // let idKey: string = '$_id'
            const userDataCriteria = [
                {
                    $match: {
                        _id: _id,
                        status: config.CONSTANT.STATUS.ACTIVE,
                    }
                },
                {
                    $project: {
                        _id: 1,
                        name: {
                            $cond: {
                                if: {
                                    $eq: ['$lastName', null]
                                },
                                then: '$firstName',
                                else: { $concat: ['$firstName', ' ', '$lastName'] }
                            }
                        },
                        profilePicUrl: 1,
                        profession: 1
                    }
                }
            ]
            const userData = await this.aggregate('users', userDataCriteria, {})
            console.log('userDatauserDatauserData', userData);

            match['status'] = config.CONSTANT.STATUS.ACTIVE;
            match['privacy'] = config.CONSTANT.PRIVACY_STATUS.PUBLIC
            if (params.userId) {
                match['userId'] = appUtils.toObjectId(params['userId']);
            } else {
                match['userId'] = appUtils.toObjectId(tokenData['userId']);
            }
            // aggPipe.push(match);
            aggPipe.push({ "$match": match });
            aggPipe.push({ "$sort": { "postAt": -1 } });

            // idKey = '$_idd'
            aggPipe.push({
                $lookup: {
                    from: "likes",
                    let: { "post": '$_id', "user": await appUtils.toObjectId(tokenData.userId) },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        {
                                            $eq: ["$postId", "$$post"]
                                        },
                                        {
                                            $eq: ["$userId", "$$user"]
                                        },
                                        {
                                            $eq: ["$category", config.CONSTANT.COMMENT_CATEGORY.POST]
                                        }
                                    ]
                                }
                            }
                        }
                    ],
                    as: "likeData"
                }
            })
            aggPipe.push({
                $lookup: {
                    from: "comments",
                    let: { "post": "$_id", "user": await appUtils.toObjectId(tokenData.userId) },
                    pipeline: [{
                        $match: {
                            $expr: {
                                $and: [
                                    {
                                        $eq: ["$postId", "$$post"]
                                    },
                                    {
                                        $eq: ["$userId", "$$user"]
                                    },
                                    {
                                        $eq: ['$category', config.CONSTANT.COMMENT_CATEGORY.POST]
                                    }
                                ]
                            }
                        }

                    }],
                    as: "commentData",
                }
            })
            // aggPipe.push({ '$unwind': { path: '$likeData', preserveNullAndEmptyArrays: true } })

            aggPipe.push({
                $project: {
                    likeCount: 1,
                    commentCount: 1,
                    mediaType: 1,
                    mediaUrl: 1,
                    thumbnailUrl: 1,
                    description: 1,
                    created: 1,
                    postAt: 1,
                    postedAt: 1,
                    createdAt: 1,
                    user: userData[0],
                    isLike: {
                        $cond: { if: { "$eq": [{ $size: "$likeData" }, 0] }, then: false, else: true }
                    },
                    isComment: {
                        $cond: { if: { "$eq": [{ $size: "$commentData" }, 0] }, then: false, else: true }
                    }
                }
            })
            const myGratitude = await this.paginate('gratitude_journals', aggPipe, 10, 1, {}, true)
            return myGratitude;

        } catch (error) {
            return Promise.reject(error);
        }
    }
}

export const gratitudeJournalDao = new GratitudeJournalDao();