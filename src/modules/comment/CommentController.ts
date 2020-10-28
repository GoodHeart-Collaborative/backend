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
import { forumtopicDao } from "../forum/forumDao";
import { userDao } from "../user/v1/UserDao";
import { expertPostDao } from "@modules/admin/expertPost/expertPostDao";


class CommentController {

    /**
     * @function addComment
     * @description user addComment
     * @params  CommentRequest.AddCommentRequest
     */

    async addComment(params: CommentRequest.AddCommentRequest) {
        try {
            let getPost: any = {}
            let query: any = {}
            let getComment: any = {}
            let data: any = {};

            if (params.userId) {
                // if (params['subscriptionEndDate'] < new Date().getTime() || params['subscriptionEndDate'] == "") {
                if (!params['isSubscribed']) {
                    return Promise.reject(commentConstants.MESSAGES.SUCCESS.SUBSCRIPTION_NONE({}));
                }
            }
            delete params['subscriptionEndDate'];

            query = { _id: await appUtils.toObjectId(params.postId) }
            if (params.type === CONSTANT.HOME_TYPE.MEMBER_OF_DAY) {
                getPost = await userDao.checkUser(query)
            } else if (params.type === CONSTANT.HOME_TYPE.GENERAL_GRATITUDE) {
                getPost = await gratitudeJournalDao.checkGratitudeJournal(query)
            } else if (params.type === CONSTANT.HOME_TYPE.FORUM_TOPIC) {
                getPost = await forumtopicDao.checkForum(query)
            }
            else if (params.type === CONSTANT.HOME_TYPE.EXPERTS_POST) {
                getPost = await expertPostDao.checkExpertPost(query)
            }
            else {
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
                if (params.type === config.CONSTANT.HOME_TYPE.MEMBER_OF_DAY) {
                    data = await userDao.updateLikeAndCommentCount(query, { "$inc": { commentCount: 1 } })
                } else if (params.type === config.CONSTANT.HOME_TYPE.GENERAL_GRATITUDE) {
                    data = await gratitudeJournalDao.updateLikeAndCommentCount(query, { "$inc": { commentCount: 1 } })
                }
                else if (params.type === config.CONSTANT.HOME_TYPE.EXPERTS_POST) {
                    data = await expertPostDao.updateLikeAndCommentCount(query, { "$inc": { commentCount: 1 } })
                }
                else {
                    data = await homeDao.updateHomePost(query, { $inc: { commentCount: 1 } })
                }
            }
            let addCcomment = await commentDao.addComments(params)
            if (params.type === config.CONSTANT.HOME_TYPE.FORUM_TOPIC && !(params && params.commentId)) {
                data = await forumtopicDao.updateForumLikeAndCommentCount(query, { "$inc": { commentCount: 1 }, "$set": { commentId: addCcomment._id } })
            }
            params["_id"] = addCcomment._id
            let getComments: any = await commentDao.getCommentList(params)
            return commentConstants.MESSAGES.SUCCESS.SUCCESSFULLY_ADDED(getComments.list[0]);
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
