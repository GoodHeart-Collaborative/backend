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

    async getEvent(params: UserEventRequest.userGetEvent, tokenData) {
        try {
            console.log('tokenData', tokenData.userId);

            const { page, limit } = params;
            let aggPipe = [];
            let match: any = {};

            match['userId'] = appUtils.toObjectId(tokenData.userId);

            if (params.type == 'going') {
                match['type'] = config.CONSTANT.EVENT_INTEREST.GOING;
                aggPipe.push({
                    $lookup: {
                        from: 'events',
                        let: { eId: '$eventId' },
                        pipeline: [{
                            $match: {
                                $expr: {
                                    $and: [{
                                        $eq: ['$_id', '$$eId']
                                    }]
                                }
                            }
                        }],
                        as: 'eventData'
                    }
                })
                aggPipe.push({ '$unwind': { path: '$eventData', preserveNullAndEmptyArrays: true } });
            }

            aggPipe.push({ $match: match })
            aggPipe.push({ $sort: { startDate: -1 } });
            let data;
            if (params.type == 'going') {
                data = await eventInterestDao.aggreagtionWithPaginateTotal('event_interest', aggPipe, limit, page, true)
                console.log('datadatadatadata', data);
            } else {
                data = await eventInterestDao.aggreagtionWithPaginateTotal('event', aggPipe, limit, page, true)
                console.log('datadatadatadata', data);
            }
            return data;

        } catch (error) {
            return Promise.reject(error);
        }
    }
}
export const eventController = new EventController();