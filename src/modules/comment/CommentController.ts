"use strict";

import * as _ from "lodash";
import fs = require("fs");

import * as commentConstants from "./CommentConstant";
import { commentDao } from "./CommentDao";
import * as config from "@config/index";
import { CONSTANT } from "@config/index";
import * as appUtils from '../../utils/appUtils'


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
            query = { _id: await appUtils.toObjectId(params.postId) }
            if (params.type === CONSTANT.COMMENT_TYPE.DAILY_ADVICE) {
                getPost = await commentDao.checkPost(query, "advice")
            } else if (params.type === CONSTANT.COMMENT_TYPE.UNICORN) {
                getPost = await commentDao.checkPost(query, "unicorn")
            } else if (params.type === CONSTANT.COMMENT_TYPE.INSPIRATION) {
                getPost = await commentDao.checkPost(query, "inspiration")
            } else if (params.type === CONSTANT.COMMENT_TYPE.MEMBER_OF_DAY) {
                return commentConstants.MESSAGES.ERROR.FEATURE_NOT_ENABLE;
                // getPost = await commentDao.checkPost(query, '')
            } else if (params.type === CONSTANT.COMMENT_TYPE.GENERAL_GRATITUDE) {
                // getPost = await commentDao.checkPost(query, '')
                return commentConstants.MESSAGES.ERROR.FEATURE_NOT_ENABLE;
            }
            if (getPost) {
                if (getPost.status === config.CONSTANT.STATUS.DELETED) {
                    return commentConstants.MESSAGES.ERROR.POST_DELETED;
                } else if (getPost.status === config.CONSTANT.STATUS.BLOCKED) {
                    return commentConstants.MESSAGES.ERROR.POST_BLOCK;
                }
            } else {
                return commentConstants.MESSAGES.ERROR.POST_NOT_FOUND;
            }
            if (params && params.commentId) {
                query = { _id: await appUtils.toObjectId(params.commentId) }
                getComment = await commentDao.checkComment(query)
                if (!getComment) {
                    return commentConstants.MESSAGES.ERROR.COMMENT_NOT_FOUND;
                }
            }
            let data = await commentDao.addComments(params)
            return config.CONSTANT.MESSAGES.SUCCESS.SUCCESSFULLY_ADDED;
        } catch (error) {
            throw error;
        }
    }
}
export const commentController = new CommentController();