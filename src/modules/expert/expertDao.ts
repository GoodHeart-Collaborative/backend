"use strict";

import { BaseDao } from "@modules/base/BaseDao";
import * as config from "@config/index";
import * as appUtils from '@utils/appUtils'
import { DataSync, Config } from "aws-sdk";
import { categoryDao } from "@modules/admin/catgeory";
import { expert } from "@modules/admin/expert/expertModel";
import { expertPostDao } from "@modules/admin/expertPost/expertPostDao";

export class ExpertDao extends BaseDao {

    async getGratitudeJournalData(params) {
        try {
            let { pageNo, limit } = params
            let match: any = {};
            let aggPipe = [];
            let result: any = {}
            match["status"] = config.CONSTANT.STATUS.ACTIVE
            aggPipe.push({ "$sort": { "createdAt": -1 } });
        } catch (error) {
            return Promise.reject(error);
        }
    }

    async getExperts(payload) {
        try {
            const { searchTerm, sortingType } = payload;
            let { limit, page } = payload
            let searchCriteria: any = {};
            const criteria = {
                status: config.CONSTANT.STATUS.ACTIVE,
            }
            const paginateOptions = {
                limit: limit || 10,
                pageNo: page || 1,
            };
            console.log('paginateOptions', paginateOptions);

            const getCatgeory = await categoryDao.find('categories', criteria, {}, {}, { _id: -1 }, paginateOptions, {})

            console.log('getCatgeporygetCatgepory', getCatgeory);


            if (searchTerm) {
                searchCriteria = {
                    $or: [
                        { title: { $regex: searchTerm, $options: 'i' } },
                        { description: { $regex: searchTerm, $options: 'i' } },
                        { name: { $regex: searchTerm, $options: 'i' } },
                    ],
                };
            }
            else {
                searchCriteria = {
                };
            }

            const pipeline = [
                {
                    $match: searchCriteria,
                },
                {
                    $sort: {
                        _id: -1
                    },
                },
                {
                    $group: {
                        _id: null,
                        list: {
                            $push: '$$ROOT',
                        },
                    },
                },
                {
                    $project: {
                        results: {
                            $reduce: {
                                input: '$list',
                                initialValue: {
                                    LIST: [],
                                },
                                in: {
                                    $mergeObjects: ['$$value', { LIST: { $concatArrays: ['$$value.LIST', ['$$this']] } }],
                                },
                            },
                        },
                    },
                },
                {
                    $project: {
                        _id: 0,
                        LIST: '$results.LIST',
                    },
                },
                {
                    $lookup: {
                        from: 'categories',
                        let: { list: '$LIST' },
                        as: 'CATEGORIES',
                        pipeline: [
                            // {
                            //     $match: {
                            //         status: config.CONSTANT.STATUS.ACTIVE,
                            //     },
                            // },
                            {
                                $project: {
                                    title: 1,
                                    name: 1,
                                    expert: {
                                        $filter: {
                                            input: '$$list',
                                            as: 'experts',
                                            cond: {
                                                $in: ['$_id', '$$experts.categoryId'],
                                            },
                                        },
                                    },
                                },
                            },
                            {
                                $project: {
                                    CATEGORIES: 1,
                                    title: 1,
                                    name: 1,
                                    experts: {
                                        $slice: ['$expert', 5],
                                    },
                                },
                            },
                        ],
                    },
                },
                {
                    $project: {
                        LIST: 0,
                    },
                },
                {
                    $group: {
                        _id: '$_id',
                        // FEATURED: {
                        //     $push: '$FEATURED',
                        // },
                        // LATEST: {
                        //     $first: '$LATEST',
                        // },
                        CATEGORIES: {
                            $first: '$CATEGORIES',
                        },

                    },
                },
            ];

            const data = await expertDao.aggregate('expert', pipeline, {});

            // if (!data || data.length === 0) return UniversalFunctions.sendSuccess(Constant.STATUS_MSG.SUCCESS.S204.NO_CONTENT_AVAILABLE, data);
            return data[0] || {
                CATEGORIES: [],
                getCatgeory
            };



        } catch (error) {
            return Promise.reject(error)
        }
    }

