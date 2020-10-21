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
                                {
                                    $eq: ['$status', config.CONSTANT.STATUS.ACTIVE]
                                }]
                            }
                        }
                    }]
                }
            })
            aggPipe.push({ '$unwind': { path: '$users', preserveNullAndEmptyArrays: false } },
                {
                    "$project": {
                        "createdAt": 1,
                        "category": 1,
                        // user : {
                        myConnection: "$users.myConnection",
                        status: '$users.status',
                        _id: "$users._id",
                        name: { $ifNull: ["$users.firstName", ""] },
                        profilePicUrl: "$users.profilePicUrl",
                        profession: { $ifNull: ["$users.profession", ""] },
                        about: { $ifNull: ["$users.about", ""] },
                        industryType: "$users.industryType",
                        experience: "$users.experience"
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