"use strict";

import { BaseDao } from "@modules/base/BaseDao";
import * as config from "@config/index";
import * as appUtils from '@utils/appUtils'

export class GratitudeJournalDao extends BaseDao {

    async getGratitudeJournalData(params, userId) {
        try {
            let {pageNo, limit } = params
            let match: any = {};
            let aggPipe = [];
            let result:any = {}
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
            let { pageNo, limit, postAt, startDate, endDate } = params
            let match: any = {};
            let aggPipe = [];
            let result:any = {}
            match["status"] = config.CONSTANT.STATUS.ACTIVE
            if(postAt) {
                match["postAt"] = postAt                
            }
            if(startDate && endDate) {
                match['createdAt'] = { $gte: endDate, $lte: startDate}
            }
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
            aggPipe.push({ '$unwind': { path: '$user', preserveNullAndEmptyArrays: true } })
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
									},
									{
										$eq: ["$type", config.CONSTANT.HOME_TYPE.GENERAL_GRATITUDE]
									}
                                ]
                            }
                        }

                    }],
                    as: "commentData",
                }
            })
            // aggPipe.push({ '$unwind': { path: '$commentData', preserveNullAndEmptyArrays: true } })

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
                    user : {
                        name: { $ifNull:["$user.firstName", ""]}, 
                        profilePicUrl:  "$user.profilePicUrl"
                    },
                    isComment: {
                        $cond: { if: { "$eq": [{$size: "$commentData"}, 0] }, then: false, else: true }
                    },
                    isLike:{
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

}

export const gratitudeJournalDao = new GratitudeJournalDao();