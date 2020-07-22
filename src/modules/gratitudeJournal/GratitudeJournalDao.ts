"use strict";

import { BaseDao } from "@modules/base/BaseDao";
import * as config from "@config/index";
import * as appUtils from '@utils/appUtils'
import { DataSync } from "aws-sdk";

export class GratitudeJournalDao extends BaseDao {

    async getGratitudeJournalData(params, userId) {
        try {
            let { pageNo, limit } = params
            let match: any = {};
            let aggPipe = [];
            let result: any = {}
            match["status"] = config.CONSTANT.STATUS.ACTIVE
            aggPipe.push({ "$sort": { "createdAt": -1 } });
            // aggPipe.push({
            // 	$lookup: {
            // 		from: "likes",
            // 		let: { "post": "$_id", "user": await appUtils.toObjectId(userId.userId) },
            // 		pipeline: [
            // 			{
            // 				$match: {
            // 					$expr: {
            // 						$and: [
            //                         {
            // 							$eq: ["$postId", "$$post"]
            //                         },
            //                         {
            // 							$eq: ["$userId", "$$user"]
            //                         }, 
            //                         {
            // 							$eq: ["$category", config.CONSTANT.COMMENT_CATEGORY.POST]
            //                         }
            //                     ]
            // 					}
            // 				}
            // 			}
            // 		],
            // 	 	as: "likeData"
            // 	}
            // })
            // aggPipe.push({ '$unwind': { path: '$likeData', preserveNullAndEmptyArrays: true } })

            // aggPipe.push({
            //     $project:
            //       {
            //         _id: 1,
            //         likeCount: 1,
            //         commentCount: 1,
            //         status: 1,
            //         type: 1,
            //         mediaType: 1,
            //         thumbnailUrl: 1,
            //         title: 1,
            //         isPostLater: 1,
            //         description: 1,
            //         created: 1,
            //         postedAt: 1,
            //         createdAt: 1,
            //         isLike: 
            //           {
            //             $cond: { if: { "$eq": ["$likeData.userId", await appUtils.toObjectId(userId.userId)] }, then: true, else: false }
            //           }
            //       }
            //  })
            aggPipe.push({ "$match": match });
            result = await this.aggregateWithPagination("gratitude_journals", aggPipe, limit, pageNo, true)
            return result
        } catch (error) {
            throw error;
        }
    }
    async getGratitudeJournalHomeData(params, userId) {
        try {
            let { pageNo, limit } = params
            let match: any = {};
            let aggPipe = [];
            let result: any = {}
            match["status"] = config.CONSTANT.STATUS.ACTIVE
            match["privacy"] = config.CONSTANT.PRIVACY_STATUS.PUBLIC
            aggPipe.push({ "$sort": { "createdAt": -1 } });
            aggPipe.push({ "$match": match });
            aggPipe.push({
                $lookup: {
                    "from": "users",
                    "localField": "userId",
                    "foreignField": "_id",
                    "as": "user"
                }
            })
            // {
            //     "_id": "5f0ff204fd8bfe1c64e69f51",
            //     // "type": 4,
            //     "likeCount": 0,
            //     "commentCount": 0,
            //     "status": "active",
            //     "title": "testststs",
            //     "description": "dajdnjsadas",
            //     "mediaType": 1,
            //     "user": {
            //         profilePicUrl: "https://shorturl.at/ktAQX",
            //         name: "rahul",
            //         desc: "doctor"
            //     },
            //     "mediaUrl": "kjhkjhkjhkjs skkjhsk skhkjhskj",
            //     "postedAt": "2020-07-14T11:33:09.000Z",
            //     "isPostLater": true,
            //     "isLike": false,
            //     "created" : 1594974814280,
            //     "createdAt": "2020-07-10T10:34:43.840Z",
            //     "updatedAt": "2020-07-11T11:34:43.840Z"
            //   }
            aggPipe.push({ '$unwind': { path: '$user', preserveNullAndEmptyArrays: true } })
            // { "$project": { 
            // 	"createdAt": 1, 
            // 	"category": 1, 
            // 	"users" : {
            // 		name: { $ifNull:["$users.firstName", ""]}, 
            // 		profilePicture:  { $ifNull: [ "$users.profilePicture", "" ] }
            // 	}
            // } });
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
                                        },
                                        {
                                            $eq: ["$type", config.CONSTANT.HOME_TYPE.GENERAL_GRATITUDE]
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
                $project:
                {
                    _id: 1,
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
                    user: {
                        name: { $ifNull: ["$user.firstName", ""] },
                        profilePicUrl: "$user.profilePicUrl"//{ $ifNull: [ "$user.profilePicture", "" ] }
                    },
                    isLike:
                    {
                        $cond: { if: { "$eq": ["$likeData.userId", await appUtils.toObjectId(userId.userId)] }, then: true, else: false }
                    }
                }
            })
            result = await this.aggregateWithPagination("gratitude_journals", aggPipe, limit, pageNo, true)
            result["type"] = config.CONSTANT.HOME_TYPE.GENERAL_GRATITUDE
            return result
        } catch (error) {
            throw error;
        }
    }
    async checkGratitudeJournal(params) {
        try {
            return await this.findOne('gratitude_journals', params, {}, {});
        } catch (error) {
            throw error;
        }
    }
    async updateGratitudeJournal(query, update) {
        try {
            return await this.update('gratitude_journals', query, update, {});
        } catch (error) {
            throw error;
        }
    }
    async addGratitudeJournal(payload) {
        try {
            return await this.save('gratitude_journals', payload);
        } catch (error) {
            throw error;
        }
    }
    async updateLikeAndCommentCount(query, update) {
        try {
            return await this.updateOne('gratitude_journals', query, update, {});
        } catch (error) {
            throw error;
        }
    }

    async userProfileHome(params) {
        try {
            let match: any = {};
            let aggPipe = [];
            let result: any = {}
            match['userId'] = appUtils.toObjectId(params['userId']);
            match['status'] = config.CONSTANT.STATUS.ACTIVE;

            // aggPipe.push(match);
            // aggPipe.push({ "$sort": { "createdAt": -1 } });
            aggPipe.push({ "$match": match });

            aggPipe.push({
                $lookup: {
                    from: 'likes',
                    let: { "pId": "$_id", "uId": await appUtils.toObjectId(params.userId) },
                    pipeline: [{
                        $match: {
                            $expr: {
                                $and: [
                                    {
                                        $eq: ['$postId', '$$pId']
                                    },
                                    {
                                        $eq: ["$userId", "$$uId"]
                                    }]
                            }
                        }
                    }],
                    as: 'likeData'
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
                    isLike: {
                        $cond: {
                            if: {
                                $eq: ["$likeData.userId", appUtils.toObjectId(params.userId)],
                                then: true, else: false
                            }
                        }
                    }
                }
            })
            console.log('aggPipeaggPipeaggPipe', aggPipe);


            const myGratitude = await this.paginate('gratitude_journals', aggPipe, 10, 1, {}, true)
            console.log('datadatadatadatadata', myGratitude);
            return myGratitude;

        } catch (error) {
            return Promise.reject(error);
        }
    }
}

export const gratitudeJournalDao = new GratitudeJournalDao();