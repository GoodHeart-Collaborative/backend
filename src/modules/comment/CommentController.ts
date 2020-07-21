"use strict";

import * as _ from "lodash";
import fs = require("fs");

import * as commentConstants from "./CommentConstant";
import * as homeConstants from "../home/HomeConstant";

import { commentDao } from "./CommentDao";
import { homeDao } from "../home/HomeDao";
import * as config from "@config/index";
import { CONSTANT } from "@config/index";
import * as appUtils from '../../utils/appUtils'
import { gratitudeJournalDao } from "../gratitudeJournal/GratitudeJournalDao";
import { userDao } from "../user/v1/UserDao";


class CommentController {

    /**
     * @function signup
     * @description if IS_REDIS_ENABLE set to true,
     * than redisClient.storeList() function saves value in redis.
     */
    // async getHomeData(params, userId) {
    //     try {
    //         let responseData:any = {}
    //         let getDailyUnicorn:any = {}
    //         let getGeneralGratitude:any = {}
    //         let getmemberOfTheGay:any = {}
    //         let getInspiringHistory:any = {}
    //         let getDailyAdvice:any = {}
    //         params.pageNo = 1
    //         if(params.type === config.CONSTANT.HOME_TYPE.UNICRON) {
    //             getDailyUnicorn = await unicornDao.getUnicornHomeData(params, userId.tokendata)
    //             responseData = {getDailyUnicorn}
    //         }
    //         if(params.type === config.CONSTANT.HOME_TYPE.INSPIRATION) {
    //             getInspiringHistory = await inspirationDao.getInspirationHomeData(params, userId.tokendata)
    //             responseData = {getInspiringHistory}
    //         }
    //         if(params.type === config.CONSTANT.HOME_TYPE.GENERAL_GRATITUDE) {
    //             getGeneralGratitude = {}
    //             responseData = {getGeneralGratitude}
    //         }
    //         if(params.type === config.CONSTANT.HOME_TYPE.DAILY_ADVICE) {
    //             getDailyAdvice = await adviceDao.getAdviceHomeData(params, userId.tokendata)
    //             responseData = {getDailyAdvice}
    //         }
    //         if(!params.type) {
    //             getmemberOfTheGay = {}
    //             getDailyUnicorn = await unicornDao.getUnicornHomeData(params, userId.tokendata)
    //             getGeneralGratitude = {}
    //             getInspiringHistory = await inspirationDao.getInspirationHomeData(params, userId.tokendata)
    //             getDailyAdvice = await adviceDao.getAdviceHomeData(params, userId.tokendata)
    //             responseData = {getmemberOfTheGay, getGeneralGratitude, getDailyUnicorn, getInspiringHistory, getDailyAdvice}
    //         }
    //        return homeConstants.MESSAGES.SUCCESS.HOME_DATA(responseData)
    //     } catch (error) {
    //         throw error;
    //     }
    // }

    //     async getPostById(params) {
    //         try {
    //             const criteria = {
    //                 _id: params.Id,
    //             };

    //             const data = await adviceDao.findOne('advice', criteria, {}, {})
    //             if (!data) {
    //                 return inspirationConstant.MESSAGES.SUCCESS.SUCCESS_WITH_NO_DATA;
    //             }
    //             console.log('datadatadatadata', data);
    //             return inspirationConstant.MESSAGES.SUCCESS.DEFAULT_WITH_DATA(data);

    //             // return data;
    //         } catch (error) {
    //             throw error;
    //         }
    //     }

    //     async getPosts(params) {
    //         try {
    //             console.log('paramsparamsparamsparams', params);
    //             const { status, sortBy, sortOrder, limit, page, searchTerm } = params;
    //             console.log('statusstatusstatusstatus', status);

    //             const aggPipe = [];

    //             const match: any = {};
    //             // match.adminType = config.CONSTANT.ADMIN_TYPE.SUB_ADMIN;
    //             if (status) {
    //                 match["$and"] = [{ status: status }, { status: { $ne: config.CONSTANT.STATUS.DELETED } }];
    //             } else {
    //                 match.status = { "$ne": config.CONSTANT.STATUS.DELETED };
    //             }
    //             if (searchTerm) {
    //                 match["$or"] = [
    //                     { "title": { "$regex": searchTerm, "$options": "-i" } },
    //                 ];
    //             }
    //             console.log('aggPipeaggPipeaggPipeaggPipe111111111', aggPipe);

