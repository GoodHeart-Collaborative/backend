"use strict";

import * as _ from "lodash";
import fs = require("fs");

import * as likeConstants from "./LikeConstant";
import { likeDao } from "./LikeDao";
import * as config from "@config/index";
import { homeDao } from "../home/HomeDao";
import { gratitudeJournalDao } from "../gratitudeJournal/GratitudeJournalDao";
import { userDao } from "../user/UserDao";
import * as appUtils from '../../utils/appUtils'
import * as homeConstants from "../home/HomeConstant";
import { commentDao } from "../comment/CommentDao";
import { expertPostDao } from "@modules/admin/expertPost/expertPostDao";
import { forumtopicDao } from "@modules/forum/forumDao";

class LikeController {
    /**
     * @function addLike
     * @param params 
     */
    async addLike(params: LikeRequest.AddLikeRequest) {
        try {

            let getPost: any = {}
            let query: any = {}
            let data: any = {};
            let getComment: any = {}

            if (params.userId) {
                // if (params['subscriptionEndDate'] < new Date().getTime() || params['subscriptionEndDate'] == "") {
                // if (!params['isSubscribed']) {
                if (params['subscriptionEndDate'] < new Date().getTime() || params['subscriptionEndDate'] == "") {
                    return Promise.reject(likeConstants.MESSAGES.SUCCESS.SUBSCRIPTION_NONE({}));
                }
            }
            delete params['isSubscribed'];
            delete params['subscriptionEndDate'];

            let incOrDec: number = 1
            query = { _id: await appUtils.toObjectId(params.postId) }
            if (params.type === config.CONSTANT.HOME_TYPE.MEMBER_OF_DAY) {
                getPost = await userDao.checkUser(query)
            } else if (params.type === config.CONSTANT.HOME_TYPE.GENERAL_GRATITUDE) {
                getPost = await gratitudeJournalDao.checkGratitudeJournal(query)
            } else if (params.type === config.CONSTANT.HOME_TYPE.EXPERTS_POST) {
                getPost = await expertPostDao.checkExpertPost(query);
            }
            else if (params.type === config.CONSTANT.HOME_TYPE.FORUM_TOPIC) {
                getPost = await forumtopicDao.checkForum(query);
            }
            else {
                getPost = await homeDao.checkHomePost(query)
            }
            if (getPost) {
                if (getPost.status === config.CONSTANT.STATUS.DELETED) {
                    return Promise.reject(homeConstants.MESSAGES.ERROR.POST_DELETED);
                } else if (getPost.status === config.CONSTANT.STATUS.BLOCKED) {
                    return Promise.reject(homeConstants.MESSAGES.ERROR.POST_BLOCK);
                }
            } else {
                return Promise.reject(homeConstants.MESSAGES.ERROR.POST_NOT_FOUND);
            }
            if (params && params.commentId) {
                params["category"] = config.CONSTANT.COMMENT_CATEGORY.COMMENT
            } else {
                params["category"] = config.CONSTANT.COMMENT_CATEGORY.POST

            }
            let getLike = await likeDao.checkLike(params);

            if (getLike) {
                incOrDec = -1
                data = await likeDao.removeLike(params)
            } else {
                data = await likeDao.addLike(params);
            }
            if (params && params.commentId) {
                query = { _id: await appUtils.toObjectId(params.commentId) }
                getComment = await commentDao.checkComment(query);
                if (!getComment) {
                    return homeConstants.MESSAGES.ERROR.COMMENT_NOT_FOUND;
                } else {
                    data = await commentDao.updateComment(query, { $inc: { likeCount: incOrDec } })
                }
            } else {
                if (params.type === config.CONSTANT.HOME_TYPE.MEMBER_OF_DAY) {
                    data = await userDao.updateLikeAndCommentCount(query, { "$inc": { likeCount: incOrDec } })
                } else if (params.type === config.CONSTANT.HOME_TYPE.GENERAL_GRATITUDE) {
                    data = await gratitudeJournalDao.updateLikeAndCommentCount(query, { "$inc": { likeCount: incOrDec } })
                }
                else if (params.type === config.CONSTANT.HOME_TYPE.EXPERTS_POST) {
                    data = await expertPostDao.updateLikeAndCommentCount(query, { "$inc": { likeCount: incOrDec } })
                }
                else if (params.type === config.CONSTANT.HOME_TYPE.FORUM_TOPIC) {
                    data = await forumtopicDao.updateForumLikeAndCommentCount(query, { "$inc": { likeCount: incOrDec } })
                }
                else {
                    data = await homeDao.updateHomePost(query, { "$inc": { likeCount: incOrDec } })
                }
            }
            return {
                postId: params.postId,
                commentId: params.commentId ? params.commentId : ''
            }
        } catch (error) {
            return Promise.reject(error);
        }
    }
    async getLikeList(params: LikeRequest.AddLikeRequest) {
        try {
            let list = await likeDao.getLikeList(params)
            return likeConstants.MESSAGES.SUCCESS.LIKE_LIST(list)
        } catch (error) {
            throw error;
        }
    }
}
export const likeController = new LikeController();