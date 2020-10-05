"use strict";

import * as _ from "lodash";
import fs = require("fs");

import * as homeConstants from "./HomeConstant";
import { gratitudeJournalDao } from "@modules/gratitudeJournal/GratitudeJournalDao";
import { userDao } from "@modules/user/v1/UserDao";
import { homeDao } from "./HomeDao";
import * as config from "@config/index";
import { errorReporter } from "@lib/flockErrorReporter";
import { shoutoutDao } from "@modules/shoutout";
import { notificationDao } from "@modules/notification";


class HomeController {

    /**
     * @function getHomeData
     * @description app home screen 1-unicorn, 2-inspiration, 3-daily advice, 4-general gratitude"
     */
    async getHomeData(params: userHomeRequest.Igethome, userId) {
        try {
            let responseData: any = {}
            let getGeneralGratitude: any = {}
            let getmemberOfTheDay: any = {}
            let shoutOutCard: any = {};
            // let flag:boolean = true
            params.pageNo = 1
            params.limit = 10
            if (!params.type) {
                getmemberOfTheDay = await userDao.getMemberOfDays(userId.tokenData)
                responseData = await homeDao.getHomeData(params, userId.tokenData);
                shoutOutCard = await shoutoutDao.getShoutOutForHome(params, userId.tokenData);

                // params.limit = 5
                // if(responseData && responseData.list && responseData.list.length > 0) {
                //     params["startDate"] = responseData.list[0].createdAt
                //     params["endDate"] = responseData.list[responseData.list.length-1].createdAt
                // }
                params.limit = 5
                getGeneralGratitude = await gratitudeJournalDao.getGratitudeJournalHomeData(params, userId.tokenData)



                if (getGeneralGratitude && getGeneralGratitude.list && getGeneralGratitude.list.length > 0) {
                    console.log('responseDataresponseDataresponseData', responseData);

                    responseData.unshift(getGeneralGratitude);
                    if (shoutOutCard) {
                        responseData.unshift(shoutOutCard);
                    }
                    responseData.unshift(getmemberOfTheDay);

                    // responseData["getGratitudeJournal"] = getGeneralGratitude
                    //     if(responseData && responseData.list && responseData.list.length > 9) {
                    //         responseData.list.pop()
                    //         if(responseData.next_hit === 0) {
                    //             responseData.next_hit=1 
                    //         }
                    //     }
                    //     responseData.list.push(getGeneralGratitude)
                } else {
                    if (shoutOutCard) {
                        responseData.unshift(shoutOutCard);
                    }
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

            const reoprtData1 = [];
            for (var key in config.CONSTANT.REPORT_MESSAGE) {
                console.log('keykey', key);

                if (config.CONSTANT.REPORT_MESSAGE.hasOwnProperty(key)) {
                    var val = config.CONSTANT.REPORT_MESSAGE[key];

                    console.log(val);
                    reoprtData1.push({ reason: val.reason, id: val.id })
                }
            }
            const isGratitudeFilled = await gratitudeJournalDao.checkTodaysGratitudeFilled(params, userId.tokenData)
            const notificationCount = await notificationDao.unreadNotificationCount(userId)
            if (!params.type) {
                return {
                    reportData: reoprtData1,
                    homeData: responseData,
                    isGratitudeJournalFilled: isGratitudeFilled,
                    subscriptionData: {
                        isSubscribed: (userId.tokenData.subscriptionType !== config.CONSTANT.USER_SUBSCRIPTION_PLAN.NONE.value) ? true : false,
                        subscriptionType: userId.tokenData.subscriptionType,
                        subscriptionEndDate: userId.tokenData.subscriptionEndDate,
                    },
                    unreadNotificationCount: notificationCount,
                    isEmailVerified: userId.tokenData.isEmailVerified,
                }
            }
            return homeConstants.MESSAGES.SUCCESS.HOME_DATA(responseData)

        } catch (error) {
            errorReporter(error)
            throw error;
        }
    }
}
export const homeController = new HomeController();