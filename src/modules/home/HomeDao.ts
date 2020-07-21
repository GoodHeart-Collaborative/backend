"use strict";

import * as promise from "bluebird";

import { BaseDao } from "@modules/base/BaseDao";
import * as config from "@config/index";
import * as moment from 'moment';
import * as appUtils from '@utils/appUtils'

export class HomeDao extends BaseDao {

    async getHomeData(params, userId) {
        try {
            console.log('userId.userIduserId.userIduserId.userId', userId.userId);

            let { pageNo, limit, endDate } = params
            let match: any = {};
            let aggPipe = [];
            let result: any = {}
            match["postedAt"] = moment(new Date()).format('YYYY-MM-DD')
            match["status"] = config.CONSTANT.STATUS.ACTIVE
            aggPipe.push({ "$sort": { "createdAt": -1 } });
            if (endDate) {
                match["createdAt"] = { $lt: new Date(endDate) };
            }
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
                                        }
                                    ]
                                }
                            }
                        }
                    ],
                    as: "likeData"
                }
            })

            aggPipe.push({ '$unwind': { path: '$likeData', preserveNullAndEmptyArrays: true } })

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
                                        $eq: ['$category', config.CONSTANT.COMMENT_CATEGORY.COMMENT]
                                    }
                                ]
                            }
                        }

                    }],
                    as: "commentData",
                }
            })

            aggPipe.push({
                $project:
                {
                    _id: 1,
                    likeCount: 1,
                    commentCount: 1,
                    status: 1,
                    type: 1,
                    mediaType: 1,
                    thumbnailUrl: 1,
                    title: 1,
                    isPostLater: 1,
                    description: 1,
                    created: 1,
                    postedAt: 1,
                    createdAt: 1,
                    isLike:
                    {
                        $cond: { if: { "$eq": ["$likeData.userId", await appUtils.toObjectId(userId.userId)] }, then: true, else: false }
                    },
                    isComment: {
                        $cond: { if: { "$eq": ["$commentData.userId", await appUtils.toObjectId(userId.userId)] }, then: true, else: false }
                    }
                }
            });

            aggPipe.push({ "$match": match });
            result = await this.aggregateWithPagination("home", aggPipe, limit, pageNo, true)
            if (result && result.list && result.list.length == 0) {
                delete match.postedAt
                aggPipe.pop()
                result = await this.aggregateWithPagination("home", aggPipe, limit, pageNo, true)
            }
            return result
        } catch (error) {
            throw error;
        }
    }
    async checkHomePost(params) {
        try {
            return await this.findOne('home', params, {}, {});
        } catch (error) {
            throw error;
        }
    }
    async updateHomePost(query, update, options?: any) {
        try {
            // options['new'] = true;
            // options['lean'] = true;

            return await this.updateOne('home', query, update, {});
        } catch (error) {
            throw error;
        }
    }

}

export const homeDao = new HomeDao();