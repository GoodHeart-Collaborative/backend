"use strict";
import { BaseDao } from "@modules/base/BaseDao";
import * as config from "@config/index";
import * as appUtils from "@utils/appUtils";

export class DiscoverDao extends BaseDao {
    async getDiscoverData(params, userId, isMyConnection) {
        try {
            let { pageNo, limit ,user, searchKey, _id, followerId, discover_status } = params
            let match: any = {};
            let aggPipe = [];
            let result: any = {}
            if(user) {
                match["$nor"] = [
                    { "userId": await appUtils.toObjectId(userId.userId), "followerId": await appUtils.toObjectId(user) }, 
                    { "userId": await appUtils.toObjectId(user), "followerId": await appUtils.toObjectId(userId.userId) }
                ];
                userId.userId = user
            }
            userId = await appUtils.toObjectId(userId.userId)
            if (_id) {
                aggPipe.push({ "$match": { "_id": _id } })
                pageNo = 1
                limit = 1
            } else {
                if (isMyConnection) {
                    match["$or"] = [
                        { "userId": userId },
                        { "followerId": userId }
                    ];
                    match['discover_status'] = config.CONSTANT.DISCOVER_STATUS.ACCEPT
                } else {
                    match["followerId"] = userId
                    if(followerId) {
                        match["userId"] = await appUtils.toObjectId(followerId)
                    }
                    match['discover_status'] = { $ne: config.CONSTANT.DISCOVER_STATUS.ACCEPT }
                }
            }
            aggPipe.push({ "$sort": { "createdAt": 1 } })
            if(discover_status) {
                match["discover_status"] = discover_status
            }
            aggPipe.push({ "$match": match })
            aggPipe.push({
                $lookup: {
                    "from": "users",
                    "localField": "userId",
                    "foreignField": "_id",
                    "as": "users"
                }
            })
            aggPipe.push({ '$unwind': { path: '$users', preserveNullAndEmptyArrays: true } })
            aggPipe.push({
                $lookup: {
                    "from": "users",
                    "localField": "followerId",
                    "foreignField": "_id",
                    "as": "followers"
                }
            })
            aggPipe.push({ "$addFields": { created: { "$subtract": ["$createdAt", new Date("1970-01-01")] } } });
            aggPipe.push({ '$unwind': { path: '$followers', preserveNullAndEmptyArrays: true } })
            aggPipe.push({
                $project:
                {
                    _id: 1,
                    discover_status: 1,
                    user: {
                        $cond: [{ $and: [{ $eq: ["$userId", userId] }] }, {
                            _id: "$followers._id",
                            industryType: "$followers.industryType",
                            myConnection: "$followers.myConnection",
                            experience: "$followers.experience",
                            about: "$followers.about",
                            discover_status: "$discover_status",
                            name: { $ifNull: ["$followers.firstName", ""] },
                            profilePicUrl: "$followers.profilePicUrl",
                            profession: { $ifNull: ["$followers.profession", ""] }
                        }, {
                            _id: "$users._id",
                            industryType: "$users.industryType",
                            myConnection: "$users.myConnection",
                            experience: "$users.experience",
                            about: "$users.about",
                            discover_status: "$discover_status",
                            name: { $ifNull: ["$users.firstName", ""] },
                            profilePicUrl: "$users.profilePicUrl",
                            profession: { $ifNull: ["$users.profession", ""] }
                        }]
                    },
                    created: 1
                    // createdAt: 1,
                }
            })
            if (searchKey) {
                aggPipe.push({ "$match": { "user.name": { "$regex": searchKey, "$options": "-i" } } });
            }
            result = await this.paginate('discover', aggPipe, limit, pageNo, {}, true)
            return result
        } catch (error) {
            throw error;
        }
    }
    async getUserData(params, userId) {
        try {
            let { pageNo, limit, searchKey, _id, longitude, latitude, distance, industryType, } = params
            let aggPipe = [];
            let result: any = {}
            let searchDistance = distance ? distance * 1000 : 100 * 1000// Default value is 10 km.
            let pickupLocation = [];
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
                userId = await appUtils.toObjectId(userId.userId)
            if (_id) {
                aggPipe.push({ "$match": { "_id": await appUtils.toObjectId(_id) } })
                pageNo = 1
                limit = 1
            } else {
                aggPipe.push({ "$match": { _id: {$ne: userId} } })
            }
            aggPipe.push({ "$sort": { "createdAt": 1 } })
            aggPipe.push({
                $lookup: {
                    "from": "discovers",
                    "localField": "_id",
                    "foreignField": "followerId",
                    "as": "discovers"
                }
            })
            if (industryType) {
                aggPipe.push({ "$match": { industryType: { $in: industryType } } })
            }
            if (searchKey) {
                aggPipe.push({ "$match": { "firstName": { "$regex": searchKey, "$options": "-i" } } });
            }
            aggPipe.push({
                $lookup: {
                    from: "discovers",
                    let: { "follower": "$_id", "user": userId },
                    pipeline: [{
                        $match: {
                            $expr: {
                                $and: [
                                    {
                                        $eq: ["$followerId", "$$follower"]
                                    },
                                    {
                                        $eq: ["$userId", "$$user"]
                                    }
                                ]
                            }
                        }

                    }],
                    as: "discovers",
                }
            })
            aggPipe.push({ '$unwind': { path: '$discovers', preserveNullAndEmptyArrays: true } })
            aggPipe.push({ "$addFields": { created: { "$subtract": ["$createdAt", new Date("1970-01-01")] } } });
            aggPipe.push({
                $project:
                {
                    _id: 1,
                    discover_status: {
                        $cond: { if: { "$eq": ["$discovers.userId", userId] }, then: "$discovers.discover_status", else: config.CONSTANT.DISCOVER_STATUS.NO_ACTION }
                    },
                    user: {
                        _id: "$_id",
                        industryType: "$industryType",
                        myConnection: "$myConnection",
                        experience: "$experience",
                        discover_status: {
                            $cond: { if: { "$eq": ["$discovers.userId", userId] }, then: "$discovers.discover_status", else: config.CONSTANT.DISCOVER_STATUS.NO_ACTION }
                        },
                        about: "$about",
                        name: { $ifNull: ["$firstName", ""] },
                        profilePicUrl: "$profilePicUrl",
                        profession: { $ifNull: ["$profession", ""] }
                    },
                    created: 1
                }
            })
            result = await this.paginate('users', aggPipe, limit, pageNo, {}, true)
            return result
        } catch (error) {
            throw error;
        }
    }
    async checkDiscover(params) {
        try {
            return await this.findOne('discover', params, {}, {});
        } catch (error) {
            throw error;
        }
    }
    async getMembers(params) {
        try {
            let {_id, userId, followerId} = params
            let query:any = {}
            query = {
                _id: _id,
                "members": { $all: [ await appUtils.toObjectId(userId), await appUtils.toObjectId(followerId) ]}
            }
            return await this.findOne('discover', query, {},{});
        } catch (error) {
            throw error;
        }
    }
    async saveDiscover(params) {
        try {
            return await this.save('discover', params)
        } catch (error) {
            throw error;
        }
    }
    async deletedDiscover(params) {
        try {
            return await this.remove('discover', params)
        } catch (error) {
            throw error;
        }
    }
    async updateDiscover(query, update) {
        try {
            let updateData: any = {}
            updateData["$set"] = update
            return await this.findOneAndUpdate('discover', query, updateData, { new: true });
        } catch (error) {
            throw error;
        }
    }

}

export const discoverDao = new DiscoverDao();