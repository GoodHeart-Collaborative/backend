"use strict";
import { subscriptionDao } from "./subscriptionDao";
import * as environment from "@config/environment"
import * as appUtils from "@utils/appUtils";
import { CONSTANT } from "@config/constant";
import { inAppSubscription } from "@utils/InAppSubscription";

class SubscriptionController {

    /**
     * @function createSubscription
     * @description this function is used for creating subscription for ios and android
     * than redisClient.storeList() function saves value in redis.
     */
    async createSubscription(params) {
        try {
            console.log(params);
            let tokenData;
            if (params.platform == CONSTANT.DEVICE_TYPE.ANDROID) {
                tokenData = await inAppSubscription.verifyAndroidSubscription(params.subscription_type, params.receiptToken);
            } else if (params.platform == CONSTANT.DEVICE_TYPE.IOS) {
                tokenData = await inAppSubscription.verifyIosInAppToken(params.receiptToken);
                console.log("Subscription Data", tokenData);

                if (! tokenData.flag) {
                    return CONSTANT.MESSAGES.ERROR.INTERNAL_SERVER_ERROR;
                }

                console.log("////////////////// Token ///////////" , tokenData.data.latest_receipt_info[0]);
                const purchaseInfo: any = tokenData.data.latest_receipt_info[0];
                params.endDate = parseInt(purchaseInfo.expires_date_ms);
                params.isSubscribed = true;
                await subscriptionDao.saveUserSubscription(params);
            }

            console.log(tokenData);
            // let getData = await subscriptionDao.insert()
            // return shoutoutConstants.MESSAGES.SUCCESS.SHOUTOUT_DATA(getData)
            return { subscriptionEndDate: params.endDate, isSubscribed: true , subscriptionType: params.subscriptionType };
        } catch (error) {
            throw error;
        }
    }

    async subscriptionCallback(params){
        try {
            console.log(params);
            
            // let getData = await subscriptionDao.insert()
            // return shoutoutConstants.MESSAGES.SUCCESS.SHOUTOUT_DATA(getData)
            return params;
        } catch (error) {
            throw error;
        }
    }

}
export const subscriptionController = new SubscriptionController();