"use strict";

import { BaseDao } from "@modules/base/BaseDao";
import * as config from "@config/index";
import * as appUtils from '@utils/appUtils'
import { DataSync } from "aws-sdk";
import { categoryDao } from "@modules/admin/catgeory";
import { expert } from "@modules/admin/expert/expertModel";
import { expertPostDao } from "@modules/admin/expertPost/expertPostDao";

export class ForumTopic extends BaseDao {

    async getGratitudeJournalData(params) {
        try {
        } catch (error) {
            return Promise.reject(error);
        }
    }

    async getTopicForHomeProfile(params, tokenData) {
        try {
            console.log('paramsparamsparams', params.userId);
            console.log('tokenDatatokenDatatokenDatatokenData', tokenData.userId);

            let aggPipe = [];
            let match: any = {};
            let criteria: any = {};
            if (params.userId) {
                criteria['_id'] = appUtils.toObjectId(params['userId']);
                criteria['status'] = config.CONSTANT.STATUS.ACTIVE;
                // criteria['privacy'] = config.CONSTANT.PRIVACY_STATUS.PUBLIC
            } else {
                criteria['status'] = config.CONSTANT.STATUS.ACTIVE;
                criteria['_id'] = appUtils.toObjectId(tokenData['userId']);
            }
            let idKey: string = '$_id'
            const userDataCriteria = [
                {
                    $match: criteria
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
            if (params.userId) {
                match['postAnonymous'] = false;
            }
            if (params.userId) {
                match['userId'] = appUtils.toObjectId(params['userId']);
                match['status'] = config.CONSTANT.STATUS.ACTIVE;
                // match['privacy'] = config.CONSTANT.PRIVACY_STATUS.PUBLIC
            } else {
                match['status'] = config.CONSTANT.STATUS.ACTIVE;
                match['match'] = appUtils.toObjectId(tokenData['userId']);
            }
            aggPipe.push({ "$match": match });
            aggPipe.push({ "$sort": { "postAt": -1 } });

            // idKey = '$_idd'


            aggPipe.push({
                $lookup: {
                    from: "likes",
                    let: { "post": '$_id', "user": await appUtils.toObjectId(params.userId) },
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
                    let: { "post": "$_id", "user": await appUtils.toObjectId(params.userId) },
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
                        // $cond: { if: { "$eq": ["$likeData.userId", await appUtils.toObjectId(userId.userId)] }, then: true, else: false }
                        $cond: { if: { "$eq": [{ $size: "$likeData" }, 0] }, then: false, else: true }
                    },
                    isComment: {
                        $cond: { if: { "$eq": [{ $size: "$commentData" }, 0] }, then: false, else: true }
                    }
                }
            })
            const myForumData = await this.paginate('forum_topic', aggPipe, 10, 1, {}, true)
            return myForumData;
        } catch (error) {
            return Promise.reject(error)
        }
    }
}

export const forumtopicDao = new ForumTopic();