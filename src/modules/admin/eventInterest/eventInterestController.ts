"use strict";


import * as _ from "lodash";

import * as config from "@config/index";
import * as eventConstant from "@modules/admin/event/eventConstant";
import * as appUtils from "@utils/appUtils";
import * as XLSX from 'xlsx'
import { adminEventInterestDao } from './eventInterestDao'

class EventInterestController {

    async getInterests(params: AdminEventInterest.GetInterest) {
        try {
            const { limit, page, type, eventId } = params;
            let aggPipe = [];
            const match: any = {};
            let sort = {};
            match.eventId = appUtils.toObjectId(eventId);

            match.type = type;

            aggPipe.push({ $match: match })

            sort = { "created": -1 };

            aggPipe.push({ "$sort": sort });

            aggPipe.push({
                $lookup: {
                    from: 'users',
                    let: { 'uId': '$userId' },
                    pipeline: [{
                        $match: {
                            $expr: {
                                "$eq": ['$_id', '$$uId'],
                            }
                        }
                    }],
                    "as": "userData"
                }
            })
            const data = await adminEventInterestDao.aggreagtionWithPaginateTotal('event_interest', aggPipe, limit, page, true)
            return data;

        } catch (error) {
            return Promise.reject(error);
        }

    }


}
export const eventInterestController = new EventInterestController();