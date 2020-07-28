"use strict";

import * as _ from "lodash";
import fs = require("fs");

import * as gratitudeJournalConstants from "./expertConstant";
import { expertDao } from "./expertDao";
import * as moment from 'moment';
import * as appUtils from '@utils/appUtils'
import { categoryDao } from "@modules/admin/catgeory";
import { expertPostDao } from "@modules/admin/expertPost/expertPostDao";


class ExpertController {

    /**
     * @function signup
     * @description if IS_REDIS_ENABLE set to true,
     * than redisClient.storeList() function saves value in redis.
     */
    // async getGratitudeJournalData(params) {
    //     try {
    //         let getGratitudeJournal: any = await expertDao.getGratitudeJournalData(params)
    //         return gratitudeJournalConstants.MESSAGES.SUCCESS.GRATITUDE_JOURNAL_DATA(getGratitudeJournal)
    //     } catch (error) {
    //         throw error;
    //     }
    // }

    /**
     * @function getExperts
     * @description first get the category
     * then in get the experts
     */
    async getExperts(payload) {
        try {
            return await expertDao.getExperts(payload)
        } catch (error) {
            return Promise.reject(error);
        }
    }

    async getcategory(payload) {
        try {
            return await expertDao.getCategory(payload);
        } catch (error) {
            return Promise.reject(error)
        }
    }

    async expertDetailWithPost(payload) {
        try {
            return await expertDao.expertDetailWithPost(payload);
        } catch (error) {
            return Promise.reject(error);
        }
    }

    async postDetail(payload) {
        try {
            return await expertDao.getPostDetail(payload);
        } catch (error) {
            return Promise.reject(error)
        }
    }
}
export const expertController = new ExpertController();