"use strict";

import * as _ from "lodash";
import fs = require("fs");
import * as config from "@config/index";
import * as appUtils from '../../../utils/appUtils'
// import * as sns from "@lib/pushNotification/sns";
import { homeDao } from "@modules/admin/Home/adminHomeDao";
import { likeDao } from "@modules/like";

class AdminLikeController {
    /**
     * @function signup
     * @description if IS_REDIS_ENABLE set to true,
     * than redisClient.storeList() function saves value in redis. 
     */


    async getLikes(params) {
        try {
            let { pageNo, limit, userId, commentId, postId } = params
            let match: any = {};
            let aggPipe = [];
            let result: any = {}
            // match["userId"] = userId
            match["postId"] = appUtils.toObjectId(postId)
            if (commentId) {
                match["commentId"] = appUtils.toObjectId(commentId)
                match["category"] = config.CONSTANT.COMMENT_CATEGORY.COMMENT
            }
            // else {
            //     match["category"] = config.CONSTANT.COMMENT_CATEGORY.POST
            // }
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
                        "users": {
                            name: { $ifNull: ["$users.firstName", ""] },
                            profilePicture: {
                                $ifNull: ["$users.profilePicture", ""],
                                status: '$users.status'
                            }
                        }
                    }
                });
            result = await likeDao.aggreagtionWithPaginateTotal("likes", aggPipe, limit, pageNo, true);
            console.log('resultresultresultresult', result);

            return result
        } catch (error) {
            throw error;
        }
    }


    async updateStatus(params: UnicornRequest.IUpdateUnicornStatus) {
        try {
            const criteria = {
                _id: params.Id
            }
            const dataToUpdate = {
                ...params
            }
            const data = await homeDao.updateOne('home', criteria, dataToUpdate, {});
            console.log('dataToUpdatedataToUpdate', data);
            return config.CONSTANT.MESSAGES.SUCCESS.SUCCESSFULLY_UPDATED;


        } catch (error) {
            return Promise.reject(error);
        }
    }

    async updatePost(params: HomeRequest.updateHome) {
        try {
            const criteria = {
                _id: params.Id
            }
            const dataToUpdate = {
                ...params
            }
            const data = await homeDao.updateOne('home', criteria, dataToUpdate, {});
            console.log('dataToUpdatedataToUpdate', data);
            return config.CONSTANT.MESSAGES.SUCCESS.SUCCESSFULLY_UPDATED

        } catch (error) {
            return Promise.reject(error);
        }
    }
}



export const likeController = new AdminLikeController();