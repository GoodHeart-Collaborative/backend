"use strict";
import { subscriptionDao } from "./subscriptionDao";
import { discoverDao } from '../discover/DiscoverDao'
import * as environment from '@config/environment'
import * as appUtils from "@utils/appUtils";

class SubscriptionController {

    /**
     * @function createSubscription
     * @description this function is used for creating subscription for ios and android
     * than redisClient.storeList() function saves value in redis.
     */
    async createSubscription(params) {
        try {
            // let getData = await subscriptionDao.insert()
            // return shoutoutConstants.MESSAGES.SUCCESS.SHOUTOUT_DATA(getData)
        } catch (error) {
            throw error;
        }
    }

}
export const subscriptionController = new SubscriptionController();