"use strict";
import { subscriptionDao } from "./subscriptionDao";
import { IN_APP } from "@config/environment";
import * as appUtils from "@utils/appUtils";
import { CONSTANT } from "@config/constant";
import { inAppSubscription } from "@utils/InAppSubscription";
import * as config from "@config/index";

class SubscriptionController {

    /**
     * @function createSubscription
     * @description this function is used for creating subscription for ios and android
     * than redisClient.storeList() function saves value in redis.
     */
    async createSubscription(params) {
        try {
          console.log("Subscription", params);
            let tokenData;
            const endDate = {};
            if (params.platform == CONSTANT.DEVICE_TYPE.ANDROID) {
                tokenData = await inAppSubscription.verifyAndroidSubscription(params.subscriptionType, params.receiptToken);
                console.log("puchase details", tokenData);
                if (tokenData) {
                    params.startDate = tokenData.startTimeMillis;
                    params.endDate = parseInt(tokenData.expiryTimeMillis);
                    params.isSubscribed = true;
                    params.transaction_id = tokenData.orderId;
                }
            } else if (params.platform == CONSTANT.DEVICE_TYPE.IOS) {
                console.log("Request", params);
                tokenData = await inAppSubscription.verifyIosInAppToken(params.receiptToken);

                if (!tokenData.flag) {
                  console.log("Request", tokenData);
                    return Promise.reject(CONSTANT.MESSAGES.ERROR.INTERNAL_SERVER_ERROR);
                }

                console.log("////////////////// Token ///////////", tokenData.data.latest_receipt_info[0]);
                const purchaseInfo: any = tokenData.data.latest_receipt_info[0];

                params['endDate'] = parseInt(purchaseInfo.expires_date_ms);

                if (params['endDate'] < new Date().getTime()) {
                  return Promise.reject(CONSTANT.MESSAGES.ERROR.SUBSCRIPTION_EXPIRED);
                }

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
                return { isSubscribed: false };
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
          console.log("************** Getting Callback from ios ", params.notification_type, params.latest_receipt_info.original_transaction_id);
          params.endDate = parseInt(params.latest_receipt_info.expires_date_ms);
          params.startDate = parseInt(params.latest_receipt_info.original_purchase_date_ms) || new Date().getTime();
          let user: any = {};
          let saveData: any = {};
          let subSave: any = {};
    
          if (params.latest_receipt_info.original_transaction_id) {
            user = await subscriptionDao.findSubscriptionByTransactionId({
                transaction_id: params.latest_receipt_info.original_transaction_id 
            });
          }
          switch (params.notification_type) {
            case IN_APP.IOS_CALLBACK.CANCEL:
              console.log("Cancelled");
              break;
            case IN_APP.IOS_CALLBACK.DID_CHANGE_RENEWAL_PREF:
              console.log("DID_CHANGE_RENEWAL_PREF");
              break;
            case IN_APP.IOS_CALLBACK.DID_CHANGE_RENEWAL_STATUS:
              console.log("DID_CHANGE_RENEWAL_STATUS");
              break;
    
            case IN_APP.IOS_CALLBACK.DID_FAIL_TO_RENEW:
              console.log("DID_FAIL_TO_RENEW");
              await subscriptionDao.makeUserSubscriptionInactove(params);
    
              break;
    
            case IN_APP.IOS_CALLBACK.DID_RECOVER:
              console.log("DID_RECOVER");
              this.updateSubscription(user, params);
              break;
    
            case IN_APP.IOS_CALLBACK.INITIAL_BUY:
              console.log("INITIAL_BUY");
              break;
    
            case IN_APP.IOS_CALLBACK.INTERACTIVE_RENEWAL:
              console.log("INTERACTIVE_RENEWAL");
    
              this.updateSubscription(user, params);
    
              break;
    
            case IN_APP.IOS_CALLBACK.RENEWAL:
              console.log("Renewal");
              this.updateSubscription(user, params);
              break;
            case IN_APP.IOS_CALLBACK.REFUND:
              console.log("Refund");
              break;
            default:
              console.log("Sorry No case matched");
          }
          return {};
        } catch (error) {
          return Promise.reject(error);
        }
      }

      async updateSubscription(user, params) {
        let saveData: any = {};
        await subscriptionDao.makeSusbcriptionInactive(params)
        saveData["userId"] = user.userId;
        saveData["receiptToken"] = user.receipt_token;
        saveData["subscriptionType"] = user.subscriptionType;
        saveData["transactionId"] = params.latest_receipt_info.original_transaction_id;
        saveData["subscriptionRenewalType"] = IN_APP.SUBSCRIPTION_TYPE.RENEWAL;
        saveData["deviceType"] = CONSTANT.DEVICE_TYPE.IOS;
        saveData["startDate"] = params.startDate;
        saveData["endDate"] = params.endDate;
        saveData["price"] = 0;
        saveData["status"] = CONSTANT.SUBSCRIPTION_STATUS.ACTIVE;
        saveData["price"] = params.price;
        let subSave = await subscriptionDao.saveUserSubscription(saveData);
        if (subSave) {
    
          let subscriptionType = config.CONSTANT.USER_SUBSCRIPTION_PLAN.FREE.value;
          if (params.latest_receipt_info.is_trial_period === "false") {
            // Subscriber in good standing (paid)
            if (params.subscriptionType == 1) {
              subscriptionType = config.CONSTANT.USER_SUBSCRIPTION_PLAN.MONTHLY.value;
            } else {
              subscriptionType = config.CONSTANT.USER_SUBSCRIPTION_PLAN.YEARLY.value;
            }
          } else if (params.latest_receipt_info.is_trial_period === "true") {
            // Subscriber in free trial
            subscriptionType = config.CONSTANT.USER_SUBSCRIPTION_PLAN.NONE.value;
          }

          params.subscriptionType = subscriptionType;
          params.subscriptionEndDate = params.endDate;
          params.isSubscribed = true;
    
          await subscriptionDao.updateUserSubscription({})

        }
    }

    async verifySubscriptionRenewal() {
        try {
            const params: any = {};
            const todayDate = await appUtils.todayDateTimeStamp(new Date());
            const previousDate = await appUtils.previousDate(new Date());

            let subscriptionData = await subscriptionDao.lastSubscription({deviceType: CONSTANT.DEVICE_TYPE.ANDROID });

            subscriptionData.forEach(async (subs) => {
                    // ******** Manage Verification of android inapp subscrition renewal ******** //
                    const tokenDetails = await inAppSubscription.verifyAndroidSubscription(subs.subscription_id, subs.receipt_token, false);
                    console.log("******************Received token data", tokenDetails);
                    let saveData = {};
                    if (tokenDetails && tokenDetails.paymentState == 1 && tokenDetails.expiryTimeMillis > todayDate) {
                        params.startDate = tokenDetails.startTimeMillis;
                        params.endDate = parseInt(tokenDetails.expiryTimeMillis);
                        params.isSubscribed = true;
                        params.transaction_id = tokenDetails.orderId;
                        let subSave = await subscriptionDao.saveUserSubscription(params);
           
                        if (subSave) {
                            await subscriptionDao.updateUserSubscription({
                                isSubscribed: true,
                                subscription_type: subs.subscription_id,
                                endDate: tokenDetails.expiryTimeMillis,
                                userId: subs.userId
                            });
                        }
                    } else {
                        if (subs.tries < 1) {
                            await subscriptionDao.updateUserSubscription({
                                isSubscribed: false,
                                subscriptionType: config.CONSTANT.USER_SUBSCRIPTION_PLAN.NONE.value,
                                endDate: tokenDetails.expiryTimeMillis,
                                userId: subs.userId
                            });
                        }

                        console.log(typeof subs.tries, subs.tries);
                        if (subs.tries < 6) {
                            await subscriptionDao.updateSubscription({
                                tries: subs.tries + 1,
                                subscriptionId: subs._id
                            });

                        } else {
                            await subscriptionDao.updateSubscription({
                                tries: subs.tries + 1,
                                isRenewTried: true,
                                status: CONSTANT.SUBSCRIPTION_STATUS.ACTIVE,
                                subscriptionId: subs._id
                            });
                        }
                    }
            });

            // Ios verification
            let iosSubscriptionData = await subscriptionDao.lastSubscription({deviceType: CONSTANT.DEVICE_TYPE.IOS });

            iosSubscriptionData.forEach(async (subs) => {

                                await subscriptionDao.updateUserSubscription({
                                    isSubscribed: false,
                                    subscriptionType: config.CONSTANT.USER_SUBSCRIPTION_PLAN.NONE.value,
                                    userId: subs.userId
                                });

                                await subscriptionDao.updateSubscription({status: CONSTANT.SUBSCRIPTION_STATUS.ACTIVE ,  subscriptionId: subs._id });

            });

            return true;
        } catch (err) {
            console.log("Getting error in verify subscription **********************", err);
            throw err;
        }
    }

}
export const subscriptionController = new SubscriptionController();