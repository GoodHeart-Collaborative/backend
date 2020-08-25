"use strict";


import * as _ from "lodash";
import * as forumConstant from "@modules/forum/forumConstant";
import { eventDao } from "@modules/event/eventDao";
import { forumtopicDao } from "./forumDao";

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
            delete params.postId
            // const dataToUpdate = {...params}
            let checkForum = await forumtopicDao.checkForum(criteria)
            if (checkForum) {
                let updateForum = await forumtopicDao.updateForum(criteria, params)
                return forumConstant.MESSAGES.SUCCESS.FORUM_UPDATED(updateForum);
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