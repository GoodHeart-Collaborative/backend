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
            let aggPipe = [];
            let match: any = {};
            let criteria: any = {};
            aggPipe.push({
                $lookup: {
                    "from": "users",
                    "localField": "userId",
                    "foreignField": "_id",
                    "as": "users"
                }
            })
            aggPipe.push({ '$unwind': { path: '$users', preserveNullAndEmptyArrays: true } })
            aggPipe.push({
                $lookup: {
                    "from": "comments",
                    "localField": "commentId",
                    "foreignField": "_id",
                    "as": "comments"
                }
            })
            aggPipe.push({ '$unwind': { path: '$comments', preserveNullAndEmptyArrays: true } })
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

            match['status'] = config.CONSTANT.STATUS.ACTIVE;
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
                    postAt: 1,
                    postedAt: 1,
                    createdAt: 1,
                    comment: { $ifNull: ["$comments.comment", ""] },
                    user: {
                        industryType: "$users.industryType",
                        myConnection: "$users.myConnection",
                        experience: "$users.experience",
                        about: "$users.about",
                        name: { $ifNull: ["$users.firstName", ""] },
                        profilePicUrl: "$users.profilePicUrl",
                        profession: { $ifNull: ["$users.profession", ""] }
                    },
                    isLike: {
                        $cond: { if: { "$eq": [{ $size: "$likeData" }, 0] }, then: false, else: true }
                    },
                    isComment: {
                        $cond: { if: { "$eq": [{ $size: "$commentData" }, 0] }, then: false, else: true }
                    }
                }
            })
            const myForumData = await this.paginate('forum', aggPipe, 10, 1, {}, true)
            return myForumData;
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
    async updateForumLikeAndCommentCount(query, update) {
        try {
            return await this.updateOne('forum', query, update, {});
        } catch (error) {
            throw error;
        }
    }
}

export const forumtopicDao = new ForumTopic();