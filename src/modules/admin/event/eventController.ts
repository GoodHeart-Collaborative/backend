"use strict";


import * as _ from "lodash";

import * as config from "@config/index";
import * as eventConstant from "@modules/admin/event/eventConstant";
import { eventDao } from "@modules/event/eventDao";
import * as appUtils from "@utils/appUtils";
import { categoryDao } from "../catgeory";
import { eventInterestDao } from "@modules/eventInterest/eventInterestDao";

class EventController {

    getTypeAndDisplayName(findObj, num: number) {
        const obj = findObj;
        const data = Object.values(obj);
        const result = data.filter((x: any) => {
            return x.VALUE === num;
        });
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
            // const result = this.getTypeAndDisplayName(config.CONSTANT.EVENT_CATEGORY, params['eventCategoryId']);            params.eventCategoryName = categoryData['title'];
            params.created = new Date().getTime();
            params['eventCategoryImage'] = categoryData['imageUrl'];

            const data = await eventDao.insert("event", params, {});

            const eventUrl = `${config.SERVER.APP_URL}${config.SERVER.API_BASE_URL}/v1/common/deepLink-share?ios=${config.CONSTANT.DEEPLINK.IOS_SCHEME}?eventId=${data._id}` +
                `&type=event&android=${config.CONSTANT.DEEPLINK.IOS_SCHEME}&eventId=${data._id}`;

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
            const { limit, page, sortOrder, sortBy, fromDate, toDate, searchTerm, userId, status, isExpired } = params;
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
                const reg = new RegExp(searchTerm, 'ig');
                match["$or"] = [
                    { "title": reg },
                    { "description": reg },
                    { "address": reg }
                ];
            }
            // if (categoryId) {
            //     match.userId = appUtils.toObjectId(params.categoryId);
            // }
            aggPipe.push({ "$sort": sort });

            if (fromDate && toDate) { match['createdAt'] = { $gte: fromDate, $lte: toDate }; }
            if (fromDate && !toDate) { match['createdAt'] = { $gte: fromDate }; }
            if (!fromDate && toDate) { match['createdAt'] = { $lte: toDate }; }

            if (isExpired == true) {
                match['endDate'] = { $lte: new Date().getTime() }
            }
            else if (isExpired == false || status === config.CONSTANT.STATUS.ACTIVE) {
                match['endDate'] = { $gt: new Date().getTime() }
            }

            aggPipe.push({ $match: match })

            aggPipe.push({
                $addFields: {
                    isExpired: {
                        $cond: {
                            if: {
                                $gte: ['$endDate', new Date().getTime()]
                            }, then: false,
                            else: true
                        },
                    }
                }
            })
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
                _id: appUtils.toObjectId(params.eventId)
            }
            const aggPipe = [];
            aggPipe.push({
                $match: criteria
            })
            aggPipe.push({
                $lookup: {
                    from: 'users',
                    let: { uId: '$userId' },
                    as: 'hostUser',
                    pipeline: [{
                        $match: {
                            $expr: {
                                $eq: ['$_id', '$$uId']
                            }
                        }
                    }]
                },
            })

            aggPipe.push({
                $addFields: {
                    isExpired: {
                        $cond: {
                            if: {
                                $gte: ['$endDate', new Date().getTime()]
                            }, then: false,
                            else: true
                        },
                    }
                }
            })
            // aggPipe.push({ '$unwind': { path: '$hostUser', preserveNullAndEmptyArrays: true } });
            aggPipe.push({
                $project: {
                    hostUser: 1,
                    isFeatured: 1,
                    price: 1,
                    status: 1,
                    goingCount: 1,
                    interestCount: 1,
                    address: 1,
                    allowSharing: 1,
                    description: 1,
                    endDate: 1,
                    eventUrl: 1,
                    imageUrl: 1,
                    startDate: 1,
                    title: 1,
                    userType: 1,
                    eventCategoryName: 1,
                    created: 1,
                    createdAt: 1,
                    shareUrl: 1,
                    isEventFree: 1,
                    isExpired: 1
                }
            })
            const data = await eventDao.aggregate('event', aggPipe, {});
            return data[0] ? data[0] : {}
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
            params['eventCategoryImage'] = result['imageUrl'];

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

}
export const eventController = new EventController();