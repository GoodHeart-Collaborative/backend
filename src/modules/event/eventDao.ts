"use strict";

import { BaseDao } from "@modules/base/BaseDao";
import * as config from "@config/index";
import * as appUtils from '@utils/appUtils'
import * as moment from 'moment';
import * as weekend from '@utils/dateManager';
export class EventDao extends BaseDao {

    async getGratitudeJournalData(params) {
        try {
        } catch (error) {
            return Promise.reject(error);
        }
    }

    /**
     * @function getEventList
     * @param params (UserEventRequest.getEventList)
     * @param tokenData 
     * @description eventList on viewAll featured and normal event
     */

    async getEventList(params, tokenData) {
        try {
            const { pageNo, limit, date, searchKey, privacy, distance, eventCategoryId, isFeaturedEvent, getIpfromNtwk } = params;
            console.log('tokenDatatokenData', tokenData.userId);
            let { longitude, latitude, } = params;

            const paginateOptions = {
                limit: limit || 10,
                pageNo: pageNo || 1
            };

            let pickupLocation = [];
            let aggPipe = [];
            let match: any = {}

            let searchDistance = distance ? distance * 1000 : 1000 * 1000// Default value is 100 km.
            match['status'] = config.CONSTANT.STATUS.ACTIVE;
            match['endDate'] = { $gt: new Date().getTime() }

            if (eventCategoryId) {
                match['eventCategory'] = eventCategoryId;
            }

            if (isFeaturedEvent) {
                match['isFeatured'] = true;
            }
            // else {
            //     match['isFeatured'] = false;
            // }

            const start = new Date();
            start.setHours(0, 0, 0, 0);
            const end = new Date();
            end.setHours(23, 59, 59, 999);

            if (date === config.CONSTANT.DATE_FILTER.TOMORROW) {
                const tomorrowStart = moment().add(1, 'days').startOf('day');
                const tomorrowEnd = moment(tomorrowStart).endOf('day');
                match['startDate'] = {
                    $gte: tomorrowStart.toISOString(),
                    $lte: tomorrowEnd.toISOString()
                }
            }
            else if (date == config.CONSTANT.DATE_FILTER.WEEKEND) {
                const dates = await weekend.getWeekendDates()
                match['startDate'] = {
                    $gte: dates.fridayDate,
                    $lte: dates.sundayEndDate
                };
            }
            // else {
            //     match['startDate'] = {
            //         $gte: start,
            //         $lte: end
            //     }
            // }

            if (searchKey) {
                const reg = new RegExp(searchKey, 'ig');
                match["$or"] = [
                    { address: reg },
                    { title: reg },
                ];
            }


            if (longitude == undefined && latitude == undefined) {
                const lat_lng: any = await appUtils.getLocationByIp(getIpfromNtwk);
                console.log('lat_lnglat_lng>>>>>>>>>>>>>>>>>>>>', lat_lng);

                latitude = lat_lng.lat;
                longitude = lat_lng.long;
            }


            if (longitude != undefined && latitude != undefined) {
                pickupLocation.push(longitude, latitude);
                aggPipe.push(
                    {
                        '$geoNear': {
                            near: { type: "Point", coordinates: pickupLocation },
                            spherical: true,
                            maxDistance: searchDistance,
                            distanceField: "dist",
                        }
                    },
                    { "$sort": { endDate: 1 } }
                )
            }
            // else {
            //     aggPipe.push(
            //         {
            //             $sort: {
            //                 _id: -1
            //             },
            //         }
            //     );
            // }
            aggPipe.push({ $match: match })

            const unwind = {
                '$unwind': { path: '$interestData', preserveNullAndEmptyArrays: true },
            }

            const interesetData = {
                $lookup: {
                    from: 'event_interests',
                    let: { userId: '$userId', eId: '$_id' },
                    pipeline: [{
                        $match: {
                            $expr: {
                                $and: [
                                    {
                                        $eq: ['$userId', appUtils.toObjectId(tokenData.userId)]
                                    },
                                    {
                                        $eq: ['$eventId', '$$eId']
                                    },
                                    {
                                        $eq: ['$type', config.CONSTANT.EVENT_INTEREST.INTEREST]
                                    }
                                ]
                            }
                        }
                    }],
                    as: 'interestData',
                }
            }

            const projection = {
                "$project": {
                    name: 1,
                    title: 1,
                    privacy: 1,
                    startDate: 1,
                    endDate: 1,
                    price: 1,
                    url: 1,
                    imageUrl: 1,
                    eventUrl: 1,
                    allowSharing: 1,
                    description: 1,
                    eventCategoryName: 1,
                    address: 1,
                    goingCount: 1,
                    interestCount: 1,
                    eventCategory: 1,
                    created: 1,
                    "isInterest": {
                        $cond: {
                            if: { "$eq": [{ $size: "$interestData" }, 0] }, then: false, else: true
                        }
                    },
                    // "isInterest": {
                    //     $cond: {
                    //         if: { "$eq": ["$interestData.userId", await appUtils.toObjectId(tokenData.userId)] },
                    //         then: true,
                    //         else: false
                    //     }
                    // },
                    shareUrl: {
                        $cond: {
                            if: {
                                $and: [{
                                    $eq: ['$isHostedByMe', true]
                                },
                                ]
                            }, then: '$shareUrl',
                            else: {
                                $cond: {
                                    if: {
                                        $and: [{
                                            $eq: ['$isHostedByMe', false]
                                        }, {
                                            $eq: ['$allowSharing', 1]
                                        }]
                                    },
                                    then: '$shareUrl',
                                    else: ''
                                }
                            }
                        }
                    },
                    isHostedByMe: {
                        $cond: {
                            if: {
                                $eq: ['$userId', appUtils.toObjectId(tokenData.userId)]
                            },
                            then: true,
                            else: false
                        }
                    },
                    users: 1,
                }
            };

            aggPipe.push(interesetData);
            // aggPipe.push(unwind);
            aggPipe.push({
                $addFields: {
                    isHostedByMe: {
                        $cond: {
                            if: {
                                $eq: ['userId', appUtils.toObjectId(tokenData.userId)]
                            },
                            then: true,
                            else: false
                        }
                    }
                }
            });
            aggPipe.push(projection);

            aggPipe = [...aggPipe, ... await this.addSkipLimit(paginateOptions.limit, paginateOptions.pageNo)]
            const event = await eventDao.aggregateWithPagination('event', aggPipe);
            console.log('eventeventeventeventeventevent', event);

            const filterdata: any = {}
            const privacy1 = [];
            privacy1.push(config.CONSTANT.PRIVACY_STATUS.PRIVATE);
            privacy1.push(config.CONSTANT.PRIVACY_STATUS.PUBLIC);

            // const eventType = config.CONSTANT.PRIVACY_STATUS;
            filterdata['privacy'] = privacy1;

            const eventCategory1 = [];
            for (var key in config.CONSTANT.EVENT_CATEGORY) {
                if (config.CONSTANT.EVENT_CATEGORY.hasOwnProperty(key)) {
                    var val = config.CONSTANT.EVENT_CATEGORY[key];
                    console.log(val);
                    eventCategory1.push({ type: val.TYPE, value: val.VALUE })
                }
            }
            filterdata['eventCategory'] = eventCategory1
            // let events = {
            //     ...event,
            //     type: 1
            // }
            // const forFilter = {
            //     filterdata,
            //     type: 2
            // }

            // "total": 8,
            //     "page": 1,
            //         "total_page": 1,
            //             "next_hit": 0,
            //                 "limit": 10

            return paginateOptions.pageNo === 1 ? { event: event.list, total: event.total, page: event.total, total_page: event.total_page, next_hit: event.next_hit, limit: event.limit, filterdata } : event;

        } catch (error) {
            return Promise.reject(error)
        }
    }
}

export const eventDao = new EventDao();