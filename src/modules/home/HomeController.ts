"use strict";

import * as _ from "lodash";
import fs = require("fs");

import * as homeConstants from "./HomeConstant";
import { gratitudeJournalDao } from "@modules/gratitudeJournal/GratitudeJournalDao";
import { userDao } from "@modules/user/v1/UserDao";
import { adviceDao } from "@modules/admin/dailyAdvice/AdviceDao";
import { inspirationDao } from "@modules/admin/dailyInspiration/inspirationDao";
import { unicornDao } from "@modules/admin/unicornHumour/v1/UnicornDao";
import * as config from "@config/index";
import { homeDao } from "./HomeDao";


class HomeController {

    /**
     * @function signup
     * @description if IS_REDIS_ENABLE set to true,
     * than redisClient.storeList() function saves value in redis.
     */
    async getHomeData(params, userId) {
        try {
            let responseData: any = {}
            let getGeneralGratitude: any = {}
            //     next_hit: 1,
            //     type: 4,
            //     list:[{
            //     "_id": "5f0ff204fd8bfe1c64e69f51",
            //     // "type": 4,
            //     "likeCount": 0,
            //     "commentCount": 0,
            //     "status": "active",
            //     "title": "testststs",
            //     "description": "dajdnjsadas",
            //     "mediaType": 1,
            //     "user": {
            //         profilePicUrl: "https://shorturl.at/ktAQX",
            //         name: "rahul",
            //         desc: "doctor"
            //     },
            //     "mediaUrl": "kjhkjhkjhkjs skkjhsk skhkjhskj",
            //     "postedAt": "2020-07-14T11:33:09.000Z",
            //     "isPostLater": true,
            //     "isLike": false,
            //     "created" : 1594974814280,
            //     "createdAt": "2020-07-10T10:34:43.840Z",
            //     "updatedAt": "2020-07-11T11:34:43.840Z"
            //   },
            //   {
            //     "_id": "5f0ff217fd8bfe1c64e69f56",
            //     // "type": 4,
            //     "likeCount": 0,
            //     "commentCount": 0,
            //     "status": "active",
            //     "title": "testststs",
            //     "description": "dajdnjsadas",
            //     "mediaType": 1,
            //     "isLike": false,
            //     "user": {
            //         profilePicUrl: "https://shorturl.at/ktAQX",
            //         name: "rahul",
            //         desc: "doctor"
            //     },
            //     "mediaUrl": "kjhkjhkjhkjs skkjhsk skhkjhskj",
            //     "postedAt": "2020-07-14T11:33:09.000Z",
            //     "isPostLater": true,
            //     "created" : 1594974814280,
            //     "createdAt": "2020-07-10T10:34:43.840Z",
            //     "updatedAt": "2020-07-11T11:34:43.840Z"
            //     },
            //     {
            //         "_id": "5f0ff217fd8bfe1c64e69f56",
            //         // "type": 4,
            //         "likeCount": 0,
            //         "commentCount": 0,
            //         "status": "active",
            //         "title": "testststs",
            //         "isLike": false,
            //         "description": "dajdnjsadas",
            //         "mediaType": 1,
            //         "user": {
            //             profilePicUrl: "https://shorturl.at/ktAQX",
            //             name: "rahul",
            //             desc: "doctor"
            //         },
            //         "mediaUrl": "kjhkjhkjhkjs skkjhsk skhkjhskj",
            //         "postedAt": "2020-07-14T11:33:09.000Z",
            //         "isPostLater": true,
            //         "created" : 1594974814280,
            //         "createdAt": "2020-07-10T10:34:43.840Z",
            //         "updatedAt": "2020-07-11T11:34:43.840Z"
            //     }]
            // }
            let getmemberOfTheDay: any = await userDao.getMemberOfDays(userId.tokenData)
            // {
            //     "_id": "5f0ff217fd8bfe1c64e69f56",
            //     // "type": 4,
            //     "likeCount": 0,
            //     "commentCount": 0,
            //     "status": "active",
            //     "title": "testststs",
            //     "user": {
            //         profilePicUrl: "https://shorturl.at/ktAQX",
            //         name: "rahul",
            //         desc: "doctor"
            //     },
            //     "isLike": false,
            //     "description": "dajdnjsadas",
            //     "mediaType": 1,
            //     "mediaUrl": "kjhkjhkjhkjs skkjhsk skhkjhskj",
            //     "postedAt": "2020-07-14T11:33:09.000Z",
            //     "isPostLater": true,
            //     "created" : 1594974814280,
            //     "createdAt": "2020-07-10T10:34:43.840Z",
            //     "updatedAt": "2020-07-11T11:34:43.840Z"
            // }
            let getHomeData: any = {}
            params.pageNo = 1
            params.limit = 10
            if (!params.type) {
                getHomeData = await homeDao.getHomeData(params, userId.tokenData)
                responseData = getHomeData
                params.limit = 5
                getGeneralGratitude = await gratitudeJournalDao.getGratitudeJournalHomeData(params, userId.tokenData)
                responseData["getmemberOfTheDay"] = getmemberOfTheDay
                responseData.list.push(getGeneralGratitude)
            } else {
                responseData = getGeneralGratitude
            }
            return homeConstants.MESSAGES.SUCCESS.HOME_DATA(responseData)
        } catch (error) {
            throw error;
        }
    }

    //     async getPostById(params) {
    //         try {
    //             const criteria = {
    //                 _id: params.Id,
    //             };

    //             const data = await adviceDao.findOne('advice', criteria, {}, {})
    //             if (!data) {
    //                 return inspirationConstant.MESSAGES.SUCCESS.SUCCESS_WITH_NO_DATA;
    //             }
    //             console.log('datadatadatadata', data);
    //             return inspirationConstant.MESSAGES.SUCCESS.DEFAULT_WITH_DATA(data);

    //             // return data;
    //         } catch (error) {
    //             throw error;
    //         }
    //     }

    //     async getPosts(params) {
    //         try {
    //             console.log('paramsparamsparamsparams', params);
    //             const { status, sortBy, sortOrder, limit, page, searchTerm } = params;
    //             console.log('statusstatusstatusstatus', status);

    //             const aggPipe = [];

    //             const match: any = {};
    //             // match.adminType = config.CONSTANT.ADMIN_TYPE.SUB_ADMIN;
    //             if (status) {
    //                 match["$and"] = [{ status: status }, { status: { $ne: config.CONSTANT.STATUS.DELETED } }];
    //             } else {
    //                 match.status = { "$ne": config.CONSTANT.STATUS.DELETED };
    //             }
    //             if (searchTerm) {
    //                 match["$or"] = [
    //                     { "title": { "$regex": searchTerm, "$options": "-i" } },
    //                 ];
    //             }
    //             console.log('aggPipeaggPipeaggPipeaggPipe111111111', aggPipe);

    //             aggPipe.push({ "$match": match });

    //             console.log('aggPipeaggPipeaggPipeaggPipe3333333333333333', aggPipe);

    //             // const project = { _id: 1, name: 1, email: 1, created: 1, status: 1 };
    //             // aggPipe.push({ "$project": project });

    //             let sort = {};
    //             if (sortBy && sortOrder) {
    //                 if (sortBy === "name") {
    //                     sort = { "name": sortOrder };
    //                 } else {
    //                     sort = { "created": sortOrder };
    //                 }
    //             } else {
    //                 sort = { "created": -1 };
    //             }
    //             aggPipe.push({ "$sort": sort });

    //             console.log('aggPipeaggPipeaggPipeaggPipe', aggPipe);

    //             const data = await adviceDao.paginate('advice', aggPipe, limit, page, {}, true);
    //             console.log('datadatadata', data);
    //             return data;
    //         } catch (error) {
    //             return Promise.reject(error);
    //         }
    //     }

    //     async updatePost(params) {
    //         try {
    //             const criteria = {
    //                 _id: params.Id
    //             };
    //             const datatoUpdate = {
    //                 ...params
    //             };
    //             const data = await adviceDao.updateOne('advice', criteria, datatoUpdate, {})
    //             console.log('datadatadatadatadata', data);
    //             return data;

    //         } catch (error) {
    //             throw error;
    //         }
    //     }
}
export const homeController = new HomeController();







// 1. totalComment ki jagah commentCount
// 2. _id chaiye 
// 3. title
// 4. description 
// 5. lickeCount,
// 6. commentCount
// 7. userData par 3 keys {desc , name , profilePicUrl} ,
// 8. 


// List