"use strict";

import * as _ from "lodash";

import * as gratitudeJournalConstants from "./expertConstant";
import { expertDao } from "./expertDao";

class ExpertController {

    /**
     * @function getExperts
     * @params (UserExpertRequest.getExpert)
     * @description expertlist home screen
     */
    async getExperts(payload: userExpertRequest.IgetExpert) {
        try {
            return await expertDao.getExperts(payload)
        } catch (error) {
            return Promise.reject(error);
        }
    }

    /**
   * @function getCategory
   * @params ( userExpertRequest.IgetCategory)
   * @description get experts-categgory and category for add
   */
    async getcategory(payload: userExpertRequest.IgetCategory) {
        try {
            return await expertDao.getCategory(payload);
        } catch (error) {
            return Promise.reject(error)
        }
    }

    /**
     * @function getcategoryExperts
     * @params (userExpertRequest.ICategoryRelatedExpert )
     * @description categoryRelatedExperts
     */

    async getcategoryExperts(payload: userExpertRequest.ICategoryRelatedExpert) {
        try {
            return await expertDao.getcategoryExperts(payload);
        } catch (error) {
            return Promise.reject(error)
        }
    }

    /**
    * @function expertDetailWithPost
    * @params (userExpertRequest.IgetExpertRelatedPost)
    * @description expertDetail and posts list
    */
    async expertDetailWithPost(payload: userExpertRequest.IgetExpertRelatedPost) {
        try {
            return await expertDao.expertDetailWithPost(payload);
        } catch (error) {
            return Promise.reject(error);
        }
    }

    /**
     * @function postDetail
     * @params (userExpertRequest.IgetExpertRelatedPost)
     * @description expertDetail and posts list
     */
    async postDetail(payload: userExpertRequest.IPostId) {
        try {
            return await expertDao.getPostDetail(payload);
        } catch (error) {
            return Promise.reject(error)
        }
    }

    /**
     * @function expertsListSearch
     * @params (userExpertRequest.expertSearch)
     * @description expertList on tap of view all
     */
    async expertsListSearch(payload: userExpertRequest.expertSearch) {
        try {
            const data = await expertDao.getExpertListBySearch(payload);
            return data;
        } catch (error) {
            return Promise.reject(error)
        }
    }
}
export const expertController = new ExpertController();