"use strict";


import * as _ from "lodash";

import * as config from "@config/index";
import * as feedConstant from "@modules/admin/feed/feedConstant";
import { gratitudeJournalDao } from "@modules/gratitudeJournal/GratitudeJournalDao";
import { shoutoutDao } from '@modules/shoutout/ShoutoutDao';
import * as appUtils from '@utils/appUtils';

class AdminShoutOut {

    getTypeAndDisplayName(findObj, num: number) {
        const obj = findObj;
        const data = Object.values(obj);
        const result = data.filter((x: any) => {
            return x.VALUE === num;
        });
        return result[0];
    }
	/**
	 * @function add event
	 * @description user add event
	 */
    // async addForum(params: AdminForumRequest.AddForum) {
    //     try {
    //         params["created"] = new Date().getTime()
    //         const data = await eventDao.insert("forum", params, {});
    //         return forumConstant.MESSAGES.SUCCESS.FORUM_ADDED(data);
    //     } catch (error) {
    //         throw error;
    //     }
    // }

    async getShoutOut(params) {
        try {
            const { status, sortBy, sortOrder, limit, userId, page, searchTerm, fromDate, toDate, type, privacy, isExpired } = params;
            const aggPipe = [];
            const match: any = {};

            match['userId'] = appUtils.toObjectId(userId);
            if (status) {
                match["$and"] = [{ status: status }, { status: { "$ne": config.CONSTANT.STATUS.DELETED } }];
            } else {
                match.status = { "$ne": config.CONSTANT.STATUS.DELETED };
            }
            if (privacy) {
                match.privacy = params.privacy;
            }
            if (isExpired) {
                match['endTime'] = {
                    $lte: new Date().getTime()
                }
            }
            if (isExpired === false) {
                match['endTime'] = {
                    $gte: new Date().getTime()
                }
            }

            if (searchTerm) {
                match["$or"] = [
                    { "topic": { "$regex": searchTerm, "$options": "-i" } },
                    { "description": { "$regex": searchTerm, "$options": "-i" } },
                ];
            }
            let sort = {};
            if (sortBy && sortOrder) {
                if (sortBy === "title") {
                    sort = { "title": sortOrder };
                } else {
                    sort = { "created": sortOrder };
                }
            } else {
                sort = { _id: -1 };
            }


            if (fromDate && toDate) { match['createdAt'] = { $gte: fromDate, $lte: toDate }; }
            if (fromDate && !toDate) { match['createdAt'] = { $gte: fromDate }; }
            if (!fromDate && toDate) { match['createdAt'] = { $lte: toDate }; }

            aggPipe.push({ "$match": match });
            aggPipe.push({ "$sort": sort });
            aggPipe.push({
                $addFields: {
                    isExpired: {
                        $cond: {
                            if: {
                                $gte: ['$endTime', new Date().getTime()]
                            }, then: false,
                            else: true
                        },
                    }
                }
            })
            const data = await shoutoutDao.paginate('shoutout', aggPipe, limit, page, true);
            return data;

        } catch (error) {
            return Promise.reject(error);
        }
    }


