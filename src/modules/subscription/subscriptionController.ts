"use strict";
import { subscriptionDao } from "./subscriptionDao";
import { discoverDao } from '../discover/DiscoverDao'
import * as environment from '@config/environment'
import * as appUtils from "@utils/appUtils";

class ShoutoutController {

    /**
     * @function getDiscoverData
     * @description if IS_REDIS_ENABLE set to true,
     * than redisClient.storeList() function saves value in redis.
     */
    async saveSubscription(params, userId) {
        try {
            // let getData = await subscriptionDao.insert()
            // return shoutoutConstants.MESSAGES.SUCCESS.SHOUTOUT_DATA(getData)
        } catch (error) {
            throw error;
        }
    }

}
export const shoutoutController = new ShoutoutController();