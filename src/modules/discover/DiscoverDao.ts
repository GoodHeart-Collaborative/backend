"use strict";
import { BaseDao } from "@modules/base/BaseDao";
import * as config from "@config/index";
import * as appUtils from "@utils/appUtils";


export class DiscoverDao extends BaseDao {
    async getDiscoverData(params, userId, isMyConnection) {
        try {
            let { pageNo, limit  } = params
            let match: any = {};
            let aggPipe = [];
            let result: any = {}
            let localField: string = 'userId'
            if(isMyConnection) {
                match["userId"] = await appUtils.toObjectId(userId.userId)
                localField = 'followerId'
            } else {
                match["followerId"] = await appUtils.toObjectId(userId.userId)
            }
            aggPipe.push({ "$sort": { "createdAt": -1 } })
            aggPipe.push({ "$match": match })
            aggPipe.push({
                $lookup: {
                    "from": "users",
                    "localField": `${localField}`,
                    "foreignField": "_id",
                    "as": "users"
                }
            })
            aggPipe.push({ '$unwind': { path: '$users', preserveNullAndEmptyArrays: true } },
            { $project:
                {
                    _id: 1,
                    discover_status:1,
                    user: {
                        _id: "$users._id",
                        name: { $ifNull: ["$users.firstName", ""] },
                        profilePicUrl: "$users.profilePicUrl",
                        profession: { $ifNull: ["$users.profession", ""] }
                    },
                    createdAt: 1,
                }
            })
            // aggPipe = [...aggPipe, ...await this.addSkipLimit(limit, pageNo)];
            // result = await this.aggregateWithPagination("discover", aggPipe, limit, pageNo, true)
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