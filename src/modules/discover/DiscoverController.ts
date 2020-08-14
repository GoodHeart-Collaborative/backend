"use strict";
import * as homeConstants from "./DiscoverConstant";
import { discoverDao } from "./DiscoverDao";
import * as appUtils from "@utils/appUtils";

class DiscoverController {

    /**
     * @function Home
     * @description if IS_REDIS_ENABLE set to true,
     * than redisClient.storeList() function saves value in redis.
     */
    async getDiscoverData(params, userId) {
        try {
            let getData = await discoverDao.getDiscoverData(params, userId, false)
            return homeConstants.MESSAGES.SUCCESS.DISCOVER_DATA(getData)
        } catch (error) {
            throw error;
        }
    }
    async getUserData(params, userId) {
        try {
            let getData = await discoverDao.getUserData(params, userId)
            return homeConstants.MESSAGES.SUCCESS.DISCOVER_DATA(getData)
        } catch (error) {
            throw error;
        }
    }

    /** 7664
     * @function Home
     * @description if IS_REDIS_ENABLE set to true,
     * than redisClient.storeList() function saves value in redis.
     */
    async updateDiscoverData(params: DiscoverRequest.DiscoverRequestEdit, userId) {
        try {
            let query:any = {}
            query["_id"]= params.followerId
            userId.userId = await appUtils.toObjectId(userId.userId)
			query["$or"] = [{ userId: userId.userId }, { followerId: userId.userId }];
            let checkDiscover = await discoverDao.checkDiscover({followerId: params.followerId, userId: userId.userId})
            if(checkDiscover) {
                query = {_id: checkDiscover._id}
                await discoverDao.updateDiscover(query, { discover_status: params.discover_status })
                userId = userId.userId.toString()
                let getData = await discoverDao.getUserData({_id: params.followerId}, userId)
                getData.data[0].discover_status = params.discover_status
                return homeConstants.MESSAGES.SUCCESS.DISCOVER_DATA_UPDATED(getData.data[0])
            } else {
                return homeConstants.MESSAGES.ERROR.DISCOVER_NOT_FOUND
            }
        } catch (error) {
            throw error;
        }
    }
    async saveDiscoverData(params: DiscoverRequest.DiscoverRequestAdd, userId) {
        try {
            let checkDiscover = await discoverDao.checkDiscover({followerId: params.followerId, userId: userId.userId})
            if(checkDiscover) {
                let deleteDiscover = await discoverDao.deletedDiscover({followerId: params.followerId, userId: userId.userId})
                params["_id"] = params.followerId
                let getData = await discoverDao.getUserData(params, userId)
                return homeConstants.MESSAGES.SUCCESS.SUCCESSFULLY_REMOVE(getData.data[0])
            } else {
                params['userId'] = userId.userId
                await discoverDao.saveDiscover(params)
                let param:any = {}
                param["_id"] = params.followerId
                let getData = await discoverDao.getUserData(param, userId)
                return homeConstants.MESSAGES.SUCCESS.SUCCESSFULLY_ADDED(getData.data[0])
            }

        } catch (error) {
            throw error;
        }
    }
    
}
export const discoverController = new DiscoverController();