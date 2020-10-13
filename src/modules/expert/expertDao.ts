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

    async getExperts(payload: userExpertRequest.IgetExpert) {
        try {
            const { limit, page, searchTerm } = payload
            let searchCriteria: any = {};

            const paginateOptions = {
                limit: limit || 5,
                pageNo: page || 1,
            };

            if (searchTerm) {
                const reg = new RegExp(searchTerm, 'ig');
                searchCriteria["$or"] = [
                    { title: reg },
                    { description: reg },
                    { name: reg }
                ];
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
                                    $and: [{
                                        $in: ['$$cId', '$categoryId'],
                                    },
                                    {
                                        $eq: ['$status', config.CONSTANT.STATUS.ACTIVE]
                                    }]
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
            {
                $limit: paginateOptions.limit
            }
            ];
            const CategoryLIST = await expertDao.aggregate('categories', categoryPipeline, {})

            let CATEGORIES = {
                CategoryLIST,
                type: 1,
            }
            // const getCatgeory = await categoryDao.find('categories', criteria, {}, {}, { _id: -1 }, paginateOptions, {})

            const newlyAdded = [
                {
                    $match: {
                        status: config.CONSTANT.STATUS.ACTIVE
                    }
                }, {
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
                {
                    $limit: paginateOptions.limit
                }
            ]
            const getNewlyAddedExperts = await expertDao.aggregate('expert', newlyAdded, {})

            // const pipeline = [
            //     {
            //         $match: searchCriteria,
            //     },
            //     {
            //         $sort: {
            //             _id: -1
            //         },
            //     },
            //     {
            //         $lookup: {
            //             from: 'experts',
            //             let: { cId: '$_id' },
            //             as: 'expertData',
            //             pipeline: [
            //                 {
            //                     $match: {
            //                         $expr: {
            //                             $and: [{
            //                                 $in: ['$$cId', '$categoryId'],
            //                             },
            //                             {
            //                                 $eq: ['$status', config.CONSTANT.STATUS.ACTIVE]
            //                             }
            //                             ]
            //                         }
            //                     }
            //                 },
            //             ],
            //         },
            //     },
            //     {
            //         $match: {
            //             expertData: { $ne: [] }
            //         }
            //     }
            // ];

            // const data1 = await expertDao.aggregate('categories', pipeline, {});

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
                            },
                            {
                                $sort: {
                                    _id: -1
                                }
                            },
                            { $limit: paginateOptions.limit }
                        ],
                    },
                },
                {
                    $match: {
                        expertData: { $ne: [] }
                    }
                },
                {
                    $limit: paginateOptions.limit
                }
            ];

            const EXPERTS1 = await expertDao.aggregate('categories', expertPipline, {});

            // if (CategoryLIST.length > 0) {
            CATEGORIES = {
                CategoryLIST,
                type: 0,
            }
            // }
            console.log('CategoryLISTCategoryLISTCategoryLISTCategoryLIST', CategoryLIST);

            console.log('getNewlyAddedExpertsgetNewlyAddedExpertsgetNewlyAddedExperts', getNewlyAddedExperts);

            // const data: any = await categoryDao.aggregate('categories', pipeline, {})

            // const NEWLY_ON_BOARD_EXPERT = {
            //     getNewlyAddedExperts,
            //     type: 1
            // }

            for (var key of EXPERTS1) {
                key['type'] = 2
            }

            if (getNewlyAddedExperts.length > 0) {
                EXPERTS1.unshift({
                    onBoardData: getNewlyAddedExperts,
                    type: 1
                })
            }

            if (CategoryLIST.length > 0) {
                EXPERTS1.unshift({
                    categoryData: CATEGORIES.CategoryLIST,
                    type: 0
                })
            }
            return EXPERTS1;

        } catch (error) {
            return Promise.reject(error)
        }
    }

    /**
     * @function getCategory
     * @params ( userExpertRequest.IgetCategory)
     * @description get experts-categgory and category-list for add
     */
    async getCategory(payload: userExpertRequest.IgetCategory) {
        try {
            const { searchTerm, screenType } = payload;
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
                },
                {
                    $sort: {
                        _id: -1
                    }
                }
            ];

            if (screenType === 'addPost') {
                categoryPipeline.splice(2, 1);
            };

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

    /**
    * @function expertDetailWithPost
    * @params (userExpertRequest.IgetExpertRelatedPost)
    * @description expertDetail and posts list
    */

    async expertDetailWithPost(payload: userExpertRequest.IgetExpertRelatedPost) {
        try {
            const paginateOptions = {
                limit: payload.limit || 10,
                page: payload.page || 1
            }
            let match: any = {};

            // if (payload.postedBy === 1) {
            //     console.log('LLLLLLLLLLLLLL');
            //     postConditions.push({
            //         $gt: ['$createdAt', '2020-07-24']
            //     })
            // } else if (payload.postedBy == 2) {
            //     console.log('LLLLLLLLLLLLLL');
            //     postConditions.push({
            //         $gt: ['$createdAt',]
            //     })
            // }

            const reportedIdsCriteria = {
                userId: appUtils.toObjectId(payload.userId),
                type: config.CONSTANT.HOME_TYPE.EXPERTS_POST,
            };
            const reportedIds = await this.find('report', reportedIdsCriteria, { postId: 1 }, {}, {}, {}, {});
            let reportedpost = [];
            let Ids1 = await reportedIds.map(function (item) {
                return reportedpost.push(appUtils.toObjectId(item.postId));
            });

            const pipeline = [
                {
                    $match: {
                        _id: appUtils.toObjectId(payload.expertId),
                    }
                },
                {
                    $lookup: {
                        from: 'categories',
                        let: { cId: '$categoryId' },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [{
                                            $in: ['$_id', '$$cId']
                                        },
                                        {
                                            $eq: ['$status', config.CONSTANT.STATUS.ACTIVE]
                                        }]
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

                },
                {
                    $project: {
                        status: 0,
                        privacy: 0,
                        createdAt: 0,
                        updatedAt: 0,
                        categoryId: 0
                    }
                },
            ];

            let data;
            if (paginateOptions.page < 2) {
                console.log('pagepage', paginateOptions.page);
                data = await expertDao.aggregate('expert', pipeline, {});
            }

            let expertPostspipeline = []
            match['expertId'] = appUtils.toObjectId(payload.expertId);
            match['status'] = config.CONSTANT.STATUS.ACTIVE;
            match['_id'] = {
                $nin: reportedpost
            };

            if (payload.posted === 1) {
                console.log('last week');
                // match['createdAt'] = {
                //     $gte: new Date(new Date() - 7 * 60 * 60 * 24 * 1000))
                // }
            }
            else if (payload.posted === 2) {
                var date = new Date(), y = date.getFullYear(), m = date.getMonth() - 1;
                var firstDay = new Date(y, m, 1);
                console.log('firstDay', firstDay);
                var lastDay = new Date(y, m + 1, 0);

                match['createdAt'] = {
                    $gt: firstDay,
                    $lt: lastDay
                }
            }

            if (payload.contentType) {
                let aa = [];
                let bb = payload.contentType.split(',')
                for (var i = 0; i < bb.length; i++) {
                    aa.push(parseInt(bb[i]))
                }
                match['contentId'] = {
                    $in: aa
                }
            };
            match['privacy'] = config.CONSTANT.PRIVACY_STATUS.PRIVATE;

            expertPostspipeline = [
                {
                    $match: match
                },
                {
                    $sort: {
                        _id: -1
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
                                    {
                                        $eq: ["$category", config.CONSTANT.COMMENT_CATEGORY.POST]
                                    },
                                    {
                                        $eq: ["$type", config.CONSTANT.HOME_TYPE.EXPERTS_POST]
                                    }
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
                    $lookup: {
                        from: 'categories',
                        let: { cId: '$categoryId' },
                        as: 'categoryData',
                        pipeline: [{
                            $match: {
                                $expr: {
                                    $and: [
                                        {
                                            $eq: ['$_id', '$$cId']
                                        },
                                        {
                                            $eq: ['$status', config.CONSTANT.STATUS.ACTIVE]
                                        }
                                    ]
                                }
                            }
                        },
                        {
                            $project: {
                                _id: 1,
                                name: 1,
                                title: 1,
                                imageUrl: 1
                            }
                        }],

                    }
                },
                // {
                //     $unwind: {
                //         path: '$categoryData', preserveNullAndEmptyArrays: false
                //     }
                // },
                {
                    $project: {
                        // categoryData: 0,
                        updatedAt: 0,
                        createdAt: 0,
                        status: 0,
                        privacy: 0,
                    }
                },
            ];
            expertPostspipeline.push({
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
                    thumbnailUrl: 1,
                    topic: 1,
                    description: 1,
                    categoryData: 1,
                    type: 1,
                    created: 1,
                    contentDisplayName: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    isLike: {
                        $cond: { if: { "$eq": [{ $size: "$likeData" }, 0] }, then: false, else: true }
                    },
                    isComment: {
                        $cond: { if: { "$eq": [{ $size: "$commentData" }, 0] }, then: false, else: true }
                    },
                }
            });
            expertPostspipeline = [...expertPostspipeline, ...await this.addSkipLimit(paginateOptions.limit, paginateOptions.page)];
            let EXPERTPOST = await this.aggregateWithPagination1("expert_post", expertPostspipeline);
            const data0 = data ? data[0] : {};
            const expertPosts = EXPERTPOST
            return {
                expert: data0 ? data0 : {},
                expertPosts
            };
        } catch (error) {
            return Promise.reject(error)
        }
    }

    async getPostDetail(payload: userExpertRequest.IPostId) {
        try {
            const pipeline = [{
                $match: {
                    _id: appUtils.toObjectId(payload.postId),
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
            return data;

        } catch (error) {
            return Promise.reject(error);
        }
    }

    /**
     * @function getcategoryExperts
     * @params ( userExpertRequest.getCategoryExpert)
     * @description categoryRelatedExperts
     */
    async getcategoryExperts(payload: userExpertRequest.ICategoryRelatedExpert) {
        try {
            let { limit, page, searchTerm } = payload

            const match: any = {};

            match.status = config.CONSTANT.STATUS.ACTIVE;

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
                                        },
                                            // {
                                            //     $eq: ['status', config.CONSTANT.STATUS.ACTIVE]
                                            // }
                                        ]
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
            categoryPipeline = [...categoryPipeline, ...await this.addSkipLimit(limit, page)];
            let result = await this.aggregateWithPagination("expert", categoryPipeline, limit, page, true)

            return result;
        } catch (error) {
            return Promise.reject(error);
        }
    }

    /**
    * @function expertsListSearch
    * @params (userExpertRequest.expertSearch)
    * @description expertList on tap of view all
    */
    async getExpertListBySearch(payload: userExpertRequest.expertSearch) {
        try {
            const { limit, pageNo, searchKey } = payload;
            const paginateOptions = {
                limit: limit || 10,
                page: pageNo || 1
            }

            let match: any = {};
            let aggPipe = []
            match['status'] = config.CONSTANT.STATUS.ACTIVE

            if (searchKey) {
                match["$or"] = [
                    { "topic": { "$regex": searchKey, "$options": "-i" } },
                    { name: { "$regex": searchKey, "$options": "-i" } },
                ];
            }
            aggPipe.push({ $match: match })

            aggPipe.push({
                $sort: {
                    _id: -1
                }
            })


            aggPipe.push({
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
                                    }
                                    ]
                                }
                            }
                        },
                        {
                            $project: {
                                _id: 1, name: 1, title: 1, imageUrl: 1
                            }
                        }
                    ],
                },
            },
                {
                    $match: {
                        expertData: { $ne: [] }
                    }
                },
                {
                    $project: {
                        categoryId: 0,
                        createdAt: 0,
                        updatedAt: 0,
                        status: 0,
                    }
                },
            )

            aggPipe = [...aggPipe, ...await this.addSkipLimit(paginateOptions.limit, paginateOptions.page)];
            let result = await this.aggregateWithPagination("expert", aggPipe)
            return result;
        } catch (error) {
            return Promise.reject(error)
        }
    }
}

export const expertDao = new ExpertDao();