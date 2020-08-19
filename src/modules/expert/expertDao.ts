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
                limit: limit || 5,
                pageNo: page || 1,
            };
            console.log('paginateOptions', paginateOptions);

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

            const categoryPipeline = [{
                $match: {
                    status: config.CONSTANT.STATUS.ACTIVE
                }
            },
            {
                $sort: {
                    _id: -1
                }
            },
            {
                $lookup: {
                    from: 'experts',
                    let: { cId: '$_id' },
                    as: 'expertData',
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $in: ['$$cId', '$categoryId'],
                                }
                            }
                        },
                        {
                            $project: {
                                _id: 1, name: 1, title: 1, imageUrl: 1
                            }
                        }
                    ],
                }
            },
            {
                $match: {
                    expertData: { $ne: [] }
                }
            },
            {
                $project: {
                    expertData: 0,
                    createdAt: 0,
                    updatedAt: 0,
                    status: 0,
                }
            },
                // {
                //     $limit: 5
                // }
            ];
            const CategoryLIST = await expertDao.aggregate('categories', categoryPipeline, {})

            let CATEGORIES = {
                CategoryLIST,
                type: 1,
            }
            // const getCatgeory = await categoryDao.find('categories', criteria, {}, {}, { _id: -1 }, paginateOptions, {})


            const newlyAdded = [{
                $lookup: {
                    from: 'categories',
                    let: { cId: '$categoryId' },
                    as: 'categoryData',
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [{
                                        $in: ['$_id', '$$cId'],
                                    },
                                    {
                                        $eq: ['$status', config.CONSTANT.STATUS.ACTIVE]
                                    }]
                                }
                            }
                        }
                    ],
                },
            },
            {
                $sort: {
                    _id: -1
                }
            },
            {
                $match: {
                    categoryData: { $ne: [] }
                }
            },
            {
                $project: {
                    categoryId: 0,
                    status: 0,
                    createdAt: 0,
                    updatedAt: 0

                }
            },
                // {
                //     $limit: 5
                // }
            ]
            const getNewlyAddedExperts = await expertDao.aggregate('expert', newlyAdded, {})

            // // const getNewlyAddedExperts = await categories('expert', criteria, {}, {}, { _id: -1 }, paginateOptions, {})

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
                    $lookup: {
                        from: 'experts',
                        let: { cId: '$_id' },
                        as: 'expertData',
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [{
                                            $in: ['$$cId', '$categoryId'],
                                        },
                                            // {
                                            //     $eq: ['$status', config.CONSTANT.STATUS.ACTIVE]
                                            // }
                                        ]
                                    }
                                }
                            }
                        ],
                    },
                },
                {
                    $match: {
                        expertData: { $ne: [] }
                    }
                }
            ];

            const data1 = await expertDao.aggregate('categories', pipeline, {});
            // console.log('data1data1data1data1', data1);



            const expertPipline = [
                {
                    $match: {
                        status: config.CONSTANT.STATUS.ACTIVE
                    }
                },
                {
                    $match: searchCriteria,
                },
                {
                    $sort: {
                        _id: -1
                    },
                },
                {
                    $lookup: {
                        from: 'experts',
                        let: { cId: '$_id' },
                        as: 'expertData',
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [{
                                            $in: ['$$cId', '$categoryId'],
                                        },
                                        {
                                            $eq: ['$status', config.CONSTANT.STATUS.ACTIVE]
                                        }]
                                    }
                                }
                            }
                        ],
                    },
                },
                {
                    $match: {
                        expertData: { $ne: [] }
                    }
                }
            ];

            const EXPERTS1 = await expertDao.aggregate('categories', expertPipline, {});
            console.log('data1data1data1data1>>>>>>>>>>>>>>', EXPERTS1);

            // result = CategoryLIST;
            CATEGORIES = {
                CategoryLIST,
                type: 0,
            }
            // result.type = 0

            console.log('data1data1data1data1', pipeline);
            const data: any = await categoryDao.aggregate('categories', pipeline, {})
            console.log('data1data1data1data1', data);

            // if (!data || data.length === 0) return UniversalFunctions.sendSuccess(Constant.STATUS_MSG.SUCCESS.S204.NO_CONTENT_AVAILABLE, data);
            // const CATEGORY_LIST = data[0]['NEWLY_ON_BOARD_EXPERT']
            const NEWLY_ON_BOARD_EXPERT = {
                getNewlyAddedExperts,
                type: 1
            }

            for (var key of EXPERTS1) {
                key['type'] = 2
            }

            // const EXPERTS = data[0].EXPERT_LIST

            // const EXPERT_LIST = {
            //     EXPERTS1,
            // }
            // return {
            //     CATEGORIES,
            //     NEWLY_ON_BOARD_EXPERT,
            //     EXPERT_LIST
            //     // CATEGORIES,
            //     // NEWLY_ON_BOARD_EXPERT,
            //     // EXPERT_LIST
            // };
            EXPERTS1.unshift({
                data: getNewlyAddedExperts,
                type: 1
            })
            EXPERTS1.unshift({
                data: CATEGORIES.CategoryLIST,
                type: 0
            })
            // const EXPERTS = data[0].EXPERT_LIST

            // const EXPERT_LIST = {
            //     EXPERTS1,
            // }
            return EXPERTS1
            // return {
            //     // CATEGORIES,
            //     // // NEWLY_ON_BOARD_EXPERT,
            //     // // // EXPERT_LIST
            //     // CATEGORIES,
            //     // NEWLY_ON_BOARD_EXPERT,
            //     // EXPERT_LIST
            // };

        } catch (error) {
            return Promise.reject(error)
        }
    }

    async getCategory(payload) {
        try {
            const { searchTerm, sortingType } = payload;
            let { limit, page } = payload
            let criteria: any = {};

            let categoryPipeline: any = []

            const match: any = {};
            // if (status) {
            // match["$and"] = [{ status: status }, { status: { "$ne": config.CONSTANT.STATUS.DELETED } }];
            // } else {
            match.status = config.CONSTANT.STATUS.ACTIVE;
            // }

            if (searchTerm) {
                match["$or"] = [
                    { "title": { "$regex": searchTerm, "$options": "-i" } },
                    { "name": { "$regex": searchTerm, "$options": "-i" } },
                ];
            }


            const paginateOptions = {
                limit: limit || 10,
                pageNo: page || 1,
            };
            console.log('paginateOptions', paginateOptions);

            categoryPipeline = [
                {
                    $match: match
                }, {
                    $lookup: {
                        from: 'experts',
                        let: { cId: '$_id' },
                        as: 'expertData',
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [{
                                            $in: ['$$cId', '$categoryId'],
                                        },
                                        {
                                            $eq: ['$status', config.CONSTANT.STATUS.ACTIVE]
                                        }
                                        ]
                                    }
                                }
                            },
                        ],
                    }
                },
                {
                    $match: {
                        expertData: { $ne: [] }
                    }
                },
                {
                    $project: {
                        createdAt: 0,
                        updatedAt: 0,
                        status: 0,
                        expertData: 0
                    }
                }
            ];

            // if (payload.categoryId) {
            //     // const a = {
            //     //     $project: {
            //     //         expertData: 1
            //     //     }
            //     // }
            //     categoryPipeline.splice(3, 3)
            // }
            // console.log('categoryPipelinecategoryPipeline', categoryPipeline);

            categoryPipeline = [...categoryPipeline, ...await this.addSkipLimit(paginateOptions.limit, paginateOptions.pageNo)];
            let result = await this.aggregateWithPagination("categories", categoryPipeline, limit, page, true);
            return result;
        } catch (error) {
            return Promise.reject(error)
        }
    }

    async expertDetailWithPost(payload) {
        try {
            console.log('payloadpayloadpayload', payload);
            // ])
            let postConditions: any = []
            postConditions = [
                {
                    $eq: ['$expertId', '$$eId']
                },
                {
                    $eq: ['$categoryId', '$$cId']
                },
                {
                    $eq: ['$status', 'active']
                },
            ];
            if (payload.postedBy == 'lastWeek') {
                console.log('LLLLLLLLLLLLLL');
                postConditions.push({
                    $gt: ['$createdAt', '2020-07-24']
                })
            } else if (payload.postedBy == 'lastMonth') {
                console.log('LLLLLLLLLLLLLL');
                postConditions.push({
                    $gt: ['$createdAt',]
                })
            }
            if (payload.contentType) {
                postConditions.push({
                    $eq: ['$contentId', payload.contentType]
                })
            }
            console.log('postConditionspostConditions', postConditions);

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
                            },
                            {
                                $project: {
                                    createdAt: 0,
                                    updatedAt: 0,
                                    status: 0
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
                                        $and: postConditions
                                    }
                                }
                            }
                        ],
                        as: 'expertPosts'
                    }
                },
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

    async getcategoryExperts(payload) {
        try {
            const { searchTerm, sortingType } = payload;
            let { limit, page } = payload
            let criteria: any = {};


            const match: any = {};

            // match.status = config.CONSTANT.STATUS.ACTIVE;

            if (searchTerm) {
                match["$or"] = [
                    { "title": { "$regex": searchTerm, "$options": "-i" } },
                    { "name": { "$regex": searchTerm, "$options": "-i" } },
                ];
            }

            const paginateOptions = {
                limit: limit || 10,
                pageNo: page || 1,
            };

            match['categoryId'] = {
                $in: ['categoryId', appUtils.toObjectId(payload.categoryId)]
            }

            console.log('paginateOptions', paginateOptions);

            let categoryPipeline: any = [
                {
                    $match: match
                },
                {
                    $lookup: {
                        from: 'categories',
                        let: { cId: '$categoryId' },
                        as: 'categoryData',
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [{
                                            $in: ['$_id', '$$cId'],
                                        }]
                                    }
                                }
                            },
                        ],
                    }
                },
                {
                    $match: {
                        categoryData: { $ne: [] }
                    }
                },
                {
                    $project: {
                        categoryData: 0,
                        createdAt: 0,
                        updatedAt: 0,
                        categoryId: 0,
                        email: 0,
                        status: 0,
                        privacy: 0,
                        contentId: 0,
                        contentType: 0,
                        contentDisplayName: 0
                    }
                }
            ];
            // console.log('limit>>>>>>>', limit, 'pageLLLLLLLLLLL', page);
            categoryPipeline = [...categoryPipeline, ...await this.addSkipLimit(limit, page)];
            let result = await this.aggregateWithPagination("expert", categoryPipeline, limit, page, true)

            // const expertList = await expertDao.aggreagtionWithPaginateTotal('expert', categoryPipeline, limit, page, true)

            return result;
        } catch (error) {
            return Promise.reject(error);
        }
    }
}

export const expertDao = new ExpertDao();