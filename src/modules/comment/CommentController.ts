"use strict";

import * as _ from "lodash";
import fs = require("fs");

import * as commentConstants from "./CommentConstant";
import * as homeConstants from "../home/HomeConstant";

import { commentDao } from "./CommentDao";
import { homeDao } from "../home/HomeDao";
import * as config from "@config/index";
import { CONSTANT } from "@config/index";
import * as appUtils from '../../utils/appUtils'


class CommentController {

    async getComments(params) {
        try {
            let { pageNo, limit, userId, commentId, postId } = params
            let match: any = {};
            let aggPipe = [];
            let result: any = {}
            // match["userId"] = appUtils.toObjectId(userId)
            match["postId"] = appUtils.toObjectId(postId)
            if (commentId) {
                match["commentId"] = appUtils.toObjectId(commentId)
                match["category"] = CONSTANT.COMMENT_CATEGORY.COMMENT
            } else {
                match["category"] = CONSTANT.COMMENT_CATEGORY.POST
            }
            aggPipe.push({ "$match": match });
            aggPipe.push({ "$sort": { "createdAt": -1 } });
            aggPipe.push({
                $lookup: {
                    from: 'users',
                    let: { uId: '$userId' },
                    pipeline: [{
                        $match: {
                            $expr: {
                                $eq: ['$_id', '$$uId'],
                            }
                        }
                    },
                    {
                        $project: {
                            email: 1,
                            firstName: 1,
                            lastName: 1,
                            status: 1,
                            profilePicUrl: 1
                        },
                    },
                    ],
                    as: 'users',
                },
            },
                {
                    $unwind: {
                        path: '$users',
                        preserveNullAndEmptyArrays: true,
                    },
                },
            )

            // aggPipe.push({
            //     $lookup: {
            //         from: "likes",
            //         let: { "post": "$postId", "comment": "$_id", "user": await appUtils.toObjectId(userId) },
            //         pipeline: [
            //             {
            //                 $match: {
            //                     $expr: {
            //                         $and: [
            //                             {
            //                                 $eq: ["$postId", "$$post"]
            //                             },
            //                             {
            //                                 $eq: ["$commentId", "$$comment"]
            //                             },
            //                             {
            //                                 $eq: ["$userId", "$$user"]
            //                             },
            //                             {
            //                                 $eq: ["$category", CONSTANT.COMMENT_CATEGORY.COMMENT]
            //                             }
            //                         ]
            //                     }
            //                 }
            //             }
            //         ],
            //         as: "likeData"
            //     }
            // })
            // aggPipe.push({ '$unwind': { path: '$likeData', preserveNullAndEmptyArrays: true } })
            // aggPipe.push({ '$unwind': { path: '$users', preserveNullAndEmptyArrays: true } },
            //     {
            //         "$project": {
            //             "likeCount": 1,
            //             "commentCount": 1,
            //             "category": 1,
            //             "created": 1,
            //             "isLike": {
            //                 $cond: { if: { "$eq": ["$likeData.userId", await appUtils.toObjectId(userId)] }, then: true, else: false }
            //             },
            //             "comment": 1,
            //             "createdAt": 1,
            //             "users": {
            //                 name: { $ifNull: ["$users.firstName", ""] },
            //                 profilePicture: { $ifNull: ["$users.profilePicture", ""] }
            //             }
            //         }
            // });

            result = await commentDao.aggreagtionWithPaginateTotal("comments", aggPipe, limit, pageNo, true)
            return result
        } catch (error) {
            throw error;
        }
    }





    async addComment(params: CommentRequest.AddCommentRequest) {
        try {
            let getPost: any = {}
            let query: any = {}
            let getComment: any = {}
            query = { _id: await appUtils.toObjectId(params.postId) }
            // if (params.type === CONSTANT.COMMENT_TYPE.DAILY_ADVICE) {
            // getPost = await commentDao.checkPost(query, "advice")
            // } else if (params.type === CONSTANT.COMMENT_TYPE.UNICORN) {
            //     getPost = await commentDao.checkPost(query, "unicorn")
            // } else if (params.type === CONSTANT.COMMENT_TYPE.INSPIRATION) {
            //     getPost = await commentDao.checkPost(query, "inspiration")
            // } 
            if (params.type === CONSTANT.HOME_TYPE.MEMBER_OF_DAY) {
                return homeConstants.MESSAGES.ERROR.FEATURE_NOT_ENABLE;
                // getPost = await commentDao.checkPost(query, '')
            } else if (params.type === CONSTANT.HOME_TYPE.GENERAL_GRATITUDE) {
                // getPost = await commentDao.checkPost(query, '')
                return homeConstants.MESSAGES.ERROR.FEATURE_NOT_ENABLE;
            } else {
                getPost = await homeDao.checkHomePost(query)
            }
            if (getPost) {
                if (getPost.status === config.CONSTANT.STATUS.DELETED) {
                    return homeConstants.MESSAGES.ERROR.POST_DELETED;
                } else if (getPost.status === config.CONSTANT.STATUS.BLOCKED) {
                    return homeConstants.MESSAGES.ERROR.POST_BLOCK;
                }
            } else {
                return homeConstants.MESSAGES.ERROR.POST_NOT_FOUND;
            }
            if (params && params.commentId) {
                query = { _id: await appUtils.toObjectId(params.commentId) }
                getComment = await commentDao.checkComment(query)
                if (!getComment) {
                    return homeConstants.MESSAGES.ERROR.COMMENT_NOT_FOUND;
                } else {
                    params["category"] = CONSTANT.COMMENT_CATEGORY.COMMENT
                    await commentDao.updateComment(query, { $inc: { commentCount: 1 } })
                }
            } else {
                await homeDao.updateHomePost(query, { $inc: { commentCount: 1 } })
            }
            await commentDao.addComments(params)
            return config.CONSTANT.MESSAGES.SUCCESS.SUCCESSFULLY_ADDED;
        } catch (error) {
            throw error;
        }
    }
    async getCommentList(params: CommentRequest.AddCommentRequest) {
        try {
            let list = await commentDao.getCommentList(params)
            return commentConstants.MESSAGES.SUCCESS.COMMENT_LIST(list)
        } catch (error) {
            throw error;
        }
    }
}
export const commentController = new CommentController();