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
            let tokenData;
            if (params.platform == CONSTANT.DEVICE_TYPE.ANDROID) {
                tokenData = await inAppSubscription.verifyAndroidSubscription(params.subscription_type, params.receiptToken);
                console.log("puchase details", tokenData);
                if (tokenData) {
                    params.startDate = tokenData.startTimeMillis;
                    params.endDate = parseInt(tokenData.expiryTimeMillis);
                    params.isSubscribed = true;
                    params.transaction_id = tokenData.orderId;
                }
            } else if (params.platform == CONSTANT.DEVICE_TYPE.IOS) {
                tokenData = await inAppSubscription.verifyIosInAppToken(params.receiptToken);

                if (!tokenData.flag) {
                    return Promise.reject(CONSTANT.MESSAGES.ERROR.INTERNAL_SERVER_ERROR);
                }

                console.log("////////////////// Token ///////////", tokenData.data.latest_receipt_info[0]);
                const purchaseInfo: any = tokenData.data.latest_receipt_info[0];

                params['endDate'] = parseInt(purchaseInfo.expires_date_ms);
                params['isSubscribed'] = true;
                params["transaction_id"] = purchaseInfo.original_transaction_id;

                const previousSubscription = await subscriptionDao.getSubscriptionByTransactionId(params);

                if (previousSubscription) {
                    return Promise.reject(CONSTANT.MESSAGES.ERROR.APPLE_ID_ALRADY_IN_USE);
                }
            }

            await subscriptionDao.saveUserSubscription(params);
            await subscriptionDao.updateUserSubscription(params);

            // console.log(tokenData);
            // let getData = await subscriptionDao.insert()
            // return shoutoutConstants.MESSAGES.SUCCESS.SHOUTOUT_DATA(getData)
            return { subscriptionEndDate: params.endDate, isSubscribed: true, subscriptionType: params.subscriptionType, subscriptionPlatform: params.platform };
        } catch (error) {
            throw error;
        }
    }


    async checkUserSubscription(params) {
        try {
            const tokenDetail: any = await inAppSubscription.verifyIosInAppTokenToGetOriginalTransactionId(params.receipt_token);

            if (!tokenDetail.flag) {
                return Promise.resolve({
                message: CONSTANT.MESSAGES.SUCCESS.USER_SUBSCRIBED,
                data: {
                    isSubscribed: false
                }, code: 200
                });
            }

            console.log("////////////////// Token ///////////", tokenDetail.data.latest_receipt_info[0]);
            const purchaseInfo: any = tokenDetail.data.latest_receipt_info[0];
            params["transaction_id"] = purchaseInfo.original_transaction_id;
            console.log("Token Details", purchaseInfo);
            const previousSubscription = await subscriptionDao.getSubscriptionByTransactionId(params);

            console.log("*******************Previous User Subscription####################", previousSubscription);
            if (!previousSubscription) {
                return { isSubscribed: false };
            }
            
            return { isSubscribed: true };
        } catch (error) {
            throw error;
        }
    }

    async subscriptionCallback(params) {
        try {
            console.log("************************************Subscription Callback response from ios inapp purchase *******************");
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