
"use strict";


import * as _ from "lodash";

import * as config from "@config/index";
import { eventInterestDao } from "@modules/eventInterest/eventInterestDao";
import * as appUtils from "@utils/appUtils";
import { eventDao } from "@modules/event/eventDao";
import { baseDao } from "@modules/base/BaseDao";
import { userDao } from "@modules/user";
import { discoverDao } from "@modules/discover";
import { notificationManager } from '@utils/NotificationManager';
import { eventController } from "@modules/event/eventController";
class InterestController {


	/**
	 * @function add event interests
	 * @description user add interest going / interest in event
	 */
    async addInterests(params: EventInterest.AddInterest, tokenData) {
        try {
            let { type } = params;
            const { eventId, userId } = params
            let data: any = {};

            let incOrDec: number = 1
            const criteria = {
                type: type,
                eventId: appUtils.toObjectId(eventId),
                userId: appUtils.toObjectId(userId)
            };

            const findCreatedUserId = await eventDao.findOne('event', { _id: appUtils.toObjectId(eventId) }, {}, {})

            // const findEventCreaterId = await eventInterestDao.findOne('event_interest', { eventId: appUtils.toObjectId(eventId), userId: appUtils.toObjectId(userId) }, {}, {})

            const checkExist = await eventInterestDao.findOne('event_interest', criteria, {}, {})

            if (checkExist) {
                incOrDec = -1
                await eventInterestDao.remove('event_interest', criteria);
            }
            else if (!checkExist) {
                criteria["created"] = new Date().getTime();
                const createrId = await eventInterestDao.insert('event_interest', criteria, {});

                // const userEvent = await eventInterestDao.find('event_interest', { eventId: params.eventId, userId: params.userId }, {}, {}, {}, {}, {});
                params['title'] = 'event Interests';
                params['body'] = {
                    _id: eventId,
                };
                params['click_action'] = "Event Interest Received";
                type == config.CONSTANT.EVENT_INTEREST.GOING ? params['message'] = `${tokenData.firstName} is going in your event` : params['message'] = `${tokenData.firstName} has shown interest in your event`;
                params['type'] = config.CONSTANT.EVENT_INTEREST.GOING ? config.CONSTANT.NOTIFICATION_CATEGORY.EVENT_GOING.type : config.CONSTANT.NOTIFICATION_CATEGORY.EVENT_INTEREST.type;
                params['eventId'] = eventId;
                params['userId'] = findCreatedUserId.userId;
                // params['userId'] = params.followerId;
                const data1111 = notificationManager.sendOneToOneNotification(params, { userId: tokenData.userId }, true);
            }

            const userEvent = await eventInterestDao.findAll('event_interest', { eventId: params.eventId, userId: params.userId }, {}, {});

            if (type == config.CONSTANT.EVENT_INTEREST.GOING) {
                data = await eventDao.findByIdAndUpdate('event', { _id: eventId }, { $inc: { goingCount: incOrDec } }, { new: true, lean: true })
            }
            if (type == config.CONSTANT.EVENT_INTEREST.INTEREST) {
                data = await eventDao.findByIdAndUpdate('event', { _id: eventId }, { $inc: { interestCount: incOrDec } }, { new: true, lean: true })
            }

            const eventData = await eventController.getEventDetail({ eventId: params.eventId }, { userId: tokenData.userId });
            // console.log('eventDataeventDataeventData', eventData);

            return eventData;

            // return data;
        } catch (error) {
            return Promise.reject(error);
        }
    }


    async interestAndGoingUser(params: EventInterest.interestAndGoingUser, tokenData) {
        try {
            const { limit, page, type, eventId } = params;

            let match: any = {};
            let aggPipe = [];

            match['eventId'] = appUtils.toObjectId(eventId);
            match['type'] = type;

            aggPipe.push({ $match: match });
            aggPipe.push({
                $sort: {
                    _id: -1
                }
            });

            aggPipe.push({
                $lookup: {
                    from: 'users',
                    let: { uId: '$userId' },
                    as: 'userData',
                    pipeline: [{
                        $match: {
                            $expr: {
                                $eq: ['$_id', '$$uId'],
                            }
                        }
                    }]
                }
            });
            aggPipe.push({ '$unwind': { path: '$userData', preserveNullAndEmptyArrays: true } });

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
                '$project': {
                    //         members: 0,
                    //         adminStatus: 0,
                    //         hash: 0,
                    //         location: 0,
                    //         createdAt: 0,
                    //         updatedAt: 0,
                    //         badgeCount: 0,
                    //         fullMobileNo: 0,
                    //         status: 0,
                    // users: {

                    _id: '$userData._id',
                    status: '$userData.status',
                    industryType: "$userData.industryType",
                    myConnection: "$userData.myConnection",
                    experience: "$userData.experience",
                    discover_status: { $ifNull: ["$DiscoverData.discover_status", 4] },
                    name: { $concat: [{ $ifNull: ["$userData.firstName", ""] }, " ", { $ifNull: ["$userData.lastName", ""] }] },
                    profilePicUrl: "$userData.profilePicUrl",
                    profession: { $ifNull: ["$userData.profession", ""] },
                    about: { $ifNull: ["$userData.about", ""] },
                    isHostedByMe: {
                        $cond: {
                            if: { $eq: ['$createrId', appUtils.toObjectId(tokenData.userId)] },
                            then: true,
                            else: false
                        },
                    },
                    // }
                }
            })


            const data = await baseDao.paginate('event_interest', aggPipe, limit, page, true)
            return data;

        } catch (error) {
            return Promise.reject(error)
        }
    }

}
export const interestController = new InterestController();


