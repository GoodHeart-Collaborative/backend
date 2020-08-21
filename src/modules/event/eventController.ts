"use strict";


import * as _ from "lodash";

import * as config from "@config/index";
import * as eventConstant from "@modules/admin/event/eventConstant";
import { eventDao } from "@modules/event/eventDao";
import { eventInterestDao } from '@modules/eventInterest/eventInterestDao'
import * as appUtils from "@utils/appUtils";
import * as XLSX from 'xlsx'
import * as moment from 'moment';
import { Config } from "aws-sdk";
import { unwatchFile } from "fs";

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
	 * @function add event
	 * @description user add event
	 */
    async addEvent(params: UserEventRequest.AddEvent) {
        try {
            const result = this.getTypeAndDisplayName(config.CONSTANT.EVENT_CATEGORY, params['eventCategoryId'])
            console.log('data1data1data1data1data1', result);
            params.eventCategoryType = result['TYPE'];
            params.eventCategoryDisplayName = result['DISPLAY_NAME'];
            params.created = new Date().getTime();

            const data = await eventDao.insert("event", params, {});
            return eventConstant.MESSAGES.SUCCESS.SUCCESSFULLY_ADDED(data);

        } catch (error) {
            throw error;
        }
    }

    async calenderEvent(params: UserEventRequest.userGetEvent, tokenData) {
        try {
            console.log('tokenData', tokenData.userId);

            const { page, limit } = params;
            let aggPipe = [];
            let match: any = {};

            match['userId'] = appUtils.toObjectId(tokenData.userId);

            if (params.type == 'going') {
                match['type'] = config.CONSTANT.EVENT_INTEREST.GOING;
                aggPipe.push({
                    $lookup: {
                        from: 'events',
                        let: { eId: '$eventId' },
                        pipeline: [{
                            $match: {
                                $expr: {
                                    $and: [{
                                        $eq: ['$_id', '$$eId']
                                    }]
                                }
                            }
                        }],
                        as: 'eventData'
                    }
                })
                aggPipe.push({ '$unwind': { path: '$eventData', preserveNullAndEmptyArrays: true } });
            }

            aggPipe.push({ $match: match })
            aggPipe.push({
                $project: {
                    status: 0,
                    createdAt: 0,
                    updatedAt: 0
                }
            })
            aggPipe.push({ $sort: { startDate: -1 } });

            let data;
            if (params.type == 'going') {
                data = await eventInterestDao.aggreagtionWithPaginateTotal('event_interest', aggPipe, limit, page, true)
                console.log('datadatadatadata', data);
            } else {
                data = await eventInterestDao.aggreagtionWithPaginateTotal('event', aggPipe, limit, page, true)
                console.log('datadatadatadata', data);
            }
            return data;

        } catch (error) {
            return Promise.reject(error);
        }
    }

    async getEvent(params, tokenData) {
        try {
            console.log('JKKKKKKKKKKKKKKKKKKKK', tokenData['userId']);

            const { longitude, latitude, distance, eventCategoryId, date, searchKey } = params;
            let pickupLocation = [];
            let aggPipe = [];
            let featureAggPipe = [];
            let match: any = {}
            let searchDistance = distance ? distance * 1000 : 200 * 1000// Default value is 10 km.

            if (eventCategoryId) {
                match['eventCategory'] = eventCategoryId;
            }
            const start = new Date();
            start.setHours(0, 0, 0, 0);
            const end = new Date();
            end.setHours(23, 59, 59, 999);

            if (date == 'tomorrow') {
                match['startDate'] = ''
            }
            else if (date == 'weekend') {
                match['startDate'] = ''
            } else if (date == 'month') {
                match['startDate'] = ''
            }
            // else {
            //     // for today only 
            //     match['startDate'] = {
            //         // params["postedAt"] = moment(para).format('YYYY-MM-DD')
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
            console.log('moment(new Date()).format', moment(new Date()).format('YYYY-MM-DD'));


            if (longitude != undefined && latitude != undefined) {
                pickupLocation.push(latitude, longitude);
                aggPipe.push(
                    {
                        '$geoNear': {
                            near: { type: "Point", coordinates: pickupLocation },
                            spherical: true,
                            maxDistance: searchDistance,
                            distanceField: "dist",
                        }
                    },
                    { "$sort": { dist: -1 } }
                )
            }
            const unwind = {
                '$unwind': { path: '$interestData', preserveNullAndEmptyArrays: true },

            }
            const projection = {
                "$project": {
                    name: 1,
                    location: 1,
                    title: 1,
                    privacy: 1,
                    startDate: 1,
                    endDate: Date,
                    price: 1,
                    url: 1,
                    allowSharing: 1,
                    description: 1,
                    goingCount: 1,
                    interestCount: 1,
                    eventCategory: 1,
                    created: 1,
                    "isInterest": {
                        $cond: {
                            if: { "$eq": ["$interestData.userId", await appUtils.toObjectId(tokenData.userId)] },
                            then: true,
                            else: false
                        }
                    },
                    users: 1,
                }
            };

            aggPipe.push({ $match: match })
            aggPipe.push({
                $sort: {
                    _id: -1
                },
            },
            )

            console.log('tokenData.userIdtokenData.userId', tokenData.userId);

            featureAggPipe.push(
                {
                    $match: match
                },
                {
                    $sort: {
                        isFeatured: 1,
                    },
                },
                {
                    $limit: 5
                },
                {
                    $lookup: {
                        from: 'event_interests',
                        let: { userId: '$userId', eId: '$_id' },
                        pipeline: [{
                            $match: {
                                $expr: {
                                    $and: [
                                        {
                                            $eq: ['$userId', '$$userId']
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
                })
            featureAggPipe.push(unwind)

            featureAggPipe.push(projection)

            aggPipe.push(unwind),
                aggPipe.push(projection)
            const FeaturedEvent = await eventDao.aggregate('event', featureAggPipe, {})
            const EVENT = await eventDao.aggregate('event', aggPipe, {});            // console.log('datadata', EVENT);
            return {
                FeaturedEvent,
                EVENT
            };
        } catch (error) {
            return Promise.reject(error)
        }
    }

    async getEventDetail(payload, tokenData) {
        try {
            console.log('payloadpayload', payload);

            const match: any = {};
            let aggPipe = [];

            match['_id'] = appUtils.toObjectId(payload.eventId)
            aggPipe.push({ $match: match })
            aggPipe.push({
                $lookup: {
                    from: 'users',
                    let: { uId: '$userId' },
                    pipeline: [{
                        $match: {
                            $expr: {
                                $and: [{
                                    $eq: ['$_id', '$$uId']
                                },
                                {
                                    $eq: ['$status', 'active']
                                }]
                            }
                        }
                    }, {
                        $project: {
                            firstName: 1,
                            lastName: 1,
                            hostedBy: 1
                        }
                    }],
                    as: 'users'
                }
            })
            aggPipe.push({ '$unwind': { path: '$users', preserveNullAndEmptyArrays: true } });


            aggPipe.push({
                $lookup: {
                    from: 'event_interests',
                    let: { eId: appUtils.toObjectId(payload.eventId), uId: appUtils.toObjectId(tokenData.userId) },
                    as: 'interestData',
                    pipeline: [{
                        $match: {
                            $expr: {
                                $and: [{
                                    $eq: ['$eventId', '$$eId']
                                },
                                {
                                    $eq: ['$userId', '$$uId']
                                }]
                            }
                        },
                    },
                        // {
                        //     $group: {
                        //         _id: "$type",
                        //         total: { $sum: 1 },

                        //     }
                        // }
                    ]
                }
            })
            aggPipe.push({
                $addFields: {
                    going: {
                        "$size": {
                            "$filter": {
                                "input": "$interestData",
                                "as": "el",
                                "cond": { "$eq": ["$$el.type", 1] }
                            }

                        }
                    },
                    interest: {
                        "$size": {
                            "$filter": {
                                "input": "$interestData",
                                "as": "el",
                                "cond": { "$eq": ["$$el.type", 2] }
                            }
                        }
                    },
                },
            })
            aggPipe.push({
                $project: {
                    // going: {
                    //     "$size": {
                    //         "$filter": {
                    //             "input": "$interestData",
                    //             "as": "el",
                    //             "cond": { "$eq": ["$$el.type", 1] }
                    //         }
                    //     }
                    // },
                    // interest: {
                    //     "$size": {
                    //         "$filter": {
                    //             "input": "$interestData",
                    //             "as": "el",
                    //             "cond": { "$eq": ["$$el.type", 2] }
                    //         }
                    //     }
                    // },
                    isGoing: {
                        $cond: {
                            if: { "$eq": ["$going", 1] },
                            then: true,
                            else: false
                        }
                    },
                    isInterest: {
                        $cond: {
                            if: { "$eq": ["$interest", 1] },
                            then: true,
                            else: false
                        }
                    },
                    interestCount: 1,
                    goingCount: 1,
                    imageUrl: 1,
                    users: 1,
                    price: 1,
                    endDate: 1,
                    location: 1,
                    allowSharing: 1,
                    description: 1,
                    eventCategory: 1,
                    title: 1,
                    address: 1,
                }
            })

            // aggPipe.push({
            //     $unwind: {
            //         path: '$interestData'
            //     }
            // })
            // aggPipe.push({
            //     $group: {
            //         _id: null,
            //         interestCount: { $first: '$interestCount' },
            //         interestData: { $first: '$interestData' },
            //         // interestData1: { $last: '$interestData' },
            //         // goingCount: { $first: '$goingCount' },
            //         // users: { $first: '$users' },
            //         // title: { $first: '$title' },
            //         // "price": { first: '$price' },
            //         "imageUrl": { $first: '$imageUrl' },
            //         // "eventCategory": { $first: '$eventCategory' },
            //         // "eventUrl": { $first: '$eventUrl' },
            //         // title: { $first : "$title" },
            //         // isPostLater: { $first : "$isPostLater" },
            //         // postedAt: { $first : "$postedAt" },
            //         createdAt: { $first: "$createdAt" }
            //     }
            // })

            const data = await eventDao.aggregate('event', aggPipe, {})
            console.log('datadata', data);
            return data;

        } catch (error) {
            return Promise.reject(error)
        }
    }


    async updateEvent(payload) {
        try {

        } catch (error) {
            return Promise.reject(error);
        }
    }

}
export const eventController = new EventController();