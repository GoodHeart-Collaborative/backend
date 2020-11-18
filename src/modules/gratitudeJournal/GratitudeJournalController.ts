"use strict";

import * as _ from "lodash";
import fs = require("fs");

import * as gratitudeJournalConstants from "./GratitudeJournalConstant";
import { gratitudeJournalDao } from "./GratitudeJournalDao";
import * as moment from 'moment';
import * as appUtils from '@utils/appUtils'
import * as config from '@config/constant';
class GratitudeJournalController {

    /**
     * @function getGratitudeJournalData
     * @description user's gratitude journal 
     */
    async getGratitudeJournalData(params: GratitudeJournalRequest.GetGratitudeJournalRequest, userId) {
        try {
            let getGratitudeJournal: any = await gratitudeJournalDao.getGratitudeJournalData(params, userId.tokenData)
            return gratitudeJournalConstants.MESSAGES.SUCCESS.GRATITUDE_JOURNAL_DATA(getGratitudeJournal)
        } catch (error) {
            throw error;
        }
    }
    async addGratitudeJournalData(params: GratitudeJournalRequest.AddGratitudeJournalRequest) {
        try {
            params["postAt"] = moment(new Date(params.postAt)).format('YYYY-MM-DD')
            let checkGJ = await gratitudeJournalDao.checkGratitudeJournal({ userId: await appUtils.toObjectId(params.userId), postAt: params["postAt"] })
            if (checkGJ) {
                params['status'] = config.CONSTANT.STATUS.ACTIVE;
                if (params.mediaType === config.CONSTANT.MEDIA_TYPE.NONE) {
                    params.mediaUrl = "";
                    params.thumbnailUrl = "";
                }
                await gratitudeJournalDao.updateGratitudeJournal({ _id: checkGJ._id }, params)
                let getResponse = await gratitudeJournalDao.checkGratitudeJournal({ _id: checkGJ._id })
                return gratitudeJournalConstants.MESSAGES.SUCCESS.GRATITUDE_JOURNAL_DATA_UPDATED(getResponse)
            } else {
                let getGratitudeJournal: any = await gratitudeJournalDao.addGratitudeJournal(params)
                return gratitudeJournalConstants.MESSAGES.SUCCESS.GRATITUDE_JOURNAL_DATA_ADDED(getGratitudeJournal)
            }
        } catch (error) {
            throw error;
        }
    }

    async editGratitudeJournalData(params: GratitudeJournalRequest.EditGratitudeJournalRequest, Id) {
        try {
            let checkGJ = await gratitudeJournalDao.checkGratitudeJournal({ _id: await appUtils.toObjectId(Id) })
            if (checkGJ) {
                if (params.postAt) {
                    params["postAt"] = moment(new Date(params.postAt)).format('YYYY-MM-DD')
                    let checkGJ = await gratitudeJournalDao.checkGratitudeJournal({ userId: await appUtils.toObjectId(params.userId), postAt: params["postAt"] })
                    if (checkGJ) {
                        return gratitudeJournalConstants.MESSAGES.ERROR.GRATITUDE_JOURNAL_ALREADY_ADDED(params["postAt"])
                    } else {
                        params["created"] = new Date(params.postAt).getTime()
                    }
                }
                if (params.mediaType === config.CONSTANT.MEDIA_TYPE.NONE) {
                    params.mediaUrl = "";
                    params.thumbnailUrl = "";
                }
                let getGratitudeJournal = await gratitudeJournalDao.updateGratitudeJournal({ _id: checkGJ._id }, params)
                let getResponse = await gratitudeJournalDao.checkGratitudeJournal({ _id: checkGJ._id })
                return gratitudeJournalConstants.MESSAGES.SUCCESS.GRATITUDE_JOURNAL_DATA_UPDATED(getResponse)
            } else {
                return gratitudeJournalConstants.MESSAGES.ERROR.GRATITUDE_JOURNAL_NOT_FOUND
            }
        } catch (error) {
            throw error;
        }
    }
}
export const gratitudeJournalController = new GratitudeJournalController();