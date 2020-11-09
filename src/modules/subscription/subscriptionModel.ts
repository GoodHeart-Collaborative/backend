"use strict";

// import * as autoIncrement from "@modules/category/node_modules/mongoose-auto-increment";
// import * as bcrypt from "bcrypt";
import * as mongoose from "mongoose";
import { Schema, Model, Document } from "mongoose";

import * as appUtils from "@utils/appUtils";
import * as config from "@config/index";
import { ElasticSearch } from "@lib/ElasticSearch";
import { IN_APP } from "@config/environment";
import { CONSTANT } from "@config/index";

const elasticSearch = new ElasticSearch();

// const connection = mongoose.createConnection(config.SERVER.MONGO.DB_URL + config.SERVER.MONGO.DB_NAME, config.SERVER.MONGO.OPTIONS);
// autoIncrement.initialize(connection);

export interface Isubscription extends Document {
    // sno: string;
    userId: string;
    receiptToken: string;
    subscriptionType: number;
    transactionId: string;
    price: number;
    status: number;
    created: number;
    subscriptionEndDate: number;
}


const subscriptionSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, required: true },
    //planType
    subscriptionType: {
        type: Number, enum: [
            config.CONSTANT.USER_SUBSCRIPTION_PLAN.FREE.value,
            config.CONSTANT.USER_SUBSCRIPTION_PLAN.MONTHLY.value,
            config.CONSTANT.USER_SUBSCRIPTION_PLAN.YEARLY.value,
            config.CONSTANT.USER_SUBSCRIPTION_PLAN.NONE.value,
        ],
        default: config.CONSTANT.USER_SUBSCRIPTION_PLAN.NONE.value,

    },
    price: {
        type: Number, enum: [
            config.CONSTANT.USER_SUBSCRIPTION_PLAN.FREE.price,
            config.CONSTANT.USER_SUBSCRIPTION_PLAN.MONTHLY.price,
            config.CONSTANT.USER_SUBSCRIPTION_PLAN.YEARLY.price,
            config.CONSTANT.USER_SUBSCRIPTION_PLAN.NONE.price,
        ],
        default: config.CONSTANT.USER_SUBSCRIPTION_PLAN.MONTHLY.price,

    },
    status: {
        type: Number, enum: [
            config.CONSTANT.SUBSCRIPTION_STATUS.ACTIVE,
            config.CONSTANT.SUBSCRIPTION_STATUS.INACTIVE,
        ],
        default: config.CONSTANT.SUBSCRIPTION_STATUS.ACTIVE,

    },
    transactionId: { type: String },
    amount: { type: Number },
    tries: { type: Number, default: 0 },
    created: { type: Number },
    deviceType: { type: Number , enum: [
        CONSTANT.DEVICE_TYPE.ANDROID,
        CONSTANT.DEVICE_TYPE.IOS
    ] },
    receiptToken: { type: String },
    subscriptionRenewalType: {
        type: Number, enum: [
            IN_APP.SUBSCRIPTION_TYPE.RENEWAL,
            IN_APP.SUBSCRIPTION_TYPE.NON_RENEWAL
        ],
        default: IN_APP.SUBSCRIPTION_TYPE.RENEWAL
    },
    isRenewTried: { type: Boolean, default: false },
    startDate: { type: Date, required: true, default: new Date() },
    subscriptionEndDate: { type: Number, required: true }
}, {
        versionKey: false,
        timestamps: true
    });

subscriptionSchema.set("toObject", {
    virtuals: true,
});

subscriptionSchema.methods.toJSON = function () {
    const object = appUtils.clean(this.toObject());
    return object;
};
/* Crate 2dsphere index */


export const subscription: Model<Isubscription> = mongoose.model<Isubscription>(config.CONSTANT.DB_MODEL_REF.SUBSCRIPTION, subscriptionSchema);