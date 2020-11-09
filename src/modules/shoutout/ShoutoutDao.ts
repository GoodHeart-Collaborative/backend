"use strict";
import { BaseDao } from "@modules/base/BaseDao";
import * as config from "@config/index";
import * as appUtils from "@utils/appUtils";
import { CONSTANT } from "@config/index";


export class ShoutoutDao extends BaseDao {
    async getShoutoutData(params, userId) {
        try {
            let { pageNo, limit } = params
            let match: any = {};
            let aggPipe = [];
            let result: any = {}
            userId = await appUtils.toObjectId(userId.userId)
            match["$or"] = [
                { "membersDetail": { $elemMatch: { userId: userId } } },
                { "userId": userId }
            ];
            aggPipe.push({ "$sort": { "_id": -1 } })
            aggPipe.push({ "$match": match })
            aggPipe.push({
                $lookup: {
                    "from": "users",
                    "localField": "userId",
                    "foreignField": "_id",
                    "as": "userss"
                }
            })
            aggPipe.push({ '$unwind': { path: '$userss', preserveNullAndEmptyArrays: true } })
            aggPipe.push(
                { $unwind: { path: "$membersDetail", preserveNullAndEmptyArrays: true } },
                {
                    $lookup: {
                        from: 'users',
                        let: {
                            userId: "$membersDetail.userId",
                        },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ["$_id", "$$userId"] },
                                            { $ne: ["$$userId", userId] },
                                        ]
                                    }
                                }
                            }],
                        as: 'membersDetail.userInfo'
                    }
                },
                { $unwind: { path: '$membersDetail.userInfo', preserveNullAndEmptyArrays: false } })
            aggPipe.push({
                $group: {
                    _id: {
                        _id: '$_id',
                        description: "$description",
                        title: "$title",
                        createdAt: "$createdAt",
                        isCreatedByMe: {
                            $cond: [{ $and: [{ $eq: ["$userId", userId] }] }, true, false]
                        },
                        user: {
                            _id: "$userss._id",
                            name: { $ifNull: ["$userss.firstName", ""] },
                            profilePicUrl: "$userss.profilePicUrl",
                            profession: { $ifNull: ["$userss.profession", ""] }
                        }
                    },
                    membersDetail: {
                        "$push": {
                            _id: "$membersDetail.userInfo._id",
                            name: { $ifNull: ["$membersDetail.userInfo.firstName", ""] },
                            profilePicUrl: "$membersDetail.userInfo.profilePicUrl",
                            profession: { $ifNull: ["$membersDetail.userInfo.profession", ""] }
                        }
                    }
                }
            })
            aggPipe.push({
                "$project": {
                    _id: "$_id._id",
                    description: "$_id.description",
                    title: "$_id.title",
                    createdAt: "$_id.createdAt",
                    isCreatedByMe: "$_id.isCreatedByMe",
                    user: "$_id.user",
                    users: "$membersDetail"
                }
            });
            result = await this.paginate('shoutout', aggPipe, limit, pageNo, {}, true)
            return result
        } catch (error) {
            throw error;
        }
    }

    async getShoutoutUpdatedData(params, userId) {
        try {
            let { pageNo, limit } = params
            let match: any = {};
            let aggPipe = [];
            let result: any = {}
            userId = await appUtils.toObjectId(userId.userId)
            match['createdAt'] = {
                $gt: new Date(new Date().getTime() - 60 * 60 * 24 * 1000)
            };

            match["$or"] = [
                { "members": { $all: [userId] }, privacy: CONSTANT.PRIVACY_STATUS.PUBLIC },
                { "senderId": userId },
                { "receiverId": userId }
            ];
            aggPipe.push({ "$sort": { "createdAt": -1 } })
            aggPipe.push({ "$match": match })
            // aggPipe.push({
            //     $lookup: {
            //         "from": "users",
            //         "localField": "senderId",
            //         "foreignField": "_id",
            //         "as": "sender"
            //     }
            // })
            aggPipe.push({
                $lookup: {
                    "from": "users",
                    "as": "sender",
                    let: { sId: '$senderId' },
                    pipeline: [{
                        $match: {
                            $expr: {
                                $and: [
                                    {
                                        $eq: ['$_id', '$$sId']
                                    },
                                    {
                                        $eq: ['$status', config.CONSTANT.STATUS.ACTIVE]
                                    },
                                ]
                            }
                        }
                    }]
                }
            })


            aggPipe.push({ '$unwind': { path: '$sender', preserveNullAndEmptyArrays: false } })
            // aggPipe.push({
            //     $lookup: {
            //         "from": "users",
            //         "localField": "receiverId",
            //         "foreignField": "_id",
            //         "as": "receiver"
            //     }
            // })
            aggPipe.push({
                $lookup: {
                    "from": "users",
                    "as": "receiver",
                    let: { rId: '$receiverId' },
                    pipeline: [{
                        $match: {
                            $expr: {
                                $and: [
                                    {
                                        $eq: ['$_id', '$$rId']
                                    },
                                    {
                                        $eq: ['$status', config.CONSTANT.STATUS.ACTIVE]
                                    },
                                ]
                            }
                        }
                    }]
                }
            })

            aggPipe.push({ '$unwind': { path: '$receiver', preserveNullAndEmptyArrays: false } })
            aggPipe.push({ "$addFields": { created: { "$subtract": ["$createdAt", new Date("1970-01-01")] } } });
            aggPipe.push({
                "$project": {
                    sender: {
                        industryType: "$sender.industryType",
                        myConnection: "$sender.myConnection",
                        experience: "$sender.experience",
                        // discover_status: 
                        about: "$sender.about",
                        name: { $ifNull: ["$sender.firstName", ""] },
                        profilePicUrl: "$sender.profilePicUrl",
                        profession: { $ifNull: ["$sender.profession", ""] }
                    },
                    receiver: {
                        industryType: "$receiver.industryType",
                        myConnection: "$receiver.myConnection",
                        experience: "$receiver.experience",
                        // discover_status: 
                        about: "$receiver.about",
                        name: { $ifNull: ["$receiver.firstName", ""] },
                        profilePicUrl: "$receiver.profilePicUrl",
                        profession: { $ifNull: ["$receiver.profession", ""] }
                    },
                    created: 1,
                    story: {
                        storyDuration: 6, // in seconds
                        greetWord: 'congratulates',
                        gif: "$gif",
                        title: "$title",
                        description: "$description"
                    }
                }
            });
            result = await this.paginate('shoutout', aggPipe, limit, pageNo, {}, true)
            return result
        } catch (error) {
            throw error;
        }
    }
    async saveShoutout(params) {
        try {
            return await this.save('shoutout', params)
        } catch (error) {
            throw error;
        }
    }
    async saveBulkShoutout(params) {
        try {
            return await this.insertMany('shoutout', params, {})
        } catch (error) {
            throw error;
        }
    }

    async getShoutOutForHome(params, userIds) {
        try {
            let { pageNo, limit } = params
            let match: any = {};
            let aggPipe = [];
            let result: any = {}
            const userId = await appUtils.toObjectId(userIds.userId)

            // match["$and"] = [{
            //     status: config.CONSTANT.STATUS.ACTIVE,
            //     ["$or"]: [
            //         {
            //             "members": { $all: [userId] },
            //             privacy: CONSTANT.PRIVACY_STATUS.PUBLIC
            //         },
            //         { "senderId": userId },
            //         { "receiverId": userId }
            //     ],
            // }];

            match['status'] = config.CONSTANT.STATUS.ACTIVE;
            match['createdAt'] = {
                $gt: new Date(new Date().getTime() - 60 * 60 * 24 * 1000)
            };

            const step1 = await shoutoutDao.find('shoutout', { receiverId: userId, ...match }, {}, {}, {}, {}, {});
            console.log('step1step1', step1, step1.length, step1.typeOf);

            let step2, step3;
            if (step1 && step1.length == 0) {
                console.log('step1.lengthstep1.length', step1.length);

                // myconnections shouotut
                // match['privacy'] = CONSTANT.PRIVACY_STATUS.PUBLIC;
                console.log('userIds.membersuserIds.membersuserIds.members', userIds.members);
                step2 = await shoutoutDao.find('shoutout', { senderId: { $in: userIds.members, }, ...match }, {}, {}, {}, {}, {})
                console.log('step2step2step2step2', step2);
            }
            if (step1 && step2 && step2.length == 0 && step1.length == 0) {
                step3 = await shoutoutDao.find('shoutout', { ...match, senderId: userId, }, {}, {}, {}, {}, {})
                console.log('step3step3step3step3step3', step3);
            }

            aggPipe.push({ "$sort": { "_id": -1 } })
            aggPipe.push({ "$match": match })
            // aggPipe.push({
            //     $lookup: {
            //         "from": "users",
            //         "localField": "senderId",
            //         "foreignField": "_id",
            //         "as": "sender"
            //     }
            // })
            aggPipe.push({
                $lookup: {
                    "from": "users",
                    "as": "sender",
                    let: { sId: '$senderId' },
                    pipeline: [{
                        $match: {
                            $expr: {
                                $and: [
                                    {
                                        $eq: ['$_id', '$$sId']
                                    },
                                    {
                                        $eq: ['$status', config.CONSTANT.STATUS.ACTIVE]
                                    },
                                ]
                            }
                        }
                    }]
                }
            })
            aggPipe.push({ '$unwind': { path: '$sender', preserveNullAndEmptyArrays: false } })
            // aggPipe.push({
            //     $lookup: {
            //         "from": "users",
            //         "localField": "receiverId",
            //         "foreignField": "_id",
            //         "as": "receiver"
            //     }
            // })
            aggPipe.push({
                $lookup: {
                    "from": "users",
                    "as": "receiver",
                    let: { rId: '$receiverId' },
                    pipeline: [{
                        $match: {
                            $expr: {
                                $and: [
                                    {
                                        $eq: ['$_id', '$$rId']
                                    },
                                    {
                                        $eq: ['$status', config.CONSTANT.STATUS.ACTIVE]
                                    },
                                ]
                            }
                        }
                    }]
                }
            })
            aggPipe.push({ '$unwind': { path: '$receiver', preserveNullAndEmptyArrays: false } })
            aggPipe.push({ "$addFields": { created: { "$subtract": ["$createdAt", new Date("1970-01-01")] } } });
            aggPipe.push({
                $sort: {
                    _id: -1,
                },
            },
                {
                    $limit: 1
                });
            aggPipe.push({
                "$project": {
                    sender: {
                        _id: '$sender._id',
                        industryType: "$sender.industryType",
                        myConnection: "$sender.myConnection",
                        experience: "$sender.experience",
                        // discover_status: 
                        about: "$sender.about",
                        name: { $ifNull: ["$sender.firstName", ""] },
                        profilePicUrl: "$sender.profilePicUrl",
                        profession: { $ifNull: ["$sender.profession", ""] }
                    },
                    receiver: {
                        _id: "$receiver._id",
                        industryType: "$receiver.industryType",
                        myConnection: "$receiver.myConnection",
                        experience: "$receiver.experience",
                        // discover_status: 
                        about: "$receiver.about",
                        name: { $ifNull: ["$receiver.firstName", ""] },
                        profilePicUrl: "$receiver.profilePicUrl",
                        profession: { $ifNull: ["$receiver.profession", ""] }
                    },
                    created: 1,
                    story: {
                        storyDuration: 6, // in seconds
                        greetWord: 'congratulates',
                        gif: "$gif",
                        title: "$title",
                        description: "$description"
                    }
                }
            });
            result = await this.aggregate('shoutout', aggPipe, {});

            if (result[0]) {
                result[0]["type"] = config.CONSTANT.HOME_TYPE.CONGRATS
                return result[0]
            }
            return;
            // return result[0];

        }
        catch (error) {
            return Promise.reject(error);
        }
    }
}

export const shoutoutDao = new ShoutoutDao();