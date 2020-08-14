"use strict";


import * as _ from "lodash";

import * as config from "@config/index";
import * as expertConstant from "@modules/admin/expert/expertConstant";
import { eventDao } from "@modules/event/eventDao";
import { eventInterestDao } from '@modules/eventInterest/eventInterestDao'
import * as appUtils from "@utils/appUtils";
import * as XLSX from 'xlsx'

class EventController {

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
    async addEvent(params) {
        try {
            params["created"] = new Date().getTime()
            const data = await eventDao.insert("event", params, {});
            return expertConstant.MESSAGES.SUCCESS.SUCCESSFULLY_ADDED;

        } catch (error) {
            throw error;
        }
    }

    async getEvent(params: UserEventRequest.userGetEvent) {
        try {
            const { page, limit } = params;
            let aggPipe = [];
            let match: any = {};
            params['userId'] = params['userId']

            if (params.type == 'interest') {
                match['type'] = config.CONSTANT.EVENT_INTEREST.GOING;
            }

            aggPipe.push({ $match: match })

            const data = await eventInterestDao.aggreagtionWithPaginateTotal('event_interest', aggPipe, limit, page, true)
        } catch (error) {
            return Promise.reject(error);
        }
    }
}
export const eventController = new EventController();