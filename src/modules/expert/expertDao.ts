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

            const categoryPipeline = [{
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
                    expertData: 0
                }
            }
            ];
            const CategoryLIST = await expertDao.aggregate('categories', categoryPipeline, {})

            let CATEGORIES = {
                CategoryLIST,
                type: 1,
            }
            // const getCatgeory = await categoryDao.find('categories', criteria, {}, {}, { _id: -1 }, paginateOptions, {})


            // const newlyAdded = [{
            //     $lookup: {
            //         from: 'categories',
            //         let: { cId: '$categoryId' },
            //         as: 'categoryData',
            //         pipeline: [
            //             {
            //                 $match: {
            //                     $expr: {
            //                         $in: ['$_id', '$$cId'],
            //                     }
            //                 }
            //             }
            //         ],
            //     },
            // },
            // {
            //     $sort: {
            //         _id: -1
            //     }
            // },
            // {
            //     $match: {
            //         categoryData: { $ne: [] }
            //     }
            // }
            // ]
            // const getNewlyAddedExperts = await expertDao.aggregate('expert', newlyAdded, {})

            // // const getNewlyAddedExperts = await categories('expert', criteria, {}, {}, { _id: -1 }, paginateOptions, {})


            // // console.log('getCatgeporygetCatgepory', getCatgeory);


            // if (searchTerm) {
            //     searchCriteria = {
            //         $or: [
            //             { title: { $regex: searchTerm, $options: 'i' } },
            //             { description: { $regex: searchTerm, $options: 'i' } },
            //             { name: { $regex: searchTerm, $options: 'i' } },
            //         ],
            //     };
            // }
            // else {
            //     searchCriteria = {
            //     };
            // }

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
            //                             }]
            //                         }
            //                     }
            //                 }
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
            // console.log('data1data1data1data1', data1);

            // // if (!data || data.length === 0) return UniversalFunctions.sendSuccess(Constant.STATUS_MSG.SUCCESS.S204.NO_CONTENT_AVAILABLE, data);
            // return {
            //     categories: data1,
            //     getNewlyAddedExperts
            // };

            const pipeline = [
                // {
                // $match: {
                //     searchCriteria
                // },
                // },
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
                            }
                        ],
                    }
                },
                {
                    $match: {
                        expertData: { $ne: [] }
                    }
                },
                //            {
                //             $unwind:{
                //                 path:'$expertData'
                //                 }   
                //           },
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
                                    CATEGORIES: [],
                                    NEWEXPERTS: [],
                                    EXPERTS: [],
                                },
                                in: {
                                    $cond: {
                                        if: {
                                            $and: [
                                                {
                                                    $ne: [{ $size: '$$value.CATEGORIES' }, 1],
                                                }
                                            ],
                                        },
                                        then: {
                                            $mergeObjects: ['$$value', { CATEGORIES: ['$$this'] }],
                                        },
                                        else: {
                                            $cond: {
                                                if: {
                                                    $ne: [{ $size: '$$value.NEWEXPERTS' }, 1],
                                                },
                                                then: {
                                                    $mergeObjects: ['$$value', { NEWEXPERTS: { $concatArrays: ['$$value.NEWEXPERTS', ['$$this']] } }],
                                                },
                                                else: {
                                                    $mergeObjects: ['$$value', { EXPERTS: { $concatArrays: ['$$value.EXPERTS', ['$$this']] } }],
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
                {
                    $project: {
                        NEWLY_ON_BOARD_EXPERT: '$results.NEWEXPERTS',
                        EXPERT_LIST: '$results.EXPERTS',
                    }
                },
                //                 {
                //                   $unwind:{
                //                       path:'$LATEST'
                //                       }  
                //                 },
                //                 {
                //                  $group:{
                //                      _id: '$LATEST.expertData._id',
                //                      "price" : {'$first':'$LATEST.expertData.price'},
                //                     "likeCount" : {'$first':'$LATEST.expertData.likeCount'},
                //                    "commentCount" : {'$first':'LATEST.expertData.commentCount'},
                //                     "status" : {'$first':'$LATEST.expertData.status'},
                //                 "privacy" : {"likeCount.privacy",
                //                 "profilePicUrl" : '$first.likeCount'
                //                     expertId:{$first:'$LATEST.expertData._id'},
                //                     "name" : {'$first': '$LATEST.expertData.name'},
                //                    "email" : {'$first':"$LATEST.expertData.email"},
                //                 "profession" : "$first.profession",
                //                 "industry" : "$first.industry",
                //                 "bio" : "$first.bio",
                //                 "experience" : "first.experience",  
                //                     "doc": { "$first": "$$ROOT" }
                //                      }   
                //                },
                //           {
                //            "$replaceRoot": { "newRoot": "$doc" }
                //           },
            ]
            // result = CategoryLIST;
            // CATEGORIES = {
            //     CategoryLIST,
            //     type: 0,
            // }
            // result.type = 0

            console.log('data1data1data1data1', pipeline);
            const data: any = await categoryDao.aggregate('categories', pipeline, {})
            console.log('data1data1data1data1', data);

            // if (!data || data.length === 0) return UniversalFunctions.sendSuccess(Constant.STATUS_MSG.SUCCESS.S204.NO_CONTENT_AVAILABLE, data);
            const CATEGORY_LIST = data[0]['NEWLY_ON_BOARD_EXPERT']
            const NEWLY_ON_BOARD_EXPERT = {
                CATEGORY_LIST,
                type: 2
            }

            for (var key of data[0].EXPERT_LIST) {
                key['type'] = 3
            }

            const EXPERTS = data[0].EXPERT_LIST

            const EXPERT_LIST = {
                EXPERTS,
            }
            return {
                CATEGORIES,
                NEWLY_ON_BOARD_EXPERT,
                EXPERT_LIST
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