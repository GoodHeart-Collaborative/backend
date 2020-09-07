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
    async updateForum(params: UserForumRequest.EditForum, userId) {
        try {
            const criteria = { _id: params.postId, createrId: userId.userId };
            let checkForum = await forumtopicDao.checkForum(criteria)
            if (checkForum) {
                let updateForum = await forumtopicDao.updateForum(criteria, params);
                let param: any = { page: 1, limit: 1, postId: updateForum._id }
                let response = await forumtopicDao.getFormPosts(param);
                response['isCreatedByMe'] = true
                return forumConstant.MESSAGES.SUCCESS.FORUM_UPDATED(response);
            } else {
                return forumConstant.MESSAGES.ERROR.FORUM_NOT_FOUND;
            }
        } catch (error) {
            throw error;
        }
    }
    async addForum(params: UserForumRequest.AddForum) {
        try {
            params["created"] = new Date().getTime()
            let data = await forumtopicDao.saveForum(params)
            let param: any = { page: 1, limit: 1, postId: data._id }
            let response = await forumtopicDao.getFormPosts(param);
            response['isCreatedByMe'] = true
            return forumConstant.MESSAGES.SUCCESS.FORUM_ADDED(response);
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

    async deleteForum(params) {
        try {
            const criteria = { _id: params.postId, createrId: params.userId, userType: config.CONSTANT.ACCOUNT_LEVEL.USER };
            const datatoUpdate = { status: config.CONSTANT.STATUS.DELETED };
            let data = await eventDao.findByIdAndUpdate('forum', criteria, datatoUpdate, { new: true })
            if (data) {
                return forumConstant.MESSAGES.SUCCESS.FORUM_DELETED({ postId: params.postId })
            } else {
                return forumConstant.MESSAGES.ERROR.FORUM_NOT_FOUND
            }
        } catch (error) {
            return Promise.reject(error)
        }
    }
}
export const userForumController = new forumController();