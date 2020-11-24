"use strict";

import * as promise from "bluebird";

import { BaseDao } from "../base/BaseDao";
import * as config from "../../config/index";
import * as appUtils from '../../utils/appUtils'
import { CONSTANT } from "@config/index";

export class LikeDao extends BaseDao {

	/**
	 * @function isContentExists
	 */
    async addLike(params) {
        try {
            params["created"] = new Date().getTime()
            return await this.save("likes", params);
        } catch (error) {
            throw error;
        }
    }
    async removeLike(params) {
        try {
            return await this.remove("likes", params);
        } catch (error) {
            throw error;
        }
    }
    async checkLike(params) {
        try {
            return await this.findOne("likes", params, {}, {}, {});
        } catch (error) {
            throw error;
        }
    }
    async getLikeList(params) {
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
            aggPipe.push({ "$sort": { "createdAt": -1 } });
            aggPipe.push({ "$match": match });
            aggPipe.push({
                $lookup: {
                    "from": "users",
                    let: { uId: '$userId' },
                    as: 'users',
                    pipeline: [{
                        $match: {
                            $expr: {
                                $and: [{
                                    $eq: ['$_id', '$$uId']
                                },
                                ]
                            }
                        }
                    }]
                }
            })
            aggPipe.push({ '$unwind': { path: '$users', preserveNullAndEmptyArrays: true } },
                {
                    "$project": {
                        "createdAt": 1,
                        "category": 1,
                        // user : {
                        myConnection: "$users.myConnection",
                        status: {
                            $cond: {
                                if: {
                                    $or: [{
                                        $ne: ['$users.status', config.CONSTANT.STATUS.ACTIVE]
                                    },
                                    {
                                        $ne: ['$users.adminStatus', config.CONSTANT.USER_ADMIN_STATUS.VERIFIED]
                                    }],
                                }, then: config.CONSTANT.STATUS.BLOCKED,
                                else: config.CONSTANT.STATUS.ACTIVE
                            }
                        },  //'$users.status',
                        _id: "$users._id",
                        name: { $concat: [{ $ifNull: ["$users.firstName", ""] }, " ", { $ifNull: ["$users.lastName", ""] }] },
                        // name: { $ifNull: ["$users.firstName", ""] },
                        profilePicUrl: "$users.profilePicUrl",
                        profession: { $ifNull: ["$users.profession", ""] },
                        about: { $ifNull: ["$users.about", ""] },
                        industryType: "$users.industryType",
                        experience: "$users.experience",
                        companyName: "$users.companyName",
                        // }
                    }
                });
            aggPipe = [...aggPipe, ...await this.addSkipLimit(limit, pageNo)];
            result = await this.aggregateWithPagination("likes", aggPipe, limit, pageNo, true)
            return result
        } catch (error) {
            throw error;
        }
    }
}

export const likeDao = new LikeDao();