"use strict";
import { BaseDao } from "@modules/base/BaseDao";
import * as config from "@config/index";
import * as appUtils from "@utils/appUtils";
import { CONSTANT, IN_APP } from "@config/index";


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
            query.deviceType = (params.platform).toString();
            query.amount = params.amount || 0;
            query.startDate = params.startDate;
            query.subscriptionEndDate = params.endDate || 0;

            return await this.save("subscription", query);
        } catch (error) {
            throw error;
        }

    }

    async findSubscriptionByTransactionId(params) {
        try {
            const query: any = {};

            query.transactionId = params.transactionId;

            return await this.findOne("subscription", query, {}, {});
        } catch (error) {
            return Promise.reject(error);
        }
    }

    async updateUserSubscription(params) {
        try {
            const query: any = {};
            const update: any = {};
            query._id = params.userId;

            update.subscriptionType = params.subscriptionType;
            update.subscriptionEndDate = params.endDate;
            update.isSubscribed = params.isSubscribed;
            update.subscriptionPlatform = (params.platform).toString();


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

    async makeSusbcriptionInactive(params) {
        try {

            const query: any = {};
            const update: any = {};

            query.userId = params.userId;

            update.status = CONSTANT.SUBSCRIPTION_STATUS.INACTIVE;

            return await this.updateMany("subscription", query, update, {});
        } catch (error) {
            return Promise.reject(error);
        }
    }

    async makeUserSubscriptionInactove(params) {
        try {

            const query: any = {};
            const update: any = {};

            query.userId = params.userId;

            update.subscriptionType = config.CONSTANT.USER_SUBSCRIPTION_PLAN.NONE.value;
            update.isSubscribed = false;

            return await this.updateOne("subscription", query, update, {});
        } catch (error) {
            return Promise.reject(error);
        }
    }

    async lastSubscription(params) {
        const todayDate = await appUtils.todayDateTimeStamp(new Date());
        const query: any = {};

        query.status = CONSTANT.SUBSCRIPTION_STATUS.ACTIVE;
        query.subscriptionEndDate = { $lte: todayDate };
        query.tries = { $lt: 7 };
        query.deviceType = params.deviceType;
        query.isRenewTried = false;
        query.subscriptionRenewalType = IN_APP.SUBSCRIPTION_TYPE.RENEWAL;

        return await this.findAll("subscription", query, {}, {});
    }

    async updateSubscription(params) {
        const query: any = {};
        const update: any = {};

        query._id = params.subscriptionId;

        if (params.tries) {
            update.tries = params.tries;
        }

        if (params.isRenewTried) {
            update.isRenewTried = params.isRenewTried;
        }

        if (params.status) {
            update.status = params.status;
        }

        return await this.findAll("subscription", query, {}, {});
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