"use strict";

import { BaseDao } from "@modules/base/BaseDao";
import * as config from "@config/index";
import * as appUtils from '@utils/appUtils'

export class ForumTopic extends BaseDao {

    async saveForum(params) {
        try {
            let data = await this.save("forum", params);
            return data
        } catch (error) {
            return Promise.reject(error);
        }
    }

    async getFormPosts(params, tokenData?) {
        try {
            const { page, limit, postId, categoryId } = params;
            let aggPipe = [];
            let match: any = {};
            let categoryMatch: any = {};
            let data: any = {}
            const paginateOptions = {
                page: page || 1,
                limit: limit || 10
            };


            match['status'] = config.CONSTANT.STATUS.ACTIVE;
            if (categoryId) {
                match['categoryId'] = await appUtils.toObjectId(categoryId);
            }
            // if (categoryId) {
            //     match['categoryId'] = appUtils.toObjectId(categoryId)
            // }
            if (postId) {
                match['_id'] = postId;
            } else {
                if(page === 1) {
                let categoryPipe = [
                    {
                        $match: {
                            status: config.CONSTANT.STATUS.ACTIVE,
                        }
                    }, {
                        $lookup: {
                            from: 'forums',
                            let: { cId: '$_id' },
                            as: 'forumData',
                            pipeline: [{
                                $match: {
                                    $expr: {
                                        $and: [{
                                            $eq: ['$status', config.CONSTANT.STATUS.ACTIVE]
                                        },
                                        {
                                            $eq: ['$categoryId', '$$cId']
                                        }
                                        ]
                                    }
                                }
                            }
                            ]
                        }
                    },
                    {
                        $match: {
                            forumData: { $ne: [] }
                        }
                    },
                    {
                        $project: {
                            forumData: 0
                        }
                    },
                    {
                        $limit: 5
                    }
                ];
                data = await this.aggregate('categories', categoryPipe, {})
            }
            }

            // const getAdminName = await this.findOne('admins', { _id: appUtils.toObjectId('5eec5b831ab81855c16879e5') }, { name: 1 }, {});
            // if (postId) {
            //     match['_id'] = appUtils.toObjectId(postId);
            // }
            match['status'] = config.CONSTANT.STATUS.ACTIVE;
            aggPipe.push({ $match: match });
            aggPipe.push({
                $lookup: {
                    "from": "categories",
                    let: { cId: '$categoryId' },
                    as: 'categoryData',
                    pipeline: [{
                        $match: {
                            $expr: {
                                $and: [{
                                    $eq: ['$status', config.CONSTANT.STATUS.ACTIVE],
                                },
                                {
                                    $eq: ['$_id', '$$cId']
                                }]
                            }
                        }
                    },
                    {
                        $project: {
                            name: 1,
                            title: 1,
                            imageUrl: 1
                        }
                    }]
                }
            })
            aggPipe.push({ '$unwind': { path: '$categoryData', preserveNullAndEmptyArrays: true } })
            aggPipe.push({
                $lookup: {
                    "from": "users",
                    "localField": "userId",
                    "foreignField": "_id",
                    "as": "users"
                }
            })
            aggPipe.push({ '$unwind': { path: '$users', preserveNullAndEmptyArrays: true } })
            // aggPipe.push({
            //     $lookup: {
            //         "from": "comments",
            //         "localField": "commentId",
            //         "foreignField": "_id",
            //         "as": "comments"
            //     }
            // })
            // aggPipe.push({ '$unwind': { path: '$comments', preserveNullAndEmptyArrays: true } })

            aggPipe.push({ "$match": match });
            aggPipe.push({ "$sort": { "postAt": -1 } });

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
                },
            },
                {
                    $sort: {
                        _id: -1
                    }
                })

            aggPipe.push({
                $project: {
                    likeCount: 1,
                    commentCount: 1,
                    mediaType: 1,
                    mediaUrl: 1,
                    thumbnailUrl: 1,
                    description: 1,
                    created: 1,
                    userId: 1,
                    postAt: 1,
                    postedAt: 1,
                    createdAt: 1,
                    categoryData: 1,
                    postAnonymous: 1,
                    userType: 1,
                    isCreatedByMe: {
                        $cond: { if: { "$eq": ["$createrId", await appUtils.toObjectId(params.userId)] }, then: true, else: false }
                    },
                    // comment: { $ifNull: ["$comments.comment", ""] },
                    // commentCreated: { $ifNull: ["$comments.created", ''] },
                    user: {
                        _id: "$users._id",
                        industryType: "$users.industryType",
                        myConnection: "$users.myConnection",
                        experience: "$users.experience",
                        about: "$users.about",
                        profilePicUrl: "$users.profilePicUrl",
                        profession: { $ifNull: ["$users.profession", ""] },
                        name: { $concat: [{ $ifNull: ["$users.firstName", ""] }, " ", { $ifNull: ["$users.lastName", ""] }] },
                        // name: {
                        //     $cond: {
                        //         if: {
                        //             $and: [
                        //                 {
                        //                     $ifNull: ['$userId', false],
                        //                 },
                        //                 {
                        //                     $eq: ['$userType', 'user']
                        //                 }
                        //             ]
                        //         },
                        //         then: 'Anonymous',
                        //         else: {
                        //             $cond: {
                        //                 if: {
                        //                     $and: [
                        //                         {
                        //                             $ifNull: ['$userId', true],
                        //                         },
                        //                         {
                        //                             $eq: ['$userType', 'user']
                        //                         }
                        //                     ]
                        //                 }, then: "$users.firstName",
                        //                 else: 'Good heart team'
                        //             }
                        //         }
                        //     }
                        // },
                    },
                    isLike: {
                        $cond: { if: { "$eq": [{ $size: "$likeData" }, 0] }, then: false, else: true }
                    },
                    isComment: {
                        $cond: { if: { "$eq": [{ $size: "$commentData" }, 0] }, then: false, else: true }
                    },
                    type: 1
                },

            })

            let myForumData;
            if (!params.postId) {
                aggPipe = [...aggPipe, ...await this.addSkipLimit(paginateOptions.limit, paginateOptions.page)];
                myForumData = await this.aggregateWithPagination('forum', aggPipe)
            }

            if (params.postId) {
                myForumData = await this.aggregate('forum', aggPipe, {})
            }

            const categories = {
                categoryData: data,
                type: 0
            };
            const arr1: any = {
                total: myForumData.total,
                next_hit: myForumData.next_hit,
                // type: 1
            }

            if (params.postId) {
                return myForumData[0] ? myForumData[0] : {};
            }
            let arr: any = []
            if (categoryId) {
                arr = [...myForumData.list]
            } else {
                arr = [categories, ...myForumData.list]
            }
            if (!params.postId) {
                return {
                    data: arr,
                    total: myForumData.total,
                    next_hit: myForumData.next_hit
                }
            }

        } catch (error) {
            return Promise.reject(error)
        }
    }
    async checkForum(params) {
        try {
            return await this.findOne('forum', params, {}, {});
        } catch (error) {
            throw error;
        }
    }
    async updateForum(query, params) {
        try {
            let update: any = {}
            if (params && params.postAnonymous === false) {
                params['userId'] = query.createrId
            } else {
                if (params && params.postAnonymous === false) {
                    update["$unset"] = { userId: "" }
                }
            }
            update["$set"] = params
            return await this.findOneAndUpdate('forum', query, update, {});
        } catch (error) {
            throw error;
        }
    }
    async updateForumLikeAndCommentCount(query, update) {
        try {
            return await this.updateOne('forum', query, update, {});
        } catch (error) {
            throw error;
        }
    }
}

export const forumtopicDao = new ForumTopic();