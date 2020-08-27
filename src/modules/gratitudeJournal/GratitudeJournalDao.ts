"use strict";

import { BaseDao } from "@modules/base/BaseDao";
import * as config from "@config/index";
import * as appUtils from '@utils/appUtils'
import { DataSync } from "aws-sdk";
import * as mongoose from "mongoose";


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
                $lookup: {
                    from: "discovers",
                    let: { "users": "$userId", "user": mongoose.Types.ObjectId(userId.userId) },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $or: [
                                        {
                                            $and: [
                                                {
                                                    $eq: ["$followerId", "$$user"]
                                                },
                                                {
                                                    $eq: ["$userId", "$$users"]
                                                }
                                            ]
                                        },
                                        {
                                            $and: [
                                                {
                                                    $eq: ["$userId", "$$user"]
                                                },
                                                {
                                                    $eq: ["$followerId", "$users"]
                                                }
                                            ]
                                        }
                                    ]
                                }
                            }
                        }
                    ],
                    as: "DiscoverData"
                }
            })
            aggPipe.push({ '$unwind': { path: '$DiscoverData', preserveNullAndEmptyArrays: true } })

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
                        industryType: "$users.industryType",
                        myConnection: "$users.myConnection",
                        experience: "$users.experience",
                        discover_status: { $ifNull: ["$DiscoverData.discover_status", 4] },
                        name: { $concat: [{ $ifNull: ["$users.firstName", ""] }, " ", { $ifNull: ["$users.lastName", ""] }] },
                        profilePicUrl: "$users.profilePicUrl",
                        profession: { $ifNull: ["$users.profession", ""] },
                        about: { $ifNull: ["$about", ""] }
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

            const paginateOptions = {
                page: params.page || 1,
                limit: params.limit || 10,
            }

            let match: any = {};
            let aggPipe = [];
            let result: any = {}
            let criteria: any = {};
            let discover: any = {}
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
            let query: any = {}
            if (params && params.userId) {
                query = {
                    $or: [
                        { userId: appUtils.toObjectId(params.userId), followerId: appUtils.toObjectId(tokenData.userId) },
                        { userId: appUtils.toObjectId(tokenData.userId), followerId: appUtils.toObjectId(params.userId) }
                    ]
                }

            } else {
                query = {
                    $or: [
                        { userId: appUtils.toObjectId(tokenData.userId) }, { followerId: appUtils.toObjectId(tokenData.userId) }
                    ]
                }
            }
            discover = await this.findOne('discover', query, {}, {})
            if (!discover) {
                discover = {
                    discover_status: 4
                }
            }

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
                        industryType: 1,
                        myConnection: 1,
                        experience: 1,
                        discover_status: discover.discover_status,
                        name: { $concat: [{ $ifNull: ["$firstName", ""] }, " ", { $ifNull: ["$lastName", ""] }] },
                        profilePicUrl: "$profilePicUrl",
                        profession: { $ifNull: ["$profession", ""] },
                        about: { $ifNull: ["$about", ""] }
                    }
                }
            ]
            let userData = await this.aggregate('users', userDataCriteria, {})
            userData[0].discover_status = discover.discover_status
            // console.log('userDatauserDatauserData', userData);

            match['status'] = config.CONSTANT.STATUS.ACTIVE;
            match['privacy'] = config.CONSTANT.PRIVACY_STATUS.PUBLIC
            if (params.userId) {
                match['userId'] = appUtils.toObjectId(params['userId']);
                match['privacy'] = config.CONSTANT.PRIVACY_STATUS.PUBLIC;
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
            aggPipe.push({ "$addFields": { userDataa: userData } });
            aggPipe.push({ '$unwind': { path: "$userDataa", preserveNullAndEmptyArrays: true } })

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
                    about: 1,
                    postedAt: 1,
                    createdAt: 1,
                    user: "$userDataa",
                    isLike: {
                        $cond: { if: { "$eq": [{ $size: "$likeData" }, 0] }, then: false, else: true }
                    },
                    isComment: {
                        $cond: { if: { "$eq": [{ $size: "$commentData" }, 0] }, then: false, else: true }
                    }
                }
            })
            const myGratitude = await this.paginate('gratitude_journals', aggPipe, paginateOptions.limit, paginateOptions.page, {}, true)
            return myGratitude;

        } catch (error) {
            return Promise.reject(error);
        }
    }
}

export const gratitudeJournalDao = new GratitudeJournalDao();