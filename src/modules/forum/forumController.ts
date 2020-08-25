"use strict";


import * as _ from "lodash";
import * as forumConstant from "@modules/forum/forumConstant";
import { eventDao } from "@modules/event/eventDao";
import { forumtopicDao } from "./forumDao";
import * as appUtils from '@utils/appUtils';
import * as config from "@config/constant";
class forumController {

    // getTypeAndDisplayName(findObj, num: number) {
    //     const obj = findObj;
    //     const data = Object.values(obj);
    //     const result = data.filter((x: any) => {
    //         return x.VALUE === num;
    //     });
    //     console.log('resultresultresult', result);
    //     return result[0];
    // }
	/**
	 * @function add event
	 * @description user add event
	 */
    async updateForum(params: AdminForumRequest.EditForum, userId) {
        try {
            const criteria = { _id: params.postId, createrId: userId.userId };
            let match: any = {};
            let aggPipe: any = [];
            // delete params.postId
            // const dataToUpdate = {...params}
            let checkForum = await forumtopicDao.checkForum(criteria)
            if (checkForum) {
                let updateForum = await forumtopicDao.updateForum(criteria, params);
                // return forumConstant.MESSAGES.SUCCESS.FORUM_UPDATED(updateForum);

                match['_id'] = appUtils.toObjectId(updateForum._id);
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

                aggPipe.push({ "$match": match });
                aggPipe.push({ "$sort": { "postAt": -1 } });

                aggPipe.push({
                    $lookup: {
                        from: "likes",
                        let: { "post": '$_id', "user": await appUtils.toObjectId(userId.userId) },
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
                            $cond: { if: { "$eq": ["$users._id", await appUtils.toObjectId(userId.userId)] }, then: true, else: false }
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
                myForumData = await forumtopicDao.aggregate('forum', aggPipe, {})
                console.log('myForumDatamyForumData', myForumData);

                return myForumData[0] ? myForumData[0] : {};

            } else {
                return forumConstant.MESSAGES.ERROR.FORUM_NOT_FOUND;
            }
        } catch (error) {
            throw error;
        }
    }
    async addForum(params: AdminForumRequest.AddForum) {
        try {
            params["created"] = new Date().getTime()
            let data = await forumtopicDao.saveForum(params)
            return forumConstant.MESSAGES.SUCCESS.FORUM_ADDED(data);
        } catch (error) {
            throw error;
        }
    }

    async GetFormPosts(params) {
        try {
            let data = await forumtopicDao.getFormPosts(params);
            return forumConstant.MESSAGES.SUCCESS.DEFAULT_SUCCESS(data);
        } catch (error) {
            return Promise.reject(error);
        }
    }

    // async updateExpert(params: AdminExpertRequest.updateExpert) {
    //     try {
    //         const criteria = {
    //             _id: params.expertId,
    //         };

    //         const data = await eventDao.updateOne('expert', criteria, params, {})
    //         if (!data) {
    //             // return forumConstant.MESSAGES.SUCCESS.SUCCESS_WITH_NO_DATA;
    //         }
    //         // return forumConstant.MESSAGES.SUCCESS.DEFAULT_WITH_DATA(data);
    //     } catch (error) {
    //         throw error;
    //     }
    // }

    /**
     * @function updateStatus
     * @description admin update status active ,block ,delete
     */

    async updateForumStatus(params) {
        try {
            const criteria = {
                _id: params.postId,
                createrId: params.userId
            };
            const datatoUpdate = {
                status: params.status
            };
            const data = await eventDao.findByIdAndUpdate('forum', criteria, datatoUpdate, { new: true })
            console.log('datadata', data);

            return forumConstant.MESSAGES.SUCCESS.FORUM_STATUS_UPDATED(data.status);
        } catch (error) {
            return Promise.reject(error)
        }
    }
}
export const userForumController = new forumController();