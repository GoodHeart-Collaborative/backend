"use strict";
import { BaseDao } from "@modules/base/BaseDao";
import * as config from "@config/index";
import * as appUtils from "@utils/appUtils";


export class DiscoverDao extends BaseDao {
    async getDiscoverData(params, userId, isMyConnection) {
        try {
            let { pageNo, limit, searchKey  } = params
            let match: any = {};
            let aggPipe = [];
            let result: any = {}
            userId = await appUtils.toObjectId(userId.userId)
            if(isMyConnection) {
                match["$or"] = [
                    { "userId": userId },
                    { "followerId": userId }
                ];
                match['discover_status'] = config.CONSTANT.DISCOVER_STATUS.ACCEPT
            } else {
                match["followerId"] = userId
                match['discover_status'] = {$ne: config.CONSTANT.DISCOVER_STATUS.ACCEPT}
            }
            aggPipe.push({ "$sort": { "createdAt": 1 } })
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
            aggPipe.push({ '$unwind': { path: '$followers', preserveNullAndEmptyArrays: true } })
            aggPipe.push({ $project:
                {
                    _id: 1,
                    discover_status:1,
                    user: {
                        $cond:[{ $and: [ { $eq: [ "$userId", userId ] } ]}, {
                            _id: "$followers._id",
                            name: { $ifNull: ["$followers.firstName", ""] },
                            profilePicUrl: "$followers.profilePicUrl",
                            profession: { $ifNull: ["$followers.profession", ""] }
                        }, {
                            _id: "$users._id",
                            name: { $ifNull: ["$users.firstName", ""] },
                            profilePicUrl: "$users.profilePicUrl",
                            profession: { $ifNull: ["$users.profession", ""] }
                        }]
                    },
                    createdAt: 1,
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
    async checkDiscover(params) {
        try {
            return await this.findOne('discover', params, {}, {});
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
            let updateData:any = {}
            updateData["$set"] = update
            return await this.updateOne('discover', query, updateData, {});
        } catch (error) {
            throw error;
        }
    }

}

export const discoverDao = new DiscoverDao();