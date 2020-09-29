"use strict";

import { BaseDao } from "@modules/base/BaseDao";
import * as config from "@config/index";
export class EventInterest extends BaseDao {

    // async incGoingAndInterestCount(params) {
    //     try {
    //         const addData = [{
    //             "type": 2,
    //             "eventId": ObjectId("5f4d129fc7de770cbc3140c9"),
    //             "userId": ObjectId("5f341976e69d841cdd3e9b0c"),
    //             "created": new Date().getTime(),
    //         },
    //         {
    //             "type": 1,
    //             "eventId": ObjectId("5f4d0c7265d7fd03808b8c71"),
    //             "userId": ObjectId("5f341976e69d841cdd3e9b0c"),
    //             "created": new Date().getTime(),
    //         }]

    //         const addInterstAndGoin = await eventInterestDao.insertMany('event_interest', addData, {});
    //         return;
    //     } catch (error) {
    //         return Promise.reject(error)
    //     }
    // }
}

export const eventInterestDao = new EventInterest();