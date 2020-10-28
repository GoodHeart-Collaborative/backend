"use strict";
import { BaseDao } from "@modules/base/BaseDao";
import * as config from "@config/index";
import * as appUtils from "@utils/appUtils";
import { CONSTANT } from "@config/index";


export class SubscriptionDao extends BaseDao {
    async saveSubscription(params, userId) {
        try {
            const insertData = {
                ...params,
                created: Date.now(),
                userId: appUtils.toObjectId(userId.userId),
                subscriptionPlatform: params.platform
            };
            console.log('insertDatainsertData', insertData);

            const data = await this.insert('subscription', insertData, {});
            // return result
        } catch (error) {
            throw error;
        }

    }

    async saveUserSubscription(params) {
        try {
            console.log("params", params);
            const query: any = {};
            query.userId = params.userId;
            query.transaction_id = params.transaction_id;
            query.receiptToken = params.receiptToken;
            query.subscriptionType = params.subscriptionType;
            query.amount = params.amount || 0;
            query.startDate = params.startDate;
            query.subscriptionEndDate = params.endDate || 0;

            return await this.save("subscription", query);
        } catch (error) {
            throw error;
        }

    }

    async updateUserSubscription(params) {
        try {
            console.log("paramsupdateUserSubscriptionupdateUserSubscription", params);
            const query: any = {};
            const update: any = {};
            query._id = params.userId;

            update.subscriptionType = params.subscriptionType;
            update.subscriptionEndDate = params.endDate;
            update.isSubscribed = params.isSubscribed;


            return await this.findOneAndUpdate("users", query, update, {});
        } catch (error) {
            return Promise.reject(error);
        }
    }

    async getUserPreviousSubscription(params) {
        try {

            const query: any = {};
            query.userId = { $ne: params.userId };
            query.receiptToken = params.receiptToken;
            query.subscriptionEndDate = { $gt: params.todayDate };

            return await this.findOne("subscription", query, {}, {});
        } catch (error) {
            return Promise.reject(error);
        }
    }

    async getSubscriptionByTransactionId(params) {
        try {

            const query: any = {};
            query.userId = { $ne: params.userId };
            query.transaction_id = params.transaction_id;
            query.subscriptionEndDate = { $gt: params.todayDate };

            return await this.findOne("subscription", query, {}, {});
        } catch (error) {
            return Promise.reject(error);
        }
    }

}

export const subscriptionDao = new SubscriptionDao();