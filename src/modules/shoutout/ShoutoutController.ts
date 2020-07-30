"use strict";
import * as shoutoutConstants from "./ShoutoutConstant";
import { shoutoutDao } from "./ShoutoutDao";
import * as appUtils from "@utils/appUtils";

class ShoutoutController {

    /**
     * @function getDiscoverData
     * @description if IS_REDIS_ENABLE set to true,
     * than redisClient.storeList() function saves value in redis.
     */
    async getShoutoutData(params, userId) {
        try {
            let getData = await shoutoutDao.getShoutoutData(params, userId)
            return shoutoutConstants.MESSAGES.SUCCESS.SHOUTOUT_DATA(getData)
        } catch (error) {
            throw error;
        }
    }
    /**
     * @function saveDiscoverData
     * @description if IS_REDIS_ENABLE set to true,
     * than redisClient.storeList() function saves value in redis.
     */
    async saveShoutoutData(params: ShoutoutRequest.ShoutoutRequestAdd, userId) {
        try {
            params['userId'] = userId.userId
            params['membersDetail'] = await appUtils.createMembersArray(params.members)
            delete params.members
            let checkDiscover = await shoutoutDao.saveShoutout(params)
            return shoutoutConstants.MESSAGES.SUCCESS.SUCCESSFULLY_ADDED(checkDiscover)
        } catch (error) {
            throw error;
        }
    }
    
}
export const shoutoutController = new ShoutoutController();