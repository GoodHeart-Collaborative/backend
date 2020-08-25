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

    async getFormPosts(params) {
        try {
            const { page, limit, _id } = params;
            let aggPipe = [];
            let match: any = {};
            let categoryMatch: any = {};

            const paginateOptions = {
                page: page || 1,
                limit: limit || 10
            };

            categoryMatch['status'] = config.CONSTANT.STATUS.ACTIVE;

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
                        },
                            // {
                            //     $project: {
                            //         created: 1,
                            //         imageUrl: 1,
                            //         title: 1,
                            //         name: 1,
                            //     }
                            // }
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
            const data: any = await this.aggregate('categories', categoryPipe, {})

            // const getAdminName = await this.findOne('admins', { _id: appUtils.toObjectId('5eec5b831ab81855c16879e5') }, { name: 1 }, {});
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
            // if (params.userId) {
            //     criteria['_id'] = appUtils.toObjectId(params['userId']);
            //     criteria['status'] = config.CONSTANT.STATUS.ACTIVE;
            //     // criteria['privacy'] = config.CONSTANT.PRIVACY_STATUS.PUBLIC
            // } else {
            //     criteria['status'] = config.CONSTANT.STATUS.ACTIVE;
            //     criteria['_id'] = appUtils.toObjectId(tokenData['userId']);
            // }
            // let idKey: string = '$_id'
            // const userDataCriteria = [
            //     {
            //         $match: criteria
            //     },
            //     {
            //         $project: {
            //             _id: 1,
            //             name: {
            //                 $cond: {
            //                     if: {
            //                         $eq: ['$lastName', null]
            //                     },
            //                     then: '$firstName',
            //                     else: { $concat: ['$firstName', ' ', '$lastName'] }
            //                 }
            //             },
            //             profilePicUrl: 1,
            //             profession: 1
            //         }
            //     }
            // ]
            // const userData = await this.aggregate('users', userDataCriteria, {})
            // console.log('userDatauserDatauserData', userData);

            // match['status'] = config.CONSTANT.STATUS.ACTIVE;
            // if (params.userId) {
            //     match['postAnonymous'] = false;
            // }
            // if (params.userId) {
            //     match['userId'] = appUtils.toObjectId(params['userId']);
            //     match['status'] = config.CONSTANT.STATUS.ACTIVE;
            //     // match['privacy'] = config.CONSTANT.PRIVACY_STATUS.PUBLIC
            // } else {
            //     match['status'] = config.CONSTANT.STATUS.ACTIVE;
            //     match['match'] = appUtils.toObjectId(tokenData['userId']);
            // }
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
                        $cond: { if: { "$eq": [ "$users._id", await appUtils.toObjectId(params.userId)] }, then: true, else: false }
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
                        name: { $concat: [ { $ifNull: ["$users.firstName", ""] }, " ",  { $ifNull: ["$users.lastName", ""]} ]},
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
                    type:1
                },

            })

            aggPipe = [...aggPipe, ...await this.addSkipLimit(paginateOptions.limit, paginateOptions.page)];
            const myForumData: any = await this.aggregateWithPagination('forum', aggPipe)


            const categories = {
                data,
                type: 0
            };
            const arr1: any = {
                total: myForumData.total,
                next_hit: myForumData.next_hit,
                // type: 1
            }
            let arr = [categories, ...myForumData.list]

            return {
                data: arr,
                total: myForumData.total,
                next_hit: myForumData.next_hit,
                // type: 1
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
            if (params && params.postAnonymous) {
                params['userId'] = query.createrId
            } else {
                if (params && params.postAnonymous === false) {
                    update["$unset"] = { userId: "" }
                }
            }
            update["$set"] = params
            return await this.updateOne('forum', query, update, {});
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