    //             aggPipe.push({ "$match": match });

    //             console.log('aggPipeaggPipeaggPipeaggPipe3333333333333333', aggPipe);

    //             // const project = { _id: 1, name: 1, email: 1, created: 1, status: 1 };
    //             // aggPipe.push({ "$project": project });

    //             let sort = {};
    //             if (sortBy && sortOrder) {
    //                 if (sortBy === "name") {
    //                     sort = { "name": sortOrder };
    //                 } else {
    //                     sort = { "created": sortOrder };
    //                 }
    //             } else {
    //                 sort = { "created": -1 };
    //             }
    //             aggPipe.push({ "$sort": sort });

    //             console.log('aggPipeaggPipeaggPipeaggPipe', aggPipe);

    //             const data = await adviceDao.paginate('advice', aggPipe, limit, page, {}, true);
    //             console.log('datadatadata', data);
    //             return data;
    //         } catch (error) {
    //             return Promise.reject(error);
    //         }
    //     }

    //     async updatePost(params) {
    //         try {
    //             const criteria = {
    //                 _id: params.Id
    //             };
    //             const datatoUpdate = {
    //                 ...params
    //             };
    //             const data = await adviceDao.updateOne('advice', criteria, datatoUpdate, {})
    //             console.log('datadatadatadatadata', data);
    //             return data;

    //         } catch (error) {
    //             throw error;
    //         }
    //     }
    async addComment(params: CommentRequest.AddCommentRequest) {
        try {
            let getPost: any = {}
            let query: any = {}
            let getComment: any = {}
            let data: any = {};
            query = { _id: await appUtils.toObjectId(params.postId) }
            if (params.type === CONSTANT.HOME_TYPE.MEMBER_OF_DAY) {
                getPost = await userDao.checkUser(query)
            } else if (params.type === CONSTANT.HOME_TYPE.GENERAL_GRATITUDE) {
                getPost = await gratitudeJournalDao.checkGratitudeJournal(query)

            } else {
                getPost = await homeDao.checkHomePost(query)
            }
            if (getPost) {
                if (getPost.status === config.CONSTANT.STATUS.DELETED) {
                    return homeConstants.MESSAGES.ERROR.POST_DELETED;
                } else if (getPost.status === config.CONSTANT.STATUS.BLOCKED) {
                    return homeConstants.MESSAGES.ERROR.POST_BLOCK;
                }
            } else {
                return homeConstants.MESSAGES.ERROR.POST_NOT_FOUND;
            }
            if (params && params.commentId) {
                query = { _id: await appUtils.toObjectId(params.commentId) }
                getComment = await commentDao.checkComment(query)
                if (!getComment) {
                    return homeConstants.MESSAGES.ERROR.COMMENT_NOT_FOUND;
                } else {
                    params["category"] = CONSTANT.COMMENT_CATEGORY.COMMENT
                    await commentDao.updateComment(query, { $inc: { commentCount: 1 } })
                }
            } else {
                if(params.type === config.CONSTANT.HOME_TYPE.MEMBER_OF_DAY) {
                    data = await userDao.updateLikeAndCommentCount(query, { "$inc": { commentCount: 1 } })
                } else if(params.type === config.CONSTANT.HOME_TYPE.GENERAL_GRATITUDE) {
                    data = await gratitudeJournalDao.updateLikeAndCommentCount(query, { "$inc": { commentCount: 1 } })
                } else {
                    data = await homeDao.updateHomePost(query, { $inc: { commentCount: 1 } })
                }
            }
            await commentDao.addComments(params)
            return commentConstants.MESSAGES.SUCCESS.SUCCESSFULLY_ADDED(params);
        } catch (error) {
            throw error;
        }
    }
    async getCommentList(params: CommentRequest.AddCommentRequest) {
        try {
            let list = await commentDao.getCommentList(params)
            return commentConstants.MESSAGES.SUCCESS.COMMENT_LIST(list)
        } catch (error) {
            throw error;
        }
    }
}
export const commentController = new CommentController();
