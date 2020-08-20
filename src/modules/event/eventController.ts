"use strict";


import * as _ from "lodash";

import * as config from "@config/index";
import * as expertConstant from "@modules/admin/expert/expertConstant";
import { eventDao } from "@modules/event/eventDao";
import { eventInterestDao } from '@modules/eventInterest/eventInterestDao'
import * as appUtils from "@utils/appUtils";
import * as XLSX from 'xlsx'

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
    async addEvent(params) {
        try {
            params["created"] = new Date().getTime()
            const data = await eventDao.insert("event", params, {});
            return expertConstant.MESSAGES.SUCCESS.SUCCESSFULLY_ADDED;

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

            const { longitude, latitude, distance, eventCategory, date } = params;
            let pickupLocation = [];
            let aggPipe = [];
            let featureAggPipe = [];
            let match: any = {}
            let searchDistance = distance ? distance * 1000 : 200 * 1000// Default value is 10 km.

            if (eventCategory) {
                match['eventCategory'] = eventCategory;
            }
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
            //         $gt: new Date()
            //     }
            // }
            console.log('matchmatchmatch', match);
            aggPipe.push({
                $sort: {
                    _id: -1
                }
            })

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

            featureAggPipe.push(
                {
                    $sort: {
                        _id: -1
                    }
                },
                {
                    $lookup: {
                        from: 'event_interests',
                        let: { userId: '$userId' },
                        pipeline: [{
                            $match: {
                                $expr: {
                                    $eq: ['$userId', '$$userId']
                                }
                            }
                        }],
                        as: 'interestData',
                    }
                })
            featureAggPipe.push({ '$unwind': { path: '$interestData', preserveNullAndEmptyArrays: true } },
                {
                    $project: {
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
                        interestData: 1,
                        "isInterest": {
                            $cond: {
                                if: { "$eq": ["$interestData.userId", await appUtils.toObjectId(tokenData.userId)] },
                                then: true,
                                else: false
                            }
                        },
                        users: 1,
                        // user: {
                        //     _id: "$users._id",
                        //     name: { $ifNull: ["$users.firstName", ""] },
                        //     profilePicUrl: "$users.profilePicUrl",
                        //     profession: { $ifNull: ["$users.profession", ""] }
                        // },
                        // // commentData:1
                        // isComment: {
                        //     $cond: { if: { "$eq": [{ $size: "$commentData" }, 0] }, then: false, else: true }
                        // },
                    },
                },
                {
                    $limit: 5
                }

            );

            aggPipe.push({
                $lookup: {
                    from: 'event_interests',
                    let: { userId: '$userId' },
                    pipeline: [{
                        $match: {
                            $expr: {
                                $eq: ['$userId', '$$userId']
                            }
                        }
                    }],
                    as: 'interestData',
                }
            })
            aggPipe.push({ '$unwind': { path: '$interestData', preserveNullAndEmptyArrays: true } },
                {
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
                        interestData: 1,
                        "isInterest": {
                            $cond: {
                                if: { "$eq": ["$interestData.userId", await appUtils.toObjectId(tokenData.userId)] },
                                then: true,
                                else: false
                            }
                        },
                        users: 1,
                        // user: {
                        //     _id: "$users._id",
                        //     name: { $ifNull: ["$users.firstName", ""] },
                        //     profilePicUrl: "$users.profilePicUrl",
                        //     profession: { $ifNull: ["$users.profession", ""] }
                        // },
                        // // commentData:1
                        // isComment: {
                        //     $cond: { if: { "$eq": [{ $size: "$commentData" }, 0] }, then: false, else: true }
                        // },
                    },

                },
                {
                    $limit: 5
                });
            console.log('aggPipeaggPipeaggPipe', aggPipe);

            const FeaturedEvent = await eventDao.aggregate('event', featureAggPipe, {})

            const EVENT = await eventDao.aggregate('event', aggPipe, {})
            console.log('datadata', EVENT);
            return {
                FeaturedEvent,
                EVENT
            };
        } catch (error) {
            return Promise.reject(error)
        }
    }

    async getEventDetail(payload) {
        try {

            const match: any = {};
            let aggPipe = [];

            match['_id'] = appUtils.toObjectId(payload.eventId)

            aggPipe.push({
                $lookup: {
                    from: 'users',
                    let: { uId: '$userId' },
                    pipeline: [{
                        $match: {
                            $expr: {
                                $eq: ['$_id', '$$uId']
                            }
                        }
                    }],
                    as: 'userData'
                }
            })
            aggPipe.push({
                $lookup: {
                    from: 'event_interests',
                    let: { eId: appUtils.toObjectId(payload.eventId) },
                    pipeline: [{
                        $match: {
                            $expr: {
                                $eq: ['$eventId', '$$eId']
                            }
                        }
                    }],
                    as: 'interestedData'
                }
            })


            const data = await eventDao.aggregate('event', aggPipe, {})
            console.log('datadata', data);
            return data;

        } catch (error) {
            return Promise.reject(error)
        }
    }

}
export const eventController = new EventController();