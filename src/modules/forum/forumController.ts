"use strict";


import * as _ from "lodash";

import * as config from "@config/index";
import * as forumConstant from "@modules/forum/forumConstant";
import { eventDao } from "@modules/event/eventDao";
import * as appUtils from "@utils/appUtils";
import * as XLSX from 'xlsx'

class forumController {

    getTypeAndDisplayName(findObj, num: number) {
        const obj = findObj;
        const data = Object.values(obj);
        const result = data.filter((x: any) => {
            return x.VALUE === num;
        });
        console.log('resultresultresult', result);
        return result[0];
    }
	/**
	 * @function add event
	 * @description user add event
	 */
    async addForum(params: AdminForumRequest.AddForum) {
        try {
            params["created"] = new Date().getTime()

            const data = await eventDao.insert("forum_topic", params, {});
            return forumConstant.MESSAGES.SUCCESS.FORUM_ADDED;
        } catch (error) {
            throw error;
        }
    }

    async GetFormPosts(params) {
        try {

        } catch (error) {
            return Promise.reject(error);
        }
    }

    async updateExpert(params: AdminExpertRequest.updateExpert) {
        try {
            const criteria = {
                _id: params.expertId,
            };

            const data = await eventDao.updateOne('expert', criteria, params, {})
            if (!data) {
                // return forumConstant.MESSAGES.SUCCESS.SUCCESS_WITH_NO_DATA;
            }
            // return forumConstant.MESSAGES.SUCCESS.DEFAULT_WITH_DATA(data);
        } catch (error) {
            throw error;
        }
    }

    /**
     * @function updateStatus
     * @description admin update status active ,block ,delete
     */

    async updateStatus(params: AdminExpertRequest.updateStatus) {
        try {
            const criteria = {
                _id: params.expertId
            };
            const datatoUpdate = {
                status: params.status
            };
            const data = await eventDao.updateOne('expert', criteria, datatoUpdate, {})
            return config.CONSTANT.MESSAGES.SUCCESS.SUCCESSFULLY_UPDATED;
        } catch (error) {
            return Promise.reject(error)
        }
    }
}
export const userForumController = new forumController();