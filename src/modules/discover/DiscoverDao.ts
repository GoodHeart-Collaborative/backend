"use strict";
import { BaseDao } from "@modules/base/BaseDao";
import * as config from "@config/index";
import * as appUtils from "@utils/appUtils";
import { CONSTANT } from "@config/index";
import { userDao } from "@modules/user";


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
            // const paginateOptions = {
            //     pageNo: pageNo || 1,
            //     limit: limit || 10
            // }

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
            aggPipe.push({ "$sort": { "_id": -1 } })
            if (discover_status) {
                match["discover_status"] = discover_status
            }
            aggPipe.push({ "$match": match })
            // aggPipe.push({
            //     $lookup: {
            //         "from": "users",
            //         "localField": "userId",
            //         "foreignField": "_id",
            //         "as": "users"
            //     }
            // })
            aggPipe.push({
                $lookup: {
                    "from": "users",
                    "as": "users",
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
                                    },
                                ]
                            }
                        }
                    }]
                }
            })

            aggPipe.push({ '$unwind': { path: '$users', preserveNullAndEmptyArrays: false } })
            // aggPipe.push({
            //     $lookup: {
            //         "from": "users",
            //         "localField": "followerId",
            //         "foreignField": "_id",
            //         "as": "followers"
            //     }
            // })
            aggPipe.push({
                $lookup: {
                    "from": "users",
                    "as": "followers",
                    let: { fId: '$followerId' },
                    pipeline: [{
                        $match: {
                            $expr: {
                                $and: [
                                    {
                                        $eq: ['$_id', '$$fId']
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
            aggPipe.push({ "$addFields": { created: { "$subtract": ["$createdAt", new Date("1970-01-01")] } } });
            aggPipe.push({ '$unwind': { path: '$followers', preserveNullAndEmptyArrays: false } })
            if (ShoutoutConnection) {
                aggPipe.push({
                    $project:
                    {
                        _id: 0,
                        user: {
                            $cond: [{ $and: [{ $eq: ["$userId", userId] }] }, {
                                _id: "$followers._id",
                                // status: '$followers.status',
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
                                // status: '$users.status',
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
                if (searchKey) {
                    aggPipe.push({ "$match": { "user.name": { "$regex": searchKey, "$options": "-i" } } });
                }
                aggPipe.push({
                    $project:
                    {
                        _id: "$user._id",
                        industryType: "$user.industryType",
                        myConnection: "$user.myConnection",
                        experience: "$user.experience",
                        discover_status: "$user.discover_status",
                        name: "$user.name",
                        profilePicUrl: "$user.profilePicUrl",
                        profession: "$user.profession",
                        about: "$user.about",
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
            if (searchKey && !ShoutoutConnection) {
                aggPipe.push({ "$match": { "user.name": { "$regex": searchKey, "$options": "-i" } } });
            }
            if (ShoutoutConnection) {
                console.log('>>>>>>>>>>>>>>>');
                aggPipe = [...aggPipe, ...this.addSkipLimit(limit, pageNo)];
                result = await this.aggregateWithPagination('discover', aggPipe)
                console.log('resultresultresultresultresult', result);
                // result.data;
                // result = await this.aggregate('discover', aggPipe, {})
            } else {
                console.log('2@@@@@@<<<<<<<<<<<<<<<<<');
                aggPipe = [...aggPipe, ...this.addSkipLimit(limit, pageNo)];
                result = await this.aggregateWithPagination('discover', aggPipe)
                // result = await this.paginate('discover', aggPipe, limit, pageNo, {}, true)
            }
            return result
        } catch (error) {
            throw error;
        }
    }
    async getUserData(params, userId) {
        try {
            let { pageNo, limit, searchKey, _id, longitude, latitude, distance, industryType, getIpfromNtwk } = params
            let aggPipe = [];
            let result: any = {}
            let searchDistance = distance ? distance * 1000 : 100 * 1000// Default value is 10 km.
            let pickupLocation = [];
            let match: any = {};


            if (longitude == undefined && latitude == undefined) {
                const lat_lng: any = await appUtils.getLocationByIp(getIpfromNtwk);
                console.log('lat_lnglat_lng>>>>>>>>>>>>>>>>>>>>', lat_lng);
                latitude = lat_lng.lat;
                longitude = lat_lng.long;
            }

            if (distance && longitude != undefined && latitude != undefined) {
                pickupLocation.push(longitude, latitude);
                aggPipe.push(
                    {
                        '$geoNear': {
                            near: { type: "Point", coordinates: pickupLocation },
                            spherical: true,
                            maxDistance: searchDistance,
                            distanceField: "dist",
                        }
                    },
                    { "$sort": { distanceField: -1 } }
                )
            } else {
                pickupLocation.push(longitude, latitude);
                aggPipe.push(
                    {
                        '$geoNear': {
                            near: { type: "Point", coordinates: pickupLocation },
                            spherical: true,
                            distanceField: "dist",
                        }
                    },
                    { "$sort": { distanceField: -1 } }
                )
            }
            if (pageNo === 1) {
                params['location'] = {
                    "type": "Point",
                    "coordinates": [
                        longitude,
                        latitude,
                    ]
                }
                userDao.findByIdAndUpdate('users', { _id: userId.userId }, params, {});
            }

            aggPipe.push({
                $project: {
                    _id: 1,
                    status: 1,
                    industryType: 1,
                    myConnection: 1,
                    experience: 1,
                    name: { $concat: [{ $ifNull: ["$firstName", ""] }, " ", { $ifNull: ["$lastName", ""] }] },
                    profilePicUrl: 1,
                    profession: { $ifNull: ["$profession", ""] },
                    about: { $ifNull: ["$about", ""] },
                    created: 1,
                    adminStatus: 1,
                    createdAt: 1,

                }
            })

            userId = await appUtils.toObjectId(userId.userId)
            // aggPipe.push({ "$match": { _id: { "$ne": userId } } });
            if (_id) {
                match["_id"] = await appUtils.toObjectId(_id)
                // aggPipe.push({ "$match": { "_id": await appUtils.toObjectId(_id) } })
                pageNo = 1
                limit = 1
            } else {
                match = {
                    // "_id": { "$ne": userId },
                    adminStatus: CONSTANT.USER_ADMIN_STATUS.VERIFIED,
                    status: CONSTANT.STATUS.ACTIVE
                }
            }

            if (industryType) {
                match["industryType"] = { $in: industryType }
                // aggPipe.push({ "$match": { industryType: { $in: industryType } } })
            }
            if (searchKey) {
                match["name"] = { "$regex": searchKey, "$options": "i" }
                // aggPipe.push({ "$match": { "firstName": { "$regex": searchKey, "$options": "-i" } } });
            }
            aggPipe.push({ "$match": match });
            // aggPipe.push({ "$sort": { "createdAt": 1 } });



            // aggPipe.push({
            //     $lookup: {
            //         "from": "discovers",
            //         "localField": "_id",
            //         "foreignField": "followerId",
            //         "as": "discovers"
            //     }
            // })

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
                        'discovers1111': '$discovers.userId',
                        isRequestSendByMe: {
                            $cond: {
                                if: {
                                    $eq: ['$discovers.userId', userId]
                                }, then: true,
                                else: false
                            }
                        },
                        status: '$status',
                        _id: "$_id",
                        industryType: "$industryType",
                        myConnection: "$myConnection",
                        experience: "$experience",
                        discover_status: { $ifNull: ["$discovers.discover_status", 4] },
                        name: '$name',
                        profilePicUrl: "$profilePicUrl",
                        profession: '$profession',
                        about: "$about"
                    },
                    created: '$created'
                }
            })
            aggPipe.push({
                $match: {
                    _id: { $ne: appUtils.toObjectId(userId) }
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

    async getDiscoverStatus(params, tokenData) {
        try {
            const { otherUserId } = params;
            const aggPipe = [];
            // const otherUser = await userDao.findOne('users', { _id: params.otherUserId }, {}, {});

            // let idKey: string = '$otherUserId'
            // idKey = '$_idd'

            aggPipe.push({
                $match: {
                    _id: appUtils.toObjectId(tokenData.userId),
                }
            });
            // const userIdd = otherUserId
            aggPipe.push({
                $lookup: {
                    "from": "users",
                    let: { "users": appUtils.toObjectId(otherUserId), "user": appUtils.toObjectId(tokenData.userId) },
                    as: 'otherUserData',
                    pipeline: [{
                        $match: {
                            $expr: {
                                $and: [{
                                    $eq: ['$_id', '$$users']
                                },
                                {
                                    $eq: ['$status', config.CONSTANT.STATUS.ACTIVE]
                                }]
                            },
                        }
                    }]
                }
            })

            aggPipe.push({ '$unwind': { path: '$otherUserData', preserveNullAndEmptyArrays: true } })

            aggPipe.push({
                $lookup: {
                    from: "discovers", // "$userId",
                    let: { "users": appUtils.toObjectId(params.otherUserId), "user": appUtils.toObjectId(tokenData.userId) },
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
                        },
                    ],
                    as: "DiscoverData"
                }
            })

            aggPipe.push({ '$unwind': { path: '$DiscoverData', preserveNullAndEmptyArrays: true } })

            aggPipe.push({
                $project: {
                    discover_status: { $ifNull: ["$DiscoverData.discover_status", 4] },
                    isRequestSendByMe: {
                        $cond: {
                            if: {
                                $eq: ['$DiscoverData.userId', appUtils.toObjectId(tokenData.userId)]
                            }, then: true,
                            else: false
                        }
                    },
                    // name: { $concat: [{ $ifNull: ["$firstName", ""] }, " ", { $ifNull: ["$lastName", ""] }] },
                    _id: "$otherUserData._id",
                    connectionCount: '$otherUserData.myConnection',
                    // otherUserData: '$otherUserData',
                    // otherUserData: {
                    otherUserId: "$otherUserData._id",
                    industryType: "$otherUserData.industryType",
                    myConnection: "$otherUserData.myConnection",
                    experience: "$otherUserData.experience",
                    // discover_status: { $ifNull: ["$DiscoverData.discover_status", 4] },
                    name: { $concat: [{ $ifNull: ["$otherUserData.firstName", ""] }, " ", { $ifNull: ["$otherUserData.lastName", ""] }] },
                    profilePicUrl: "$otherUserData.profilePicUrl",
                    profession: { $ifNull: ["$otherUserData.profession", ""] },
                    about: { $ifNull: ["$otherUserData.about", ""] }
                    // },
                },
            });
            const data = await this.aggregate('users', aggPipe, {});
            console.log('datadatadatadata', data);


            const makeData = { ...data[0], }

            // data[0] = tokenData;

            return makeData; // data[0] ? data[0] : {};
        } catch (error) {
            return Promise.reject(error);

        }

    }

    async getUserById(params) {
        try {
            let { userId } = params
            let query: any = {}
            query["_id"] = await appUtils.toObjectId(userId)
            return await this.findOne('users', query, {}, {});
        } catch (error) {
            throw error;
        }
    }
}

export const discoverDao = new DiscoverDao();