    async getShoutOutDetail(params) {
        try {
            const { shoutOutId } = params;
            const aggPipe = [];
            const match: any = {};

            match['_id'] = { $eq: appUtils.toObjectId(shoutOutId) }

            aggPipe.push({ "$match": match });
            aggPipe.push({
                $lookup: {
                    from: 'users',
                    let: { uId: '$userId' },
                    pipeline: [{
                        $match: {
                            $expr: {
                                $and: [
                                    {
                                        $eq: ['$_id', '$$uId']
                                    },
                                    {
                                        $eq: ['$status', config.CONSTANT.STATUS.ACTIVE]
                                    }
                                ]
                            }
                        }
                    },
                    {
                        $project: {
                            firstName: 1,
                            lastName: 1,
                            email: 1,
                            status: 1,
                        }
                    }

                    ],
                    as: 'senderData'
                }
            })
            aggPipe.push({ '$unwind': { path: '$senderData' } });

            aggPipe.push({
                $lookup: {
                    from: 'users',
                    let: { uId: '$userId', mId: '$memberAdded' },
                    pipeline: [{
                        $match: {
                            $expr: {
                                $and: [
                                    {
                                        $in: ['$_id', '$$mId']
                                    },
                                    {
                                        $eq: ['$status', config.CONSTANT.STATUS.ACTIVE]
                                    }
                                ]
                            }
                        }
                    },
                    {
                        $project: {
                            firstName: 1,
                            lastName: 1,
                            email: 1,
                            status: 1,
                        }
                    }

                    ],
                    as: 'memberData'
                }
            })
            aggPipe.push({
                $addFields: {
                    isExpired: {
                        $cond: {
                            if: {
                                $gte: ['$endTime', new Date().getTime()]
                            }, then: false,
                            else: true
                        },
                    }
                }
            })


            const data = await shoutoutDao.aggregate('shoutout', aggPipe, {});
            return data[0] ? data[0] : {};

        } catch (error) {
            return Promise.reject(error);
        }
        // try {
        //     const { cardId } = params;
        //     const criteria = {
        //         _id: cardId
        //     }
        //     const data = await shoutoutDao.findOne('shoutout', criteria, {}, {});
        //     return data;
        // } catch (error) {
        //     return Promise.reject(error);
        // }
    }
    // async updateForumTopic(params: AdminForumRequest.UpdateForum) {
    //     try {
    //         const criteria = {
    //             _id: params.postId,
    //         };
    //         const dataToUpdate = {
    //             ...params
    //         }
    //         const data = await eventDao.findOneAndUpdate('forum', criteria, dataToUpdate, { new: true })
    //         if (!data) {
    //             // return forumConstant.MESSAGES.SUCCESS.SUCCESS_WITH_NO_DATA;
    //         }
    //         return forumConstant.MESSAGES.SUCCESS.FORUM_UPDATED(data);
    //     } catch (error) {
    //         throw error;
    //     }
    // }

    /**
     * @function updateStatus
     * @description admin update status active ,block ,delete
     */

    async updateStatus(params) {
        try {
            const { type, postId, status } = params
            const criteria = {
                _id: postId
            };

            const datatoUpdate = {
                status: status
            };
            if (type == config.CONSTANT.HOME_TYPE.GENERAL_GRATITUDE) {
                const data = await gratitudeJournalDao.findOneAndUpdate('gratitude_journals', criteria, datatoUpdate, { new: true })
                return feedConstant.MESSAGES.SUCCESS.FORUM_STATUS_UPDATED(data.status);

            }
            if (type == config.CONSTANT.HOME_TYPE.SHOUTOUT) {
                const data = await shoutoutDao.findOneAndUpdate('shoutout', criteria, datatoUpdate, { new: true })
                return feedConstant.MESSAGES.SUCCESS.FORUM_STATUS_UPDATED(data.status);

            }
            return;
        } catch (error) {
            return Promise.reject(error)
        }
    }

    // async getForum(params) {
    //     try {
    //         let aggPipe = [];
    //         let match: any = {}

    //         match['_id'] = appUtils.toObjectId(params.postId)

    //         aggPipe.push({
    //             $match: match
    //         })
    //         if (params.userType == config.CONSTANT.ACCOUNT_LEVEL.ADMIN) {

    //             aggPipe.push({
    //                 $lookup: {
    //                     from: 'admin',
    //                     let: { aId: '$userId' },
    //                     pipeline: [{
    //                         $match: {
    //                             $expr: {
    //                                 $eq: ['$_id', '$$aId']
    //                             }
    //                         }
    //                     }],
    //                     as: 'adminData'
    //                 }
    //             })
    //             aggPipe.push({ '$unwind': { path: '$adminData' } });
    //         }
    //         if (params.userType == config.CONSTANT.ACCOUNT_LEVEL.USER) {
    //             aggPipe.push({
    //                 $lookup: {
    //                     from: 'users',
    //                     let: { uId: '$userId' },
    //                     pipeline: [{
    //                         $match: {
    //                             $expr: {
    //                                 $and: [
    //                                     {
    //                                         $eq: ['$_id', '$$uId']
    //                                     },
    //                                     // {
    //                                     //     $eq: ['$userType', config.CONSTANT.ACCOUNT_LEVEL.USER]
    //                                     // }
    //                                 ]
    //                             }
    //                         }
    //                     },
    //                     {
    //                         $project: {
    //                             firstName: 1,
    //                             lastName: 1,
    //                             profilePicUrl: 1,
    //                             status: 1
    //                         }
    //                     }],
    //                     as: 'userData'
    //                 }
    //             })
    //             aggPipe.push({ '$unwind': { path: '$userData' } });

    //         }

    //         const data = await eventDao.aggregate('forum', aggPipe, {})
    //         return data[0];
    //     } catch (error) {
    //         return Promise.reject(error)
    //     }
    // }
}
export const adminShoutOut = new AdminShoutOut();