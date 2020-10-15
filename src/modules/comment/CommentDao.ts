"use strict";
import { BaseDao } from "../base/BaseDao";
import * as appUtils from '../../utils/appUtils'
import { config } from "aws-sdk";
import { CONSTANT } from "@config/index";
import * as mongoose from "mongoose";


export class CommentDao extends BaseDao {

    // /**
    //  * @function isContentExists
    //  */
    async addComments(params) {
        try {
            params["created"] = new Date().getTime()
            return await this.save("comments", params);
        } catch (error) {
            throw error;
        }
    }
    async checkPost(params, model) {
        try {
            return await this.findOne(model, params, {}, {});
        } catch (error) {
            throw error;
        }
    }
    async checkComment(params) {
        try {
            return await this.findOne("comments", params, {}, {}, {});
        } catch (error) {
            throw error;
        }
    }
    async updateComment(query, update, options?) {
        try {
            return await this.update('comments', query, update, {});
        } catch (error) {
            throw error;
        }
    }
    async getCommentList(params) {
        try {
            let { pageNo, limit, userId, commentId, postId, _id } = params
            let match: any = {};
            let aggPipe = [];
            let isPaginationEnable: boolean = true
            let result: any = {}
            if (_id) {
                match["_id"] = _id
                pageNo = 1
                limit = 1
                isPaginationEnable = false
            } else {
                match["postId"] = appUtils.toObjectId(postId)
                aggPipe.push({ "$sort": { "createdAt": -1 } });
            }
            if (commentId) {
                match["commentId"] = appUtils.toObjectId(commentId)
                match["category"] = CONSTANT.COMMENT_CATEGORY.COMMENT
            } else {
                match["category"] = CONSTANT.COMMENT_CATEGORY.POST
            }
            aggPipe.push({ "$match": match });
            aggPipe.push({
                $lookup: {
                    "from": "users",
                    "localField": "userId",
                    "foreignField": "_id",
                    "as": "users"
                }
            })
            aggPipe.push({
                $lookup: {
                    from: "likes",
                    let: { "post": "$postId", "comment": "$_id", "user": await appUtils.toObjectId(userId) },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        {
                                            $eq: ["$postId", "$$post"]
                                        },
                                        {
                                            $eq: ["$commentId", "$$comment"]
                                        },
                                        {
                                            $eq: ["$userId", "$$user"]
                                        },
                                        {
                                            $eq: ["$category", CONSTANT.COMMENT_CATEGORY.COMMENT]
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
                    from: "discovers",
                    let: { "users": "$userId", "user": mongoose.Types.ObjectId(userId) },
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
                                                    $eq: ["$followerId", "$$users"]
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
            aggPipe.push({ '$unwind': { path: '$likeData', preserveNullAndEmptyArrays: true } })
            aggPipe.push({
                $lookup: {
                    from: "comments",
                    let: { "comment": "$_id", "post": "$postId", "user": await appUtils.toObjectId(userId) },
                    pipeline: [{
                        $match: {
                            $expr: {
                                $and: [
                                    {
                                        $eq: ["$commentId", "$$comment"]
                                    },
                                    {
                                        $eq: ["$postId", "$$post"]
                                    },
                                    {
                                        $eq: ["$userId", "$$user"]
                                    },
                                    {
                                        $eq: ['$category', CONSTANT.COMMENT_CATEGORY.COMMENT]
                                    }
                                ]
                            }
                        }

                    }],
                    as: "commentData",
                }
            })

            aggPipe.push({ '$unwind': { path: '$users', preserveNullAndEmptyArrays: true } },
                {
                    "$project": {
                        "likeCount": 1,
                        "commentCount": 1,
                        "category": 1,
                        "created": 1,
                        "isLike": {
                            $cond: { if: { "$eq": ["$likeData.userId", await appUtils.toObjectId(userId)] }, then: true, else: false }
                        },
                        "comment": 1,
                        "createdAt": 1,
                        user: {
                            status: '$users.status',
                            _id: "$users._id",
                            industryType: "$users.industryType",
                            myConnection: "$users.myConnection",
                            experience: "$users.experience",
                            discover_status: { $ifNull: ["$DiscoverData.discover_status", 4] },
                            name: { $concat: [{ $ifNull: ["$users.firstName", ""] }, " ", { $ifNull: ["$users.lastName", ""] }] },
                            profilePicUrl: "$users.profilePicUrl",
                            profession: { $ifNull: ["$users.profession", ""] },
                            about: { $ifNull: ["$users.about", ""] },
                        },
                        isComment: {
                            $cond: { if: { "$eq": [{ $size: "$commentData" }, 0] }, then: false, else: true }
                        },
                    }
                });
            aggPipe = [...aggPipe, ...await this.addSkipLimit(limit, pageNo)];
            result = await this.aggregateWithPagination("comments", aggPipe, limit, pageNo, isPaginationEnable)
            return result
        } catch (error) {
            throw error;
        }
    }

}

export const commentDao = new CommentDao();