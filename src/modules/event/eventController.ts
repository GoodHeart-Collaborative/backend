"use strict";


import * as _ from "lodash";

import * as config from "@config/index";
import * as eventConstant from "@modules/admin/event/eventConstant";
import { eventDao } from "@modules/event/eventDao";
import { eventInterestDao } from '@modules/eventInterest/eventInterestDao'
import * as appUtils from "@utils/appUtils";
import * as XLSX from 'xlsx'
import * as moment from 'moment';
import * as weekend from '@utils/dateManager'
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
            const paginateOptions = {
                limit: limit || 10,
                page: page || 1,
            }

            let noTypeAggPipeandTypeInterest = [];
            let typeAggPipe = [];
            let match: any = {};

            match['userId'] = appUtils.toObjectId(tokenData.userId);
            //&& params.type !== config.CONSTANT.EVENT_INTEREST.MY_EVENT
            // if ((params.type == config.CONSTANT.EVENT_INTEREST.INTEREST || !params.type) && params.type !== config.CONSTANT.EVENT_INTEREST.MY_EVENT) {

            // if (!params.type || params.type === config.CONSTANT.EVENT_INTEREST.INTEREST) {
            //     match['type'] = config.CONSTANT.EVENT_INTEREST.INTEREST;
            // }
            typeAggPipe.push({ $match: match })
            if (!params.type || params.type === config.CONSTANT.EVENT_INTEREST.INTEREST) {
                noTypeAggPipeandTypeInterest.push({
                    $match: {
                        userId: appUtils.toObjectId(tokenData.userId),
                        type: config.CONSTANT.EVENT_INTEREST.INTEREST
                    }
                })
                noTypeAggPipeandTypeInterest.push({
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
                noTypeAggPipeandTypeInterest.push({ '$unwind': { path: '$eventData', preserveNullAndEmptyArrays: true } });
            }

            noTypeAggPipeandTypeInterest.push({
                $replaceRoot: { newRoot: "$eventData" }
            }
            )

            noTypeAggPipeandTypeInterest.push({
                $project: {
                    "_id": 0,
                    "type": 0,
                    "eventId": 0,
                    // "userId": 0,
                    "created": 0,
                    "createdAt": 0,
                    "updatedAt": 0,
                    location: 0
                }
            })
            // aggPipe.push({ $match: match })
            // noTypeAggPipe.push({
            //     $project: {
            //         status: 0,
            //         createdAt: 0,
            //         updatedAt: 0,
            //         location: 0,
            //         eventId: 0,
            //         'eventData.location': 0
            //     }
            // })
            typeAggPipe.push({
                $project: {
                    location: 0,
                    createdAt: 0,
                    updatedAt: 0,
                    // userId: 0
                }
            })
            noTypeAggPipeandTypeInterest.push({ $sort: { startDate: -1 } });
            console.log('aggPipeaggPipeaggPipe', noTypeAggPipeandTypeInterest);

            typeAggPipe = [...typeAggPipe, ...await eventInterestDao.addSkipLimit(paginateOptions.limit, paginateOptions.page)];

            noTypeAggPipeandTypeInterest = [...noTypeAggPipeandTypeInterest, ...await eventInterestDao.addSkipLimit(paginateOptions.limit, paginateOptions.page)];

            let myInterestedEventslist, myHostedEventslist;
            if (params.type == config.CONSTANT.EVENT_INTEREST.INTEREST) {
                myInterestedEventslist = await eventInterestDao.aggregateWithPagination('event_interest', noTypeAggPipeandTypeInterest, paginateOptions.limit, paginateOptions.page, true)
                // console.log('datadatadatadata', myInterestedEventslist);
            }
            else if (params.type == config.CONSTANT.EVENT_INTEREST.MY_EVENT) {
                myHostedEventslist = await eventInterestDao.aggregateWithPagination('event', typeAggPipe, paginateOptions.limit, paginateOptions.page, true)
                // console.log('myHostedEventslist', myHostedEventslist);
            }
            else {
                myInterestedEventslist = await eventInterestDao.aggregateWithPagination('event_interest', noTypeAggPipeandTypeInterest, paginateOptions.limit, paginateOptions.page, true)
                console.log('myInterestedEventslistmyInterestedEventslist', myInterestedEventslist);

                myHostedEventslist = await eventDao.aggregateWithPagination('event', typeAggPipe, paginateOptions.limit, paginateOptions.page, true)
                console.log('datadatadatadata', myHostedEventslist);
            }


            if (params.type === config.CONSTANT.EVENT_INTEREST.MY_EVENT) {
                return myHostedEventslist
            }
            else if (params.type === config.CONSTANT.EVENT_INTEREST.INTEREST) {
                return myInterestedEventslist
            }
            else {
                return {
                    myInterestedEventslist,
                    myHostedEventslist
                }
            }
            // return MyInterestedEventslist;

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

            let searchDistance = distance ? distance * 1000 : 1000 * 1000// Default value is 100 km.

            if (searchKey) {
                const reg = new RegExp(searchKey, 'ig');
                match["$or"] = [
                    { address: reg },
                    { title: reg },
                ];
            }

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
                featureAggPipe.push(
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
            else {
                aggPipe.push(
                    {
                        $sort: {
                            _id: -1
                        },
                    }
                );
                featureAggPipe.push(
                    {
                        $sort: {
                            _id: -1
                        },
                    },
                );
            }
            aggPipe.push({ $match: match }, { $match: { isFeatured: false } }, { $limit: 5 })
            featureAggPipe.push({ $match: match }, { $match: { isFeatured: true } }, { $limit: 5 })

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
                    address: 1,
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

            featureAggPipe.push(interesetData);
            featureAggPipe.push(unwind);
            console.log('featureAggPipefeatureAggPipefeatureAggPipe', featureAggPipe);
            featureAggPipe.push(projection)

            aggPipe.push(interesetData);
            aggPipe.push(unwind);
            aggPipe.push(projection);

            // const getEventCategory = [
            //     {
            //         $match: {
            //             status: config.CONSTANT.STATUS.ACTIVE,
            //         }
            //     },
            //     {
            //         $group: {
            //             _id: '$eventCategoryId',
            //             description: { $first: "$eventCategoryDisplayName" },
            //         }
            //     }
            // ];
            // console.log('getEventCategorygetEventCategory', getEventCategory);
            // const eventCategoryListName = await eventDao.aggregate('event', getEventCategory, {})
            // eventCategoryListName.push({ "_id": 5, 'description': 'ALL' })
            // // eventCategoryListName[0][;

            // console.log('eventCategoryList1eventCategoryList1', eventCategoryListName);

            const featuredEvent = await eventDao.aggregate('event', featureAggPipe, {})
            const event = await eventDao.aggregate('event', aggPipe, {});
            // const time = ['Today', 'Tomorrow', 'Weekend']         // console.log('datadata', EVENT);
            // const TIMES = {
            //     time,
            //     type: 2
            // }
            // const category = {
            //     eventCategoryListName,
            //     type: 0
            // }
            const FEATURED = {
                featuredEvent,
                type: 0
            }
            const EVENTS = {
                event,
                type: 1
            }
            return [
                FEATURED,
                EVENTS,
            ]
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


    async getEventList(params, tokenData) {
        try {
            const data = await eventDao.getEventList(params, tokenData);
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