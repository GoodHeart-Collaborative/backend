"use strict";
import { BaseDao } from "@modules/base/BaseDao";
import * as config from "@config/index";
import * as appUtils from "@utils/appUtils";
import { CONSTANT } from "@config/index";


export class DiscoverDao extends BaseDao {
    /**
     * @function getDiscoverData
     * @description to get the nearby user by location
     */
    async getDiscoverData(params, userId, isMyConnection) {
        try {
            let { pageNo, limit, user, searchKey, _id, followerId, discover_status, ShoutoutConnection, request_type } = params
            let match: any = {};
            let aggPipe = [];
            let result: any = {}
            if (user) {
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
                    if (request_type === CONSTANT.REQUEST_TYPE.RECEIVED_REQUEST) {
                        match["followerId"] = userId
                    }
                    if (request_type === CONSTANT.REQUEST_TYPE.SEND_REQUEST) {
                        match["userId"] = userId
                    }
                    if (followerId) {
                        match["$or"] = [
                            { "userId": userId, "followerId": await appUtils.toObjectId(followerId) },
                            { "userId": await appUtils.toObjectId(followerId), "followerId": userId }
                        ];
                    }
                    match['discover_status'] = { $ne: config.CONSTANT.DISCOVER_STATUS.ACCEPT }
                }
            }
            aggPipe.push({ "$sort": { "createdAt": 1 } })
            if (discover_status) {
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
            if (ShoutoutConnection) {
                aggPipe.push({
                    $project:
                    {
                        _id: 0,
                        user: {
                            $cond: [{ $and: [{ $eq: ["$userId", userId] }] }, {
                                _id: "$followers._id",
                                industryType: "$followers.industryType",
                                myConnection: "$followers.myConnection",
                                experience: "$followers.experience",
                                discover_status: "$discover_status",
                                name: { $concat: [{ $ifNull: ["$followers.firstName", ""] }, " ", { $ifNull: ["$followers.lastName", ""] }] },
                                profilePicUrl: "$followers.profilePicUrl",
                                profession: { $ifNull: ["$followers.profession", ""] },
                                about: { $ifNull: ["$followers.about", ""] },
                            }, {
                                _id: "$users._id",
                                industryType: "$users.industryType",
                                myConnection: "$users.myConnection",
                                experience: "$users.experience",
                                discover_status: "$discover_status",
                                name: { $concat: [{ $ifNull: ["$users.firstName", ""] }, " ", { $ifNull: ["$users.lastName", ""] }] },
                                profilePicUrl: "$users.profilePicUrl",
                                profession: { $ifNull: ["$users.profession", ""] },
                                about: { $ifNull: ["$users.about", ""] },
                            }]
                        }
                    }
                })
                aggPipe.push({
                    $project:
                    {
                        _id: "$user._id",
                        industryType: "$users.industryType",
                        myConnection: "$users.myConnection",
                        experience: "$users.experience",
                        discover_status: "$users.discover_status",
                        name: "$user.name",
                        profilePicUrl: "$user.profilePicUrl",
                        profession: "$user.profession",
                        about: "$users.about",
                    }
                })
            } else {
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
                                discover_status: "$discover_status",
                                name: { $concat: [{ $ifNull: ["$followers.firstName", ""] }, " ", { $ifNull: ["$followers.lastName", ""] }] },
                                profilePicUrl: "$followers.profilePicUrl",
                                profession: { $ifNull: ["$followers.profession", ""] },
                                about: { $ifNull: ["$followers.about", ""] },
                            }, {
                                _id: "$users._id",
                                industryType: "$users.industryType",
                                myConnection: "$users.myConnection",
                                experience: "$users.experience",
                                discover_status: "$discover_status",
                                name: { $concat: [{ $ifNull: ["$users.firstName", ""] }, " ", { $ifNull: ["$users.lastName", ""] }] },
                                profilePicUrl: "$users.profilePicUrl",
                                profession: { $ifNull: ["$users.profession", ""] },
                                about: { $ifNull: ["$users.about", ""] },
                            }]
                        },
                        created: 1
                    }
                })
            }
            if (searchKey) {
                aggPipe.push({ "$match": { "user.name": { "$regex": searchKey, "$options": "-i" } } });
            }
            if (ShoutoutConnection) {
                result = await this.aggregate('discover', aggPipe, {})
            } else {
                result = await this.paginate('discover', aggPipe, limit, pageNo, {}, true)
            }
            return result
        } catch (error) {
            throw error;
        }
    }
    async getUserData(params, userId) {
        try {
            let { pageNo, limit, searchKey, _id, longitude, latitude, distance, industryType } = params
            let aggPipe = [];
            let result: any = {}
            let searchDistance = distance ? distance * 1000 : 100 * 1000// Default value is 10 km.
            let pickupLocation = [];
            let match: any = {}
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
            // aggPipe.push({ "$match": { _id: { "$ne": userId } } });
            if (_id) {
                match["_id"] = await appUtils.toObjectId(_id)
                // aggPipe.push({ "$match": { "_id": await appUtils.toObjectId(_id) } })
                pageNo = 1
                limit = 1
            } else {
                match = {
                    "_id": { "$ne": userId },
                    adminStatus: CONSTANT.USER_ADMIN_STATUS.VERIFIED,
                    status: CONSTANT.STATUS.ACTIVE
                }
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
                match["industryType"] = { $in: industryType }
                // aggPipe.push({ "$match": { industryType: { $in: industryType } } })
            }
            if (searchKey) {
                match["firstName"] = { "$regex": searchKey, "$options": "-i" }
                // aggPipe.push({ "$match": { "firstName": { "$regex": searchKey, "$options": "-i" } } });
            }
            aggPipe.push({ "$match": match })
            aggPipe.push({
                $lookup: {
                    from: "discovers",
                    let: { "users": "$_id", "user": userId },
                    pipeline: [{
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
                    discover_status: { $ifNull: ["$discovers.discover_status", 4] },
                    user: {
                        _id: "$_id",
                        industryType: "$industryType",
                        myConnection: "$myConnection",
                        experience: "$experience",
                        discover_status: { $ifNull: ["$discovers.discover_status", 4] },
                        name: { $concat: [{ $ifNull: ["$firstName", ""] }, " ", { $ifNull: ["$lastName", ""] }] },
                        profilePicUrl: "$profilePicUrl",
                        profession: { $ifNull: ["$profession", ""] },
                        about: { $ifNull: ["$about", ""] }
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

    /**
     * @description to check the discvoever status previous
     * @param params 
     */
    async checkDiscover(params) {
        try {
            return await this.findOne('discover', params, {}, {});
        } catch (error) {
            throw error;
        }
    }
    /**
     * @description discvover request save
     * @param params 
     */
    async saveDiscover(params) {
        try {
            return await this.save('discover', params)
        } catch (error) {
            throw error;
        }
    }

    /**
     * @description delete request discover
     * @param params 
     */
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

    /**
     * @description shout card my connection
     * @param params 
     */
    async getShoutoutMyConnection(params) {
        try {
            let { userId } = params
            let query: any = {}
            query['discover_status'] = config.CONSTANT.DISCOVER_STATUS.ACCEPT
            query["$or"] = [
                { "userId": await appUtils.toObjectId(userId) },
                { "followerId": await appUtils.toObjectId(userId) }
            ]
            return await this.findAll('discover', query, {}, {});
        } catch (error) {
            throw error;
        }
    }

}

export const discoverDao = new DiscoverDao();