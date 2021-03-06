"use strict";

import * as promise from "bluebird";

import { BaseDao } from "@modules/base/BaseDao";
import * as config from "@config/index";
import * as moment from 'moment';
import * as appUtils from '@utils/appUtils'

export class HomeDao extends BaseDao {

    async getHomeData(params, userId, header) {
        try {
            let { pageNo, limit, endDate, type } = params
            let match: any = {};
            let aggPipe = [];
            let result: any = {}
            // let endDateee = new Date();
            // let endDateee = moment().utc().endOf('day').toDate();
            let idKey: string = '$_id'
            let endDateee = (moment().utc(header.timezone)).format("x")
            const a = parseInt(endDateee)
            console.log('endDateeeend', a);
            match["postAt"] = { $lte: a }// moment(new Date()).format('YYYY-MM-DD')
            match["status"] = config.CONSTANT.STATUS.ACTIVE
            aggPipe.push({ "$sort": { "createdAt": -1 } });
            if (endDate) {
                match["createdAt"] = { $lt: new Date(endDate) };
            }
            if (type) {
                match["type"] = type
                aggPipe.push({ "$match": match });
            } else {
                aggPipe.push({ "$match": match });
                idKey = '$_idd' 
                aggPipe.push({
                    $group: {
                        _id: "$type",
                        description: { $first: "$description" },
                        _idd: { $first: "$_id" },
                        likeCount: { $first: "$likeCount" },
                        commentCount: { $first: "$commentCount" },
                        // status: { $first : "$status" },
                        thumbnailUrl: { $first: '$thumbnailUrl' },
                        type: { $first: "$type" },
                        mediaType: { $first: "$mediaType" },
                        created: { $first: "$created" },
                        mediaUrl: { $first: "$mediaUrl" },
                        title: { $first: "$title" },
                        // isPostLater: { $first : "$isPostLater" },
                        // postedAt: { $first : "$postedAt" },
                        createdAt: { $first: "$createdAt" }
                    }
                })
            }
            aggPipe.push({
                $lookup: {
                    from: "likes",
                    let: { "post": idKey, "user": await appUtils.toObjectId(userId.userId) },
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
                    let: { "post": idKey, "user": await appUtils.toObjectId(userId.userId) },
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
            aggPipe.push({ "$addFields": { created: { "$subtract": ["$createdAt", new Date("1970-01-01")] } } });
            // aggPipe.push({ $group : { _id : "$type",  description: { $first : "$description" } } } )
            let project: any = {
                // _id: "$_idd",
                likeCount: "$likeCount",
                commentCount: "$commentCount",
                // status: "$status",
                type: "$type",
                mediaType: "$mediaType",
                mediaUrl: "$mediaUrl",
                thumbnailUrl: "$thumbnailUrl",
                title: "$title",
                // createdd:"$created",
                // isPostLater: "$isPostLater",
                description: "$description",
                created: "$created",
                // postedAt: "$postedAt",
                createdAt: "$createdAt",
                // likeData: "$likeData",
                isLike: {
                    // $cond: { if: { "$eq": ["$likeData.userId", await appUtils.toObjectId(userId.userId)] }, then: true, else: false }
                    $cond: { if: { "$eq": [{ $size: "$likeData" }, 0] }, then: false, else: true }
                },
                isComment: {
                    $cond: { if: { "$eq": [{ $size: "$commentData" }, 0] }, then: false, else: true }
                }
            }
            if (!type) {
                project["_id"] = "$_idd"
            }
            aggPipe.push({ $project: project });
            if (!type) {
                result = await this.aggregate('home', aggPipe, {})
                const arr = [0, 0, 0];
                // console.log('resultresultresultresult>>>>>>>>>>>>>>>>', result);
                if (result && result.length > 1) {
                    // result.sort(function (a, b) { return b.type - a.type });
                    // result.reverse()
                    result.map((data: any) => {
                        if (data.type === 3) {
                            arr[0] = data;
                        }
                        else if (data.type === 1) {
                            arr[1] = data;
                        }
                        else if (data.type === 2) {
                            arr[2] = data;
                        }
                    })
                    for (let i = 0; i < arr.length; i++) {
                        if (arr[i] === 0) {
                            let index = i;
                            if (index > -1) {
                                arr.splice(index, 1);
                            }
                        }
                    }
                    result = arr
                }
            } else {
                aggPipe = [...aggPipe, ...await this.addSkipLimit(limit, pageNo)];
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