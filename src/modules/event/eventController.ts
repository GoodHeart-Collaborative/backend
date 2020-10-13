"use strict";


import * as _ from "lodash";

import * as config from "@config/index";
import * as eventConstant from "@modules/admin/event/eventConstant";
import { eventDao } from "@modules/event/eventDao";
import { eventInterestDao } from '@modules/eventInterest/eventInterestDao'
import * as appUtils from "@utils/appUtils";
import * as weekend from '@utils/dateManager'
import { categoryDao } from "@modules/admin/catgeory";
import * as tokenManager from '@lib/tokenManager';
import { errorReporter } from "@lib/flockErrorReporter";
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
	 * @description user add event
     * @params (UserEventRequest.AddEvent)
     */
    async addEvent(params: UserEventRequest.AddEvent) {
        try {
            const categoryData = await categoryDao.findOne('categories', { _id: params.eventCategoryId }, {}, {})
            // const result = this.getTypeAndDisplayName(config.CONSTANT.EVENT_CATEGORY, params['eventCategoryId'])
            // params.eventCategoryType = categoryData['name'];
            params.eventCategoryName = categoryData['title'];
            params.created = new Date().getTime();
            params['goingCount'] = 1;
            params['interestCount'] = 1;
            params['location']['coordinates'] = params['location']['coordinates'].reverse();

            const data = await eventDao.insert("event", params, {});

            // location: Joi.object().keys({
            //     type: Joi.string().valid(["Point"]),
            //     coordinates: Joi.array().items(Joi.number())

            console.log('paramsparamsparams', params);

            const updateEventAndGoing = [
                {
                    userId: appUtils.toObjectId(params['userId']),
                    eventId: appUtils.toObjectId(data._id),
                    type: config.CONSTANT.EVENT_INTEREST.GOING,
                    created: Date.now(),
                    createdAt: new Date(),
                    updatedAt: new Date(),

                },
                // {
                //     userId: appUtils.toObjectId(params['userId']),
                //     eventId: appUtils.toObjectId(data._id),
                //     type: config.CONSTANT.EVENT_INTEREST.INTEREST,
                //     created: Date.now(),
                //     createdAt: new Date(),
                //     updatedAt: new Date(),
                // }
            ];

            const updateISGoing = await eventDao.insertMany('event_interest', updateEventAndGoing, {})

            // const eventUrl1 = `${config.CONSTANT.DEEPLINK.IOS_SCHEME}?type=event&eventId=${data._id}`

            // const eventUrl1 = `${config.SERVER.APP_URL}${config.SERVER.API_BASE_URL}?ios=${config.CONSTANT.DEEPLINK.IOS_SCHEME}?eventId=${data._id}` +
            //     `&android=${config.CONSTANT.DEEPLINK.ANDROID_SCHEME}` +
            //     `&type=event`;

            // const eventUrl1 = `${config.SERVER.APP_URL}${config.SERVER.API_BASE_URL}/v1/common/deepLink-share?ios=${config.CONSTANT.DEEPLINK.IOS_SCHEME}?eventId=${data._id}&type=event&android=${config.CONSTANT.DEEPLINK.IOS_SCHEME}?eventId=${data._id}`;
            // console.log('eventUrl1eventUrl1', eventUrl1);

            // const eventUrl1 = `${config.SERVER.APP_URL}?type=event&eventId=5f5903250711f37999791887`

            const eventUrl1 = `${config.CONSTANT.DEEPLINK.IOS_SCHEME}?type=event&eventId=${data._id}`
            // let link = `${ config.SERVER.APP_URL }${ config.SERVER.API_BASE_URL }/user/deeplink ? fallback = ${ config.SERVER.WEB_URL } /layout/forums / post / ${ data._id }& url=epluribus://${config.SERVER.ANDROID_DEEP_LINK}?id=${data._id}&type=post&ios=sharePost://${data._id}`;

            // async forgotPasswordEmailToUser(params) {
            //     const mailContent = await (new TemplateUtil(config.SERVER.TEMPLATE_PATH + "forgot-password.html"))
            //         .compileFile({
            //             "url": `${config.SERVER.APP_URL}${config.SERVER.API_BASE_URL}/v1/common/deepLink?ios=${config.CONSTANT.DEEPLINK.IOS_SCHEME}?token=${params.token}` +
            //                 `&android=${config.CONSTANT.DEEPLINK.ANDROID_SCHEME}?token=${params.token}` +
            //                 `&type=forgot&token=${params.token}&accountLevel=${config.CONSTANT.ACCOUNT_LEVEL.USER}&name=${params.firstName + " " + params.lastName}`,
            //             "name": params.firstName + " " + params.lastName,
            //             "year": new Date().getFullYear(),
            //             "validity": appUtils.timeConversion(10 * 60 * 1000), // 10 mins
            //             "logoUrl": config.SERVER.UPLOAD_IMAGE_DIR + "womenLogo.png",
            //         });
            //     await this.sendMail({ "email": params.email, "subject": config.CONSTANT.EMAIL_TEMPLATE.SUBJECT.FORGOT_PWD_EMAIL, "content": mailContent });
            // }

            const updateEvent = eventDao.findByIdAndUpdate('event', { _id: data._id }, { shareUrl: eventUrl1 }, {});

            return eventConstant.MESSAGES.SUCCESS.SUCCESSFULLY_ADDED(data);

        } catch (error) {
            errorReporter(error);
            throw error;
        }
    }

    /**
     * @function calenderEvent
     * @description calender for the event user hosted and user intereseted in event default respinse is both going and interested
     * @params (UserEventRequest.userGetEvent)
     */
    async calenderEvent(params: UserEventRequest.userGetEvent, tokenData) {
        try {
            const { page, limit } = params;
            const paginateOptions = {
                limit: limit || 10,
                page: page || 1,
            }
            let defaultAndInterestEveent = [];
            let typeAggPipe = [];
            let match: any = {};


            const interesetData = {
                $lookup: {
                    from: 'event_interests',
                    let: { uId: '$userId', eId: '$_id' },
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
                                    // {
                                    //     $eq: ['$type', config.CONSTANT.EVENT_INTEREST.INTEREST]
                                    // }
                                ]
                            }
                        },
                    }],
                    as: 'interestData',
                }
            }

            const projection = {
                "$project": {
                    name: 1,
                    title: 1,
                    location: 1,
                    privacy: 1,
                    startDate: 1,
                    endDate: 1,
                    price: 1,
                    url: 1,
                    imageUrl: 1,
                    userType: 1,
                    eventUrl: 1,
                    allowSharing: 1,
                    isFeatured: 1,
                    description: 1,
                    address: 1,
                    goingCount: 1,
                    interestCount: 1,
                    eventCategory: 1,
                    eventCategoryId: 1,
                    eventCategoryName: 1,
                    created: 1,
                    "isInterest": {
                        $cond: {
                            if: { "$eq": [{ $size: "$interestData" }, 0] }, then: false, else: true
                        }
                    },
                    // interestData: 1,
                    isHostedByMe: 1,
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
                    users: 1,
                }
            };

            // featureAggPipe.push(interesetData);
            // // featureAggPipe.push(unwind);
            // featureAggPipe.push({
            //     $addFields: {
            //         isHostedByMe: {
            //             $cond: {
            //                 if: { $eq: ['$userId', appUtils.toObjectId(tokenData.userId)] },
            //                 then: true,
            //                 else: false
            //             },
            //         },
            //     }
            // });

            match['userId'] = appUtils.toObjectId(tokenData.userId);
            match['status'] = config.CONSTANT.STATUS.ACTIVE;
            //&& params.type !== config.CONSTANT.EVENT_INTEREST.MY_EVENT
            // if ((params.type == config.CONSTANT.EVENT_INTEREST.INTEREST || !params.type) && params.type !== config.CONSTANT.EVENT_INTEREST.MY_EVENT) {

            // if (!params.type || params.type === config.CONSTANT.EVENT_INTEREST.INTEREST) {
            //     match['type'] = config.CONSTANT.EVENT_INTEREST.INTEREST;
            // }
            typeAggPipe.push({ $match: match });

            if (!params.type || params.type === config.CONSTANT.EVENT_INTEREST.INTEREST) {
                defaultAndInterestEveent.push({
                    $match: {
                        status: config.CONSTANT.STATUS.ACTIVE,
                        userId: appUtils.toObjectId(tokenData.userId),
                        type: config.CONSTANT.EVENT_INTEREST.INTEREST
                    }
                });
                // defaultAndInterestEveent.push({
                //     $addFields: {
                //         isHostedByMe: {
                //             $cond: {
                //                 if: { $eq: ['$userId', appUtils.toObjectId(tokenData.userId)] },
                //                 then: true,
                //                 else: false
                //             },
                //         },
                //     }
                // })

                defaultAndInterestEveent.push({
                    $lookup: {
                        from: 'events',
                        let: { eId: '$eventId', uId: appUtils.toObjectId(tokenData.userId) },
                        as: 'eventData',
                        pipeline: [{
                            $match: {
                                $expr: {
                                    $and: [{
                                        $eq: ['$_id', '$$eId']
                                    },
                                    {
                                        $eq: ['$status', config.CONSTANT.STATUS.ACTIVE]
                                    }
                                    ]
                                }
                            }
                        },
                        {
                            $addFields: {
                                isInterest: true,
                                isHostedByMe: {
                                    $cond: {
                                        if: { $eq: ['$userId', appUtils.toObjectId(tokenData.userId)] },
                                        then: true,
                                        else: false
                                    },
                                },
                            }
                        }
                        ],
                    }
                })
                defaultAndInterestEveent.push({ '$unwind': { path: '$eventData', preserveNullAndEmptyArrays: true } });

                defaultAndInterestEveent.push({
                    $replaceRoot: { newRoot: "$eventData" }
                })

                defaultAndInterestEveent.push({
                    $project: {
                        type: 0,
                        eventId: 0,
                        // "userId": 0,
                        created: 0,
                        createdAt: 0,
                        updatedAt: 0,
                        location: 0,
                    }
                })
            }

            typeAggPipe.push({
                $project: {
                    _id: 1,
                    isFeatured: 1,
                    price: 1,
                    goingCount: 1,
                    interestCount: 1,
                    startDate: 1,
                    endDate: 1,
                    allowSharing: 1,
                    imageUrl: 1,
                    address: 1,
                    eventCategoryId: 1,
                    eventCategoryName: 1,
                    description: 1,
                    title: 1,
                    eventUrl: 1,
                    userId: 1,
                    isInterest: '',
                    isHostedByMe: {
                        $cond: {
                            if: { $eq: ['$userId', appUtils.toObjectId(tokenData.userId)] },
                            then: true,
                            else: false
                        },
                    },
                }
            });

            defaultAndInterestEveent.push({ $sort: { endDate: -1 } });
            typeAggPipe.push({ $sort: { endDate: -1 } });

            typeAggPipe = [...typeAggPipe, ...await eventInterestDao.addSkipLimit(paginateOptions.limit, paginateOptions.page)];

            defaultAndInterestEveent = [...defaultAndInterestEveent, ...await eventInterestDao.addSkipLimit(paginateOptions.limit, paginateOptions.page)];

            let myInterestedEventslist, myHostedEventslist;
            if (params.type == config.CONSTANT.EVENT_INTEREST.INTEREST) {
                myInterestedEventslist = await eventInterestDao.aggregateWithPagination('event_interest', defaultAndInterestEveent, paginateOptions.limit, paginateOptions.page, true)
                return { myInterestedEventslist }

            }
            else if (params.type == config.CONSTANT.EVENT_INTEREST.MY_EVENT) {
                myHostedEventslist = await eventInterestDao.aggregateWithPagination('event', typeAggPipe, paginateOptions.limit, paginateOptions.page, true)
                return { myHostedEventslist }
            }
            else {
                myInterestedEventslist = await eventInterestDao.aggregateWithPagination('event_interest', defaultAndInterestEveent, paginateOptions.limit, paginateOptions.page, true)
                myHostedEventslist = await eventDao.aggregateWithPagination('event', typeAggPipe, paginateOptions.limit, paginateOptions.page, true)
                return {
                    myInterestedEventslist,
                    myHostedEventslist
                }
            }

        } catch (error) {
            return Promise.reject(error);
        }
    }

    /**
     * @function calenderEvent
     * @description event home screen nearest location by the lat lng
     * @params (UserEventRequest.userGetEvent)
     */

    // let searchDistance = distance ? distance * 1000 : 100 * 1000// Default value is 10 km.
    // let pickupLocation = [];
    // let match: any = {}
    // if (longitude != undefined && latitude != undefined) {
    //     pickupLocation.push(latitude, longitude);
    //     aggPipe.push(
    //         {
    //             '$geoNear': {
    //                 near: { type: "Point", coordinates: pickupLocation },
    //                 spherical: true,
    //                 maxDistance: searchDistance,
    //                 distanceField: "dist",
    //             }
    //         },
    //         { "$sort": { dist: -1 } }
    //     )
    // }

    async getEvent(params: UserEventRequest.getEvents, tokenData) {
        try {
            const { distance, eventCategoryId, date, searchKey, getIpfromNtwk } = params;
            let { longitude, latitude, } = params;
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

            console.log('longitudelongitude', longitude, 'latitudelatitude', latitude);

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
                            includeLocs: "dist.location",
                            distanceField: "dist",
                        }
                    },
                    { "$sort": { endDate: 1 } }
                )
                // pickupLocation.push(latitude, longitude);
                // aggPipe.push(
                //     {
                //         '$geoNear': {
                //             near: { type: "Point", coordinates: pickupLocation },
                //             spherical: true,
                //             maxDistance: searchDistance,
                //             distanceField: "dist",
                //         }
                //     },
                //     { "$sort": { dist: -1 } }
                // )
                featureAggPipe.push(
                    {
                        '$geoNear': {
                            near: { type: "Point", coordinates: pickupLocation },
                            spherical: true,
                            maxDistance: searchDistance,
                            distanceField: "dist",
                        }
                    },
                    { "$sort": { endDate: 1, } }
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
            //     featureAggPipe.push(
            //         {
            //             $sort: {
            //                 _id: -1
            //             },
            //         },
            //     );
            // }
            console.log('longitudelongitude', longitude, 'latitudelatitude', latitude);
            match['status'] = config.CONSTANT.STATUS.ACTIVE;
            match['endDate'] = { $gt: new Date().getTime() }
            aggPipe.push({ $match: match }, { $match: { isFeatured: false } }, { $limit: 5 })
            featureAggPipe.push({ $match: match }, { $match: { isFeatured: true } }, { $limit: 5 })

            // const unwind = {
            //     '$unwind': { path: '$interestData', preserveNullAndEmptyArrays: true },
            // }

            const interesetData = {
                $lookup: {
                    from: 'event_interests',
                    let: { uId: '$userId', eId: '$_id' },
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
                                    // {
                                    //     $eq: ['$type', config.CONSTANT.EVENT_INTEREST.INTEREST]
                                    // }
                                ]
                            }
                        },
                    }],
                    as: 'interestData',
                }
            };

            const FilterForGoingAndIntereset = {
                $addFields: {
                    isHostedByMe: {
                        $cond: {
                            if: { $eq: ['$userId', appUtils.toObjectId(tokenData.userId)] },
                            then: true,
                            else: false
                        },
                    },
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
                }
            }

            const projection = {
                "$project": {
                    name: 1,
                    title: 1,
                    location: 1,
                    privacy: 1,
                    startDate: 1,
                    endDate: 1,
                    price: 1,
                    url: 1,
                    imageUrl: 1,
                    userType: 1,
                    eventUrl: 1,
                    allowSharing: 1,
                    isFeatured: 1,
                    description: 1,
                    address: 1,
                    goingCount: 1,
                    interestCount: 1,
                    eventCategory: 1,
                    eventCategoryId: 1,
                    eventCategoryName: 1,
                    created: 1,
                    event_interests: 1,
                    "isInterest": {
                        $cond: {
                            if: { "$eq": ["$interest", 0] }, then: false, else: true
                        }
                    },
                    "isGoing": {
                        $cond: {
                            if: { "$eq": ["$going", 0] }, then: false, else: true
                        }
                    },
                    isHostedByMe: '$isHostedByMe',
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
                    // users: 1,
                }
            };

            featureAggPipe.push(interesetData);
            featureAggPipe.push(FilterForGoingAndIntereset);
            featureAggPipe.push(projection);

            // aggPipe.push({
            //     $addFields: {
            //         isHostedByMe: {
            //             $cond: {
            //                 if: { $eq: ['$userId', appUtils.toObjectId(tokenData.userId)] },
            //                 then: true,
            //                 else: false
            //             },
            //         },
            //     }
            // })
            aggPipe.push(interesetData);
            aggPipe.push(FilterForGoingAndIntereset);
            // aggPipe.push(unwind);
            // aggPipe.push(unwind);

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
            // const eventCategoryListName = await eventDao.aggregate('event', getEventCategory, {})
            // eventCategoryListName.push({ "_id": 5, 'description': 'ALL' })

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
            // return [
            //     FEATURED,
            //     EVENTS,
            // ]
            return {
                featuredEvent,
                event

            }

        } catch (error) {
            return Promise.reject(error)
        }
    }

    /**
     * @function getEventDetail
     * @description user get the event detail
     * @param (UserEventRequest.getEventDetail) 
     * @param tokenData 
     */
    async getEventDetail(payload: UserEventRequest.getEventDetail, tokenData) {
        try {
            const match: any = {};
            let aggPipe = [];

            match['_id'] = appUtils.toObjectId(payload.eventId)
            match['status'] = config.CONSTANT.STATUS.ACTIVE;
            aggPipe.push({ $match: match })

            aggPipe.push({
                $lookup: {
                    from: 'users',
                    let: { uId: '$userId' },
                    as: 'hostUser',
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
                    }]
                }
            })
            aggPipe.push({ '$unwind': { path: '$hostUser', preserveNullAndEmptyArrays: true } });

            aggPipe.push({
                $lookup: {
                    from: "discovers",
                    let: { "users": "$userId", "user": appUtils.toObjectId(tokenData.userId) },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $or: [
                                        {
                                            $and: [
                                                {
                                                    $eq: ["$followerId", "$$user"]
                                                },
                                                {
                                                    $eq: ["$userId", "$$users"]
                                                }
                                            ]
                                        },
                                        {
                                            $and: [
                                                {
                                                    $eq: ["$userId", "$$user"]
                                                },
                                                {
                                                    $eq: ["$followerId", "$$users"]
                                                }
                                            ]
                                        }
                                    ]
                                }
                            }
                        }
                    ],
                    as: "DiscoverData"
                }
            })
            aggPipe.push({ '$unwind': { path: '$DiscoverData', preserveNullAndEmptyArrays: true } })

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
                    isHostedByMe: {
                        $cond: {
                            if: { "$eq": ['$userId', appUtils.toObjectId(tokenData.userId)] },
                            then: true,
                            else: false
                        }
                    },
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
                    isHostedByMe: 1,
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
                    startDate: 1,
                    goingCount: 1,
                    imageUrl: 1,
                    location: 1,
                    userType: 1,
                    price: 1,
                    eventUrl: 1,
                    isFeatured: 1,
                    endDate: 1,
                    allowSharing: 1,
                    description: 1,
                    eventCategory: 1,
                    eventCategoryId: 1,
                    eventCategoryName: 1,
                    title: 1,
                    address: 1,
                    friends: [],
                    // hostUser: 1,
                    hostUser: {
                        _id: 1,
                        status: "$hostUser.status",
                        industryType: "$hostUser.industryType",
                        myConnection: "$hostUser.myConnection",
                        experience: "$hostUser.experience",
                        discover_status: { $ifNull: ["$DiscoverData.discover_status", 4] },
                        name: { $concat: [{ $ifNull: ["$hostUser.firstName", ""] }, " ", { $ifNull: ["$hostUser.lastName", ""] }] },
                        profilePicUrl: "$hostUser.profilePicUrl",
                        profession: { $ifNull: ["$hostUser.profession", ""] },
                        about: { $ifNull: ["$hostUser.about", ""] }
                    }
                }
            })

            const data = await eventDao.aggregate('event', aggPipe, {})
            return data[0] ? data[0] : {};
        } catch (error) {
            return Promise.reject(error)
        }
    }

    /**
     * @function getEventList
     * @param params (UserEventRequest.getEventList)
     * @param tokenData 
     * @description eventList on viewAll featured and normal event
     */
    async getEventList(params: UserEventRequest.getEventList, tokenData) {
        try {
            const data = await eventDao.getEventList(params, tokenData);
            return data;
        } catch (error) {
            return Promise.reject(error)
        }
    }


    /**
     * @function updateEvent
     * @param params (UserEventRequest.getEventList)
     * @param tokenData 
     * @description eventList on viewAll featured and normal event
     */

    async updateEvent(params: UserEventRequest.updateEvent, tokenData) {
        try {
            const criteria = {
                _id: params.eventId,
                userId: tokenData.userId
            }
            const categoryData = await categoryDao.findOne('categories', { _id: params.eventCategoryId }, {}, {})
            // const result = this.getTypeAndDisplayName(config.CONSTANT.EVENT_CATEGORY, params['eventCategoryId'])
            params['eventCategoryName'] = categoryData['title'];
            params['location']['coordinates'] = params['location']['coordinates'].reverse();

            const updateEvent = await eventDao.findOneAndUpdate('event', criteria, params, { new: true });
            if (!updateEvent) {
                return Promise.reject(eventConstant.MESSAGES.ERROR.EVENT_NOT_FOUND);
            }
            const getEventDetail = await eventController.getEventDetail({ eventId: updateEvent._id }, tokenData)
            return eventConstant.MESSAGES.SUCCESS.SUCCESSFULLY_UPDATE(getEventDetail);
        } catch (error) {
            return Promise.reject(error);
        }
    }

    async generateLink(params, tokenData) {
        try {
            console.log('tokenDatatokenData', tokenData);

            const tokenData1 = _.extend(params, {
                "userId": tokenData.userId,
                "countryCode": tokenData.countryCode,
                "mobileNo": tokenData.mobileNo,
                "accountLevel": config.CONSTANT.ACCOUNT_LEVEL.USER
            });

            // const userObject = appUtils.buildToken(tokenData1); // build token data for generating access token
            // const accessToken = await tokenManager.generateUserToken({ type: "FORGOT_PASSWORD", object: userObject });
            // if (params.email) {
            //     const step2 = userDao.addForgotToken({ "userId": step1._id, "forgotToken": accessToken }); // add forgot token
            //     const step3 = mailManager.forgotPasswordEmailToUser({ "email": params.email, "firstName": step1.firstName, "lastName": step1.lastName, "token": accessToken });

            const url = `${config.SERVER.APP_URL}${config.SERVER.API_BASE_URL}?ios=${config.CONSTANT.DEEPLINK.IOS_SCHEME}?eventId=${params.eventId}` +
                `&android=${config.CONSTANT.DEEPLINK.ANDROID_SCHEME}` +
                `&type=share`

            console.log('url>>>>>>>>', url);

            // async forgotPasswordEmailToUser(params) {
            //     const mailContent = await (new TemplateUtil(config.SERVER.TEMPLATE_PATH + "forgot-password.html"))
            //         .compileFile({
            //             "url": `${config.SERVER.APP_URL}${config.SERVER.API_BASE_URL}/v1/common/deepLink?ios=${config.CONSTANT.DEEPLINK.IOS_SCHEME}?token=${params.token}` +
            //                 `&android=${config.CONSTANT.DEEPLINK.ANDROID_SCHEME}?token=${params.token}` +
            //                 `&type=forgot&token=${params.token}&accountLevel=${config.CONSTANT.ACCOUNT_LEVEL.USER}&name=${params.firstName + " " + params.lastName}`,
            //             "name": params.firstName + " " + params.lastName,
            //             "year": new Date().getFullYear(),
            //             "validity": appUtils.timeConversion(10 * 60 * 1000), // 10 mins
            //             "logoUrl": config.SERVER.UPLOAD_IMAGE_DIR + "womenLogo.png",
            //         });
            //     await this.sendMail({ "email": params.email, "subject": config.CONSTANT.EMAIL_TEMPLATE.SUBJECT.FORGOT_PWD_EMAIL, "content": mailContent });
            // }

            // return userConstant.MESSAGES.SUCCESS.FORGOT_PASSWORD_ON_EMAIL;

            // }
            return url;

        } catch (error) {

            return Promise.reject(error)
        }
    }
}
export const eventController = new EventController();