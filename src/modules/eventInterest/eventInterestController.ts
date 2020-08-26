
"use strict";


import * as _ from "lodash";

import * as config from "@config/index";
import * as expertConstant from "@modules/admin/expert/expertConstant";
import { eventInterestDao } from "@modules/eventInterest/eventInterestDao";
import * as appUtils from "@utils/appUtils";
import * as XLSX from 'xlsx'
import { eventDao } from "@modules/event/eventDao";

class InterestController {


	/**
	 * @function add event interests
	 * @description user add interest going / interest in event
	 */
    async addInterests(params: EventInterest.AddInterest) {
        try {
            let { type } = params;
            const { eventId, userId } = params
            let data: any = {};

            let incOrDec: number = 1
            const criteria = {
                type: type,
                eventId: eventId,
                userId: userId
            }

            const checkExist = await eventInterestDao.findOne('event_interest', criteria, {}, {})
            console.log('checkExistcheckExist', checkExist);

            if (!checkExist) {
                criteria["created"] = new Date().getTime();
                await eventInterestDao.insert('event_interest', criteria, {})
            }

            if (checkExist) {
                incOrDec = -1
                data = await eventInterestDao.remove('event_interest', criteria)
            }
            if (type == config.CONSTANT.EVENT_INTEREST.GOING) {
                data = await eventDao.updateOne('event', { _id: eventId }, { $inc: { goingCount: incOrDec } }, {})
            }
            if (type == config.CONSTANT.EVENT_INTEREST.INTEREST) {
                data = await eventDao.updateOne('event', { _id: eventId }, { $inc: { interestCount: incOrDec } }, {})
            }
            return;
        } catch (error) {
            return Promise.reject(error);
        }
    }

}
export const interestController = new InterestController();


