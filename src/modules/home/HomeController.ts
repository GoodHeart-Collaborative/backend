"use strict";

import * as _ from "lodash";
import fs = require("fs");

import * as homeConstants from "./HomeConstant";
import { gratitudeJournalDao } from "@modules/gratitudeJournal/GratitudeJournalDao";
import { userDao } from "@modules/user/v1/UserDao";
import { homeDao } from "./HomeDao";
import * as config from "@config/index";


class HomeController {

    /**
     * @function Home
     * @description if IS_REDIS_ENABLE set to true,
     * than redisClient.storeList() function saves value in redis.
     */
    async getHomeData(params, userId) {
        try {
            let responseData: any = {}
            let getGeneralGratitude: any = {}
            let getmemberOfTheDay: any = {}
            // let flag:boolean = true
            params.pageNo = 1
            params.limit = 10
            if (!params.type) {
                getmemberOfTheDay = await userDao.getMemberOfDays(userId.tokenData)

                responseData = await homeDao.getHomeData(params, userId.tokenData)
                // params.limit = 5
                // if(responseData && responseData.list && responseData.list.length > 0) {
                //     params["startDate"] = responseData.list[0].createdAt
                //     params["endDate"] = responseData.list[responseData.list.length-1].createdAt
                // }
                params.limit = 5
                getGeneralGratitude = await gratitudeJournalDao.getGratitudeJournalHomeData(params, userId.tokenData)

                if (getGeneralGratitude && getGeneralGratitude.list && getGeneralGratitude.list.length > 0) {
                    console.log('responseDataresponseDataresponseData', responseData);

                    responseData.unshift(getGeneralGratitude)
                    responseData.unshift(getmemberOfTheDay)

                    // responseData["getGratitudeJournal"] = getGeneralGratitude
                    //     if(responseData && responseData.list && responseData.list.length > 9) {
                    //         responseData.list.pop()
                    //         if(responseData.next_hit === 0) {
                    //             responseData.next_hit=1 
                    //         }
                    //     }
                    //     responseData.list.push(getGeneralGratitude)
                } else {
                    responseData.unshift(getmemberOfTheDay)
                }
                responseData["getmemberOfTheDay"] = getmemberOfTheDay

            } else {
                if (params.type === config.CONSTANT.HOME_TYPE.GENERAL_GRATITUDE) {
                    responseData = await gratitudeJournalDao.getGratitudeJournalHomeData(params, userId.tokenData)
                } else {
                    responseData = await homeDao.getHomeData(params, userId.tokenData)
                }
            }
            return homeConstants.MESSAGES.SUCCESS.HOME_DATA(responseData)
        } catch (error) {
            throw error;
        }
    }
}
export const homeController = new HomeController();