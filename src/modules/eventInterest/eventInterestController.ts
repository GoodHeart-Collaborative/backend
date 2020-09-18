
"use strict";


import * as _ from "lodash";

import * as config from "@config/index";
import { eventInterestDao } from "@modules/eventInterest/eventInterestDao";
import * as appUtils from "@utils/appUtils";
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
                eventId: appUtils.toObjectId(eventId),
                userId: appUtils.toObjectId(userId)
            }

            const checkExist = await eventInterestDao.findOne('event_interest', criteria, {}, {})
            console.log('checkExistcheckExist', checkExist);

            if (checkExist) {
                incOrDec = -1
                await eventInterestDao.remove('event_interest', criteria);
            }

            if (!checkExist) {
                criteria["created"] = new Date().getTime();
                await eventInterestDao.insert('event_interest', criteria, {})
                // const userEvent = await eventInterestDao.find('event_interest', { eventId: params.eventId, userId: params.userId }, {}, {}, {}, {}, {});
            }
            const userEvent = await eventInterestDao.find('event_interest', { eventId: params.eventId, userId: params.userId }, {}, {}, {}, {}, {});

            if (type == config.CONSTANT.EVENT_INTEREST.GOING) {
                data = await eventDao.findByIdAndUpdate('event', { _id: eventId }, { $inc: { goingCount: incOrDec } }, { new: true, lean: true })
            }
            if (type == config.CONSTANT.EVENT_INTEREST.INTEREST) {
                data = await eventDao.findByIdAndUpdate('event', { _id: eventId }, { $inc: { interestCount: incOrDec } }, { new: true, lean: true })
            }

            console.log('userEventuserEvent', userEvent);

            data['isGoing'] = false;
            data['isInterest'] = true;
            if (userEvent.legth > 0) {
                userEvent.map(data1 => {
                    if (data1.type = 1) {
                        data['isGoing'] = true;
                    }
                    if (data1.type = 2) {
                        data['isInterest'] = true;
                    }
                })
            }

            return data;
            // INTEREST: 2
            // if (!checkExist && params.type === 2) {
            //     data['isInterest'] = true;
            // }
            // if (checkExist && params.type === 2) {
            //     data['isInterest'] = false;
            // }
            // if (!checkExist && params.type === 1) {
            //     data['isGoing'] = true;
            // }
            // if (checkExist && params.type === 1) {
            //     data['isGoing'] = false;
            // }
            // if (data.type === 1) {
            //     data['isGoing'] = true;
            // } else if (data.type === 2) {
            //     data['isIntereset'] = true;
            // } else if (data.type === 1 && data.type === 2) {
            //     data['isIntereset'] = true;
            //     data['false'] = true;
            // }




            return data;
        } catch (error) {
            return Promise.reject(error);
        }
    }

}
export const interestController = new InterestController();


