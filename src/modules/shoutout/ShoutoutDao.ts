"use strict";
import { BaseDao } from "@modules/base/BaseDao";
import * as config from "@config/index";
import * as appUtils from "@utils/appUtils";
import { CONSTANT } from "@config/index";


export class ShoutoutDao extends BaseDao {
    async getShoutoutData(params, userId) {
        try {
            let { pageNo, limit  } = params
            let match: any = {};
            let aggPipe = [];
            let result: any = {}
            userId = await appUtils.toObjectId(userId.userId)
            match["$or"] = [
                { "membersDetail": { $elemMatch: { userId: userId }} },
                { "userId": userId }
            ];
            aggPipe.push({ "$sort": { "createdAt": 1 } })
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
                            } ],
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
                                $cond:[{ $and: [ { $eq: [ "$userId", userId ] } ]}, true, false]
                            },
                            user: {
                                _id: "$userss._id",
                                name: { $ifNull: ["$userss.firstName", ""] },
                                profilePicUrl: "$userss.profilePicUrl",
                                profession: { $ifNull: ["$userss.profession", ""] }
                            }
                        },
                        membersDetail: { "$push": {
                            _id: "$membersDetail.userInfo._id",
                            name: { $ifNull: ["$membersDetail.userInfo.firstName", ""] },
                            profilePicUrl: "$membersDetail.userInfo.profilePicUrl",
                            profession: { $ifNull: ["$membersDetail.userInfo.profession", ""] }
                        } }
                    }
                })
                aggPipe.push({ "$project": {
                    _id: "$_id._id",
                    description: "$_id.description",
                    title: "$_id.title",
                    createdAt: "$_id.createdAt",
                    isCreatedByMe: "$_id.isCreatedByMe",
                    user: "$_id.user",
                    users: "$membersDetail"	
                    }}); 
            result = await this.paginate('shoutout', aggPipe, limit, pageNo, {}, true)
            return result
        } catch (error) {
            throw error;
        }
    }

    async getShoutoutUpdatedData(params, userId) {
        try {
            let { pageNo, limit  } = params
            let match: any = {};
            let aggPipe = [];
            let result: any = {}
            userId = await appUtils.toObjectId(userId.userId)
            match["$or"] = [
                {"members": { $all: [ userId ]}, privacy:  CONSTANT.PRIVACY_STATUS.PUBLIC},
                { "senderId": userId },
                { "receiverId": userId }
            ];
            aggPipe.push({ "$sort": { "createdAt": 1 } })
            aggPipe.push({ "$match": match })
            aggPipe.push({
                $lookup: {
                    "from": "users",
                    "localField": "senderId",
                    "foreignField": "_id",
                    "as": "sender"
                }
            })
            aggPipe.push({ '$unwind': { path: '$sender', preserveNullAndEmptyArrays: true } })
            aggPipe.push({
                $lookup: {
                    "from": "users",
                    "localField": "receiverId",
                    "foreignField": "_id",
                    "as": "receiver"
                }
            })
            aggPipe.push({ '$unwind': { path: '$receiver', preserveNullAndEmptyArrays: true } })
            aggPipe.push({ "$addFields": { created: { "$subtract": ["$createdAt", new Date("1970-01-01")] } } });
                aggPipe.push({ "$project": {
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
                    }}); 
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

}

export const shoutoutDao = new ShoutoutDao();