    async getCategory(payload) {
        try {
            const pipeline = [
                {
                    $group: {
                        _id: '$categoryId'
                    }
                },
                {
                    $lookup: {
                        from: 'categories',
                        let: { 'cid': '$_id' },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $eq: ['$_id', '$$cid']
                                    }
                                }
                            }
                        ],
                        as: 'categoriesData'
                    }
                },
                { '$unwind': { path: '$categoriesData', preserveNullAndEmptyArrays: true } }
            ]
            const data = await expertPostDao.aggregate('expert_post', pipeline, {});
            return data;
        } catch (error) {
            return Promise.reject(error)
        }
    }

    async expertDetailWithPost(payload) {
        try {
            const pipeline = [
                {
                    $match: {
                        _id: appUtils.toObjectId(payload.expertId)
                    }
                },
                {
                    $lookup: {
                        from: 'categories',
                        let: { cId: appUtils.toObjectId(payload.categoryId) },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $eq: ['$_id', '$$cId']
                                    }
                                }
                            }
                        ],
                        as: 'categoryData'
                    },
                    //                     
                },
                { '$unwind': { path: '$categoryData', preserveNullAndEmptyArrays: true } },
                {
                    $lookup: {
                        from: 'expert_posts',
                        let: { eId: '$_id', cId: appUtils.toObjectId(payload.categoryId) },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            {
                                                $eq: ['$expertId', '$$eId']
                                            },
                                            {
                                                $eq: ['$categoryId', '$$cId']
                                            },
                                            {
                                                $eq: ['$status', 'active']
                                            }

                                        ]
                                    }
                                }
                            }
                        ],
                        as: 'expertPosts'
                    }
                }
            ];
            const data = await expertDao.aggregate('expert', pipeline, {});
            return data;
        } catch (error) {
            return Promise.reject(error)
        }
    }

    async getPostDetail(payload) {
        try {
            const pipeline = [{
                $match: {
                    _id: appUtils.toObjectId(payload.postId)
                }
            },
            {
                $lookup: {
                    from: 'likes',
                    let: { pId: '$_id', uId: appUtils.toObjectId(payload.userId), },
                    pipeline: [{
                        $match: {
                            $expr: {
                                $and: [{
                                    $eq: ['$userId', '$$uId']
                                },
                                {
                                    $eq: ['$postId', '$$pId']
                                },
                                ]
                            }
                        }
                    }],
                    as: 'likeData'
                }
            },
            {
                $lookup: {
                    from: "comments",
                    let: { "post": "$_id", "user": await appUtils.toObjectId(payload.userId) },
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
            },
            // { '$unwind': { path: '$likeData', preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    // _id: 1,
                    price: 1,
                    contentId: 1,
                    likeCount: 1,
                    commentCount: 1,
                    status: 1,
                    privacy: 1,
                    mediaType: 1,
                    categoryId: 1,
                    mediaUrl: 1,
                    expertId: 1,
                    contentType: 1,
                    contentDisplayName: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    isLike: {
                        $cond: { if: { "$eq": [{ $size: "$likeData" }, 0] }, then: false, else: true }
                    },
                    isComment: {
                        $cond: { if: { "$eq": [{ $size: "$commentData" }, 0] }, then: false, else: true }
                    },
                    likdeta: '$likeData',
                    commentData: '$commentData'
                    // isLike: { likeData: { $size: { $gt: 0 } }, then: true, else: false }
                    // isLike: {
                    //     $cond: {
                    //         if: {
                    //             $eq: ["$likeData.userId", appUtils.toObjectId(payload.userId)],
                    //             then: true, else: false
                    //         }
                    //     }
                    // }
                }
            }
            ]

            const data = await expertDao.aggregate('expert_post', pipeline, {})

            console.log('datadatadatadatadatadatadatadata', data);
            return data;

        } catch (error) {
            return Promise.reject(error);
        }
    }
}

export const expertDao = new ExpertDao();