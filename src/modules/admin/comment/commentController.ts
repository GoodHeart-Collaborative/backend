// "use strict";

// import { ServerRoute, Request, ResponseToolkit } from "hapi";
// import * as Joi from "joi";

// import * as appUtils from "@utils/appUtils";
// import * as validator from "@utils/validator";
// import * as config from "@config/index";
// import { responseHandler } from "@utils/ResponseHandler";
// import { likeController } from "@modules/admin/like/likeController";
// import * as commentValidator from './commentValidator';

// export const adminCommentRoute: ServerRoute[] = [
//     {
//         async getCommentList(params) {
//             try {
//                 let { pageNo, limit, userId, commentId, postId } = params
//                 let match: any = {};
//                 let aggPipe = [];
//                 let result: any = {}
//                 match["userId"] = appUtils.toObjectId(userId)
//                 match["postId"] = appUtils.toObjectId(postId)
//                 if (commentId) {
//                     match["commentId"] = appUtils.toObjectId(commentId)
//                     match["category"] = CONSTANT.COMMENT_CATEGORY.COMMENT
//                 } else {
//                     match["category"] = CONSTANT.COMMENT_CATEGORY.POST
//                 }
//                 aggPipe.push({ "$sort": { "createdAt": -1 } });
//                 aggPipe.push({ "$match": match });
//                 aggPipe.push({
//                     $lookup: {
//                         "from": "users",
//                         "localField": "userId",
//                         "foreignField": "_id",
//                         "as": "users"
//                     }
//                 })
//                 aggPipe.push({
//                     $lookup: {
//                         from: "likes",
//                         let: { "post": "$postId", "comment": "$_id", "user": await appUtils.toObjectId(userId) },
//                         pipeline: [
//                             {
//                                 $match: {
//                                     $expr: {
//                                         $and: [
//                                             {
//                                                 $eq: ["$postId", "$$post"]
//                                             },
//                                             {
//                                                 $eq: ["$commentId", "$$comment"]
//                                             },
//                                             {
//                                                 $eq: ["$userId", "$$user"]
//                                             },
//                                             {
//                                                 $eq: ["$category", CONSTANT.COMMENT_CATEGORY.COMMENT]
//                                             }
//                                         ]
//                                     }
//                                 }
//                             }
//                         ],
//                         as: "likeData"
//                     }
//                 })
//                 aggPipe.push({ '$unwind': { path: '$likeData', preserveNullAndEmptyArrays: true } })
//                 aggPipe.push({ '$unwind': { path: '$users', preserveNullAndEmptyArrays: true } },
//                     {
//                         "$project": {
//                             "likeCount": 1,
//                             "commentCount": 1,
//                             "category": 1,
//                             "created": 1,
//                             "isLike": {
//                                 $cond: { if: { "$eq": ["$likeData.userId", await appUtils.toObjectId(userId)] }, then: true, else: false }
//                             },
//                             "comment": 1,
//                             "createdAt": 1,
//                             "users": {
//                                 name: { $ifNull: ["$users.firstName", ""] },
//                                 profilePicture: { $ifNull: ["$users.profilePicture", ""] }
//                             }
//                         }
//                     });

//                 result = await this.aggregateWithPagination("comments", aggPipe, limit, pageNo, true)
//                 return result
//             } catch (error) {
//                 throw error;
//             }
//         }
//     }
// ]