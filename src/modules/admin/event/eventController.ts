"use strict";


import * as _ from "lodash";

import * as config from "@config/index";
import * as eventConstant from "@modules/admin/event/eventConstant";
import { eventDao } from "@modules/event/eventDao";
import * as appUtils from "@utils/appUtils";
import * as XLSX from 'xlsx'
import { categoryDao } from "../catgeory";
import { eventInterestDao } from "@modules/eventInterest/eventInterestDao";

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
     * @function addEvent
     * @description admin add event
     * @param { CommentRequest.getComments  } params
     * @author Shubham
     */

    async addEvent(params: AdminEventRequest.IEventAdd) {
        try {
            const categoryData = await categoryDao.findOne('categories', { _id: params.eventCategoryId }, {}, {})
            // const result = this.getTypeAndDisplayName(config.CONSTANT.EVENT_CATEGORY, params['eventCategoryId'])

            // params.eventCategoryType = categoryData['name'];
            params.eventCategoryName = categoryData['title'];
            params.created = new Date().getTime();
            // params['location']['coordinates'] = params['location']['coordinates'].reverse();

            const data = await eventDao.insert("event", params, {});

            // const eventUrl = `${config.CONSTANT.DEEPLINK.IOS_SCHEME}?type=event&eventId=${data._id}`

            // const eventUrl = `${config.CONSTANT.DEEPLINK.IOS_SCHEME}?type=event&eventId=${data._id}`

            const eventUrl = `${config.SERVER.APP_URL}${config.SERVER.API_BASE_URL}/v1/common/deepLink-share?ios=${config.CONSTANT.DEEPLINK.IOS_SCHEME}?eventId=${data._id}` +
                `&type=event&android=${config.CONSTANT.DEEPLINK.IOS_SCHEME}&eventId=${data._id}`;
            console.log('eventUrl1eventUrl1', eventUrl);


            // const eventUrl = `${config.SERVER.APP_URL}${config.SERVER.API_BASE_URL}?ios=${config.CONSTANT.DEEPLINK.IOS_SCHEME}?eventId=${data._id}` +
            //     `&android=${config.CONSTANT.DEEPLINK.ANDROID_SCHEME}` +
            //     `&type=eventhttp://womencomdevapi.appskeeper.com/v1/common/deepLink-share?ios=com.goodheart://?eventId=5f8eaa211ab6800fcdb6989e&type=event&android=com.goodheart://?eventId=5f8eaa211ab6800fcdb6989e&eventId=5f8eaa211ab6800fcdb6989e`;

            // const eventUrl = `${config.SERVER.APP_URL}${config.SERVER.API_BASE_URL}?ios=${config.CONSTANT.DEEPLINK.IOS_SCHEME}?eventId=${data._id}` +
            //     `&android=${config.CONSTANT.DEEPLINK.ANDROID_SCHEME}` +
            //     `&type=event`;

            const updateEvent = await eventDao.findByIdAndUpdate('event', { _id: data._id }, { shareUrl: eventUrl }, {});
            return eventConstant.MESSAGES.SUCCESS.SUCCESSFULLY_ADDED(data);

        } catch (error) {
            throw error;
        }
    }

    /**
   * @function getEvent
   * @description admin add event
   * @param { CommentRequest.getComments  } params
   * @author Shubham
   */

    async getEvent(params: AdminEventRequest.IGetEvent) {
        try {
            const { limit, page, sortOrder, sortBy, fromDate, toDate, searchTerm, userId, status } = params;
            let aggPipe = [];
            const match: any = {};
            let sort = {};
            const paginateOptions = {
                page: page || 1,
                limit: limit || 10,
            };

            if (userId) {
                match.userId = appUtils.toObjectId(params.userId);
            }
            if (status) {
                match["$and"] = [{ status: status }, { status: { $ne: config.CONSTANT.STATUS.DELETED } }];
            } else {
                match.status = { "$ne": config.CONSTANT.STATUS.DELETED };
            }

            if (sortBy && sortOrder) {
                if (sortBy === "title") {
                    sort = { "name": sortOrder };
                }
                else if (sortBy === "startDate") {
                    sort = { "startDate": sortOrder };
                }
                else if (sortBy === "endDate") {
                    sort = { "endDate": sortOrder };
                }
                else {
                    sort = { "_id": sortOrder };
                }
            } else {
                sort = { _id: -1 };
            }
            if (searchTerm) {
                match["$or"] = [
                    { "title": { "$regex": searchTerm, "$options": "-i" } },
                    { "description": { "$regex": searchTerm, "$options": "-i" } },
                ];
            }
            // if (categoryId) {
            //     match.userId = appUtils.toObjectId(params.categoryId);
            // }
            aggPipe.push({ "$sort": sort });

            if (fromDate && toDate) { match['createdAt'] = { $gte: fromDate, $lte: toDate }; }
            if (fromDate && !toDate) { match['createdAt'] = { $gte: fromDate }; }
            if (!fromDate && toDate) { match['createdAt'] = { $lte: toDate }; }


            aggPipe.push({ $match: match })
            // aggPipe.push({ $sort: { _id: -1 } });
            // aggPipe.push({
            //     $lookup: {
            //         from: 'categories',
            //         let: { 'cId': '$categoryId' },
            //         pipeline: [{
            //             $match: {
            //                 $expr: {
            //                     "$eq": ['$_id', '$$cId'],
            //                 }
            //             }
            //         }],
            //         "as": "categoryData"
            //     }
            // })

            // aggPipe.push({ $project: });

            aggPipe = [...aggPipe, ...eventDao.addSkipLimit(paginateOptions.limit, paginateOptions.page)];
            const data = await eventDao.aggreagtionWithPaginateTotal('event', aggPipe, paginateOptions.limit, paginateOptions.page, true)
            return data;

        } catch (error) {
            return Promise.reject(error);
        }
    }

    /**
     * @function updateStatus
     * @description admin update status active ,block ,delete
     */

    async updateStatus(params: AdminEventRequest.IupdateStatus) {
        try {
            const { Id, status } = params;
            const criteria = {
                _id: Id
            };
            const datatoUpdate = {
                status: status
            };
            const data = await eventDao.updateOne('event', criteria, datatoUpdate, {});
            const updateEventInterest = await eventInterestDao.updateMany('event_interest', { eventId: Id }, datatoUpdate, {})

            if (data && status == config.CONSTANT.STATUS.DELETED) {
                return eventConstant.MESSAGES.SUCCESS.SUCCESSFULLY_DELETED;
            }
            else if (data && status == config.CONSTANT.STATUS.BLOCKED) {
                return eventConstant.MESSAGES.SUCCESS.SUCCESSFULLY_BLOCKED;
            }
            return eventConstant.MESSAGES.SUCCESS.SUCCESSFULLY_ACTIVE;
        } catch (error) {
            return Promise.reject(error)
        }
    }

    /**
     * @description admin get event detail
     */
    async getDetails(params: AdminEventRequest.IgetEventDetail) {
        try {
            const criteria = {
                _id: params.eventId
            }
            return await eventDao.findOne('event', criteria, {}, {})
        } catch (error) {
            return Promise.reject(error)
        }
    }

    /**
     * @description admin update event
     * @param (AdminEventRequest.IUpdateEvent)params 
     */

    async updateEvent(params: AdminEventRequest.IUpdateEvent) {
        try {
            const criteria = {
                _id: params.eventId
            }

            const result = await categoryDao.findOne('categories', { _id: params.eventCategoryId }, {}, {})
            // const result = this.getTypeAndDisplayName(config.CONSTANT.EVENT_CATEGORY, params['eventCategoryId'])
            console.log('data1data1data1data1data1', result);
            // params['eventCategoryType'] = result['name'];
            params['eventCategoryName'] = result['title'];
            // params['location']['coordinates'] = params['location']['coordinates'].reverse();

            const dataToUpdate = {
                ...params
            }
            const data = await eventDao.updateOne('event', criteria, dataToUpdate, {})
            return eventConstant.MESSAGES.SUCCESS.SUCCESSFULLY_UPDATE(data);
        } catch (error) {
            return Promise.reject(error)
        }
    }

    // async getCalender(params) {
    //     try {
    //         const { page, limit } = params;
    //         let match: any = {};
    //         let aggPipe = [];
    //         const paginateOptions = {
    //             limit: limit || 10,
    //             page: page || 1
    //         }

    //         match['status'] = config.CONSTANT.STATUS.ACTIVE;
    //         // const findAdmin = await adminDao.findOne('admins', { email: '' }, {}, {})


    //         aggPipe.push({
    //             $match: match
    //         });

    //         aggPipe.push({
    //             $lookup: {
    //                 from: 'users',
    //                 let: { uId: '$userId' },
    //                 as: 'userData',
    //                 pipeline: [{
    //                     $match: {
    //                         $expr: {
    //                             $eq: ['$_id', '$$uId']
    //                         }
    //                     }
    //                 },
    //                 {
    //                     $project: {
    //                         firstName: 1,
    //                         lastName: 1,
    //                         email: 1
    //                     }
    //                 }],
    //             }
    //         });


    //         aggPipe.push({
    //             $unwind: {
    //                 path: '$userData',
    //                 preserveNullAndEmptyArrays: true,
    //             },
    //         })
    //         console.log('aggPipeaggPipe', aggPipe);

    //         // aggPipe.push([...aggPipe, eventDao.addSkipLimit(paginateOptions.limit, paginateOptions.page)]);
    //         const data = await eventDao.aggregateWithPagination('event', aggPipe);
    //         return data;
    //     } catch (error) {
    //         return Promise.reject(error);
    //     }
    // }
}
export const eventController = new EventController();