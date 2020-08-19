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
    async updateForum(params: AdminForumRequest.EditForum) {
        try {
            const criteria = {_id: params.postId};
            delete params.postId
            // const dataToUpdate = {...params}
            const data = await eventDao.findOneAndUpdate('forum', criteria, params, { new: true })
            if (!data) {
                return forumConstant.MESSAGES.ERROR.FORUM_NOT_FOUND;
            }
            return forumConstant.MESSAGES.SUCCESS.FORUM_UPDATED(data);
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
            return forumConstant.MESSAGES.SUCCESS.FORUM_ADDED(data);
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

    // async updateStatus(params: AdminExpertRequest.updateStatus) {
    //     try {
    //         const criteria = {
    //             _id: params.expertId
    //         };
    //         const datatoUpdate = {
    //             status: params.status
    //         };
    //         const data = await eventDao.updateOne('expert', criteria, datatoUpdate, {})
    //         return config.CONSTANT.MESSAGES.SUCCESS.SUCCESSFULLY_UPDATED;
    //     } catch (error) {
    //         return Promise.reject(error)
    //     }
    // }
}
export const userForumController = new forumController();