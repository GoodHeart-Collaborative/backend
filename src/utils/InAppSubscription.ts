//import * as config from "config";

import { google, androidpublisher_v3 } from "googleapis";
import * as CONFIG from "../config";
const key = require("./../../google_auth.json");
import { IN_APP } from "@config/environment";
import { CONSTANT } from "@config/constant";
import * as request from "request-promise";
import * as appUtils from "@utils/appUtils";

export class InAppSubscription {
    public publisher;
    public packageName: string;
    private iap: any;

    constructor() {
        let client = new google.auth.JWT(
            key.client_email,
            undefined,
            key.private_key,
            ["https://www.googleapis.com/auth/androidpublisher"]
        );

        this.publisher = new androidpublisher_v3.Resource$Purchases$Subscriptions({
            _options: { auth: client }
        });
    }

    /**
     * @description verifies the subscription status
     * @param productId - id of the product subscribed
     * @param purchaseToken - the unique token string
     */
    async verifyAndroidSubscription(subscriptionId: any, purchaseToken: string, ack: boolean = true) {
        try {
            console.log("*****************", IN_APP.ANDROID.SUBSCRIPTIONS[subscriptionId.toString()],
                IN_APP.ANDROID.ANDROID_PACKAGE_NAME, subscriptionId, purchaseToken);
            let subscription = await this.publisher.get({
                subscriptionId: IN_APP.ANDROID.SUBSCRIPTIONS[subscriptionId.toString()],
                token: purchaseToken,
                packageName: IN_APP.ANDROID.ANDROID_PACKAGE_NAME
            });

            if (!subscription.config && subscription.config.data) {
                return Promise.reject(CONSTANT.MESSAGES.ERROR.SOMETHING_WENT_WRONG);
            }

            if (ack) {
                await this.acknowledgeAndroidSubscription(subscriptionId, purchaseToken);
            }

            subscription = subscription.data;
            subscription.startTimeMillis = parseInt(subscription.startTimeMillis);
            subscription.expiryTimeMillis = parseInt(subscription.expiryTimeMillis);

            return subscription;
        } catch (err) {
            console.log("Error from subscription", err);
            return Promise.reject(err);
        }
    }

    /**
   * @description verifies the subscription status
   * @param productId - id of the product subscribed
   * @param purchaseToken - the unique token string
   */
    async acknowledgeAndroidSubscription(subscriptionId: string, purchaseToken: string) {
        try {
            const ack = await this.publisher.acknowledge({
                subscriptionId: IN_APP.ANDROID.SUBSCRIPTIONS[subscriptionId],
                token: purchaseToken,
                packageName: IN_APP.ANDROID.ANDROID_PACKAGE_NAME
            });
            console.log("acknowlegded ***************", ack);
            return ack;

        } catch (error) {
            console.log("Error while acknowledging android in app", error)
            return Promise.reject(error);
        }
    }

    async verifyIosInAppToken(receipt) {
        try {
            let data: any = await request({
                method: "POST",
                uri: IN_APP.IOS.LIVE_URL,
                body: {
                    "receipt-data": receipt,
                    "password": IN_APP.IOS.LIVE_SHARED_SECRET // APP_SECRETS.INAPPAPPLESECRET
                },
                json: true // Automatically stringifies the body to JSON
            });

            if (!data.latest_receipt_info) {
                data = await request({
                    method: "POST",
                    uri: IN_APP.IOS.SANDBOXURL,
                    body: {
                        "receipt-data": receipt,
                        "password": IN_APP.IOS.LIVE_SHARED_SECRET // APP_SECRETS.INAPPAPPLESECRET
                    },
                    json: true // Automatically stringifies the body to JSON
                });
            }

            if ( ! data.latest_receipt_info ){
                return Promise.reject(CONSTANT.MESSAGES.ERROR.SOMETHING_WENT_WRONG);
            }

            // process.exit(1);
            data.latest_receipt_info.sort((a, b) => b.purchase_date_ms - a.purchase_date_ms);
            
            return { flag: true, data };
        } catch (error) {
            console.log("in app eror", error);
            return { flag: false, error };
        }

    }

    async verifyIosInAppTokenToGetOriginalTransactionId(receipt) {
        try {
            let data: any = await request({
                method: "POST",
                uri: IN_APP.IOS.LIVE_URL,
                body: {
                    "receipt-data": receipt,
                    "password": IN_APP.IOS.LIVE_SHARED_SECRET // APP_SECRETS.INAPPAPPLESECRET
                },
                json: true // Automatically stringifies the body to JSON
            });
    
            if (!data.latest_receipt_info) {
                data = await request({
                    method: "POST",
                    uri: IN_APP.IOS.SANDBOXURL,
                    body: {
                        "receipt-data": receipt,
                        "password": IN_APP.IOS.LIVE_SHARED_SECRET // APP_SECRETS.INAPPAPPLESECRET
                    },
                    json: true // Automatically stringifies the body to JSON
                });
            }
    
            console.log(data);
    
            if ( ! data.latest_receipt_info ){
                return Promise.resolve({
                    message: CONSTANT.MESSAGES.SUCCESS.USER_NOT_SUBSCRIBED,
                    data: {
                        isSubscribed: false
                    }, code: 200
                });
            }
            // process.exit(1);
            data.latest_receipt_info.sort((a, b) => b.purchase_date_ms - a.purchase_date_ms);
            return { flag: true, data };
        } catch (error) {
            console.log("in app eror", error);
            return { flag: false, error };
        }
    
    }

}
export const inAppSubscription = new InAppSubscription();