"use strict";
import { BaseDao } from "@modules/base/BaseDao";
import * as config from "@config/index";
import * as appUtils from "@utils/appUtils";
import { CONSTANT } from "@config/index";


export class SubscriptionDao extends BaseDao {
    async saveSubscription(params, userId) {
        try {
            console.log('paramsparamsparams', params, userId);

            const insertData = {
                ...params,
                userId: appUtils.toObjectId(userId.userId)
            };
            console.log('insertDatainsertData', insertData);

            const data = await this.insert('subscription', insertData, {});
            // return result
        } catch (error) {
            throw error;
        }

    }

}

export const subscriptionDao = new SubscriptionDao();