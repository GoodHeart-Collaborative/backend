"use strict";

import * as _ from "lodash";
import fs = require("fs");
import * as config from "@config/index";
import * as appUtils from '../../../utils/appUtils'
import { likeDao } from "@modules/like";

class AdminLikeController {
    /**
     * @function signup
     * @description if IS_REDIS_ENABLE set to true,
     * than redisClient.storeList() function saves value in redis. 
     */


    async getLikes(params: LikeRequest.AdminGetLikes) {
        try {
            let { pageNo, limit, commentId, postId } = params
            let match: any = {};
            let aggPipe = [];
            let result: any = {}
            // match["userId"] = userId
            match["postId"] = appUtils.toObjectId(postId)
            if (commentId) {
                match["commentId"] = appUtils.toObjectId(commentId)
                match["category"] = config.CONSTANT.COMMENT_CATEGORY.COMMENT
            }
            else {
                match["category"] = config.CONSTANT.COMMENT_CATEGORY.POST
            }
            aggPipe.push({ "$match": match });
            aggPipe.push({ "$sort": { "createdAt": -1 } });
            aggPipe.push({
                $lookup: {
                    "from": "users",
                    "localField": "userId",
                    "foreignField": "_id",
                    "as": "users"
                }
            })
            aggPipe.push({ '$unwind': { path: '$users', preserveNullAndEmptyArrays: true } },
                {
                    "$project": {
                        "createdAt": 1,
                        "category": 1,
                        user: {
                            _id: "$users._id",
                            // name: { $ifNull: ["$users.firstName", ""] },
                            firstName: { $ifNull: ["$users.firstName", ""] },
                            lastName: { $ifNull: ["$users.lastName", ""] },
                            profilePicUrl: "$users.profilePicUrl",
                            profession: { $ifNull: ["$users.profession", ""] },
                            status: '$users.status',
                            adminStatus: '$users.adminStatus'
                        }
                    }
                });
            result = await likeDao.aggreagtionWithPaginateTotal("likes", aggPipe, limit, pageNo, true);

            return result
        } catch (error) {
            throw error;
        }
    }
}



export const likeController = new AdminLikeController();