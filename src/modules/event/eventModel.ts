"use strict";
import * as mongoose from "mongoose";
import { Schema, Model, Document } from "mongoose";
import * as appUtils from "@utils/appUtils";
import * as config from "@config/index";
import * as shortid from 'shortid';

export interface Ievent extends Document {
    userId: string,
    location: any;
    title: string,
    privacy: string;
    startDate: number;
    endDate: number;
    price: number;
    url: string;
    allowSharing: number;
    description: string;
    goingCount: number;
    interestCount: number;
    eventCategory: string,
    created: number;
    isFeatured: boolean;
    eventCategoryName: string;
    eventCategoryId: string;
    eventCategoryImage: string;
    isEventFree: boolean;
    isVirtual: string;
}
var geoSchema = new Schema({
    // location: { type: String, trim: true, required: true, default: '' },
    type: { type: String, default: "Point" },
    coordinates: { type: [Number], index: "2dsphere", default: [0, 0] }// [lngitude, latitude]
}, {
    _id: false
});

const eventSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, required: true, ref: 'users', index: true },
    userType: {
        type: String, required: true, enum: [
            config.CONSTANT.ACCOUNT_LEVEL.ADMIN,
            config.CONSTANT.ACCOUNT_LEVEL.USER
        ]
    },
    privacy: {
        type: String, enum: [
            config.CONSTANT.PRIVACY_STATUS.PRIVATE,
            config.CONSTANT.PRIVACY_STATUS.PROTECTED,
            config.CONSTANT.PRIVACY_STATUS.PUBLIC
        ]
    },
    isFeatured: { type: Boolean, default: false, index: true },
    startDate: { type: Number, index: true },
    endDate: { type: Number, index: true },
    location: geoSchema,
    isEventFree: { type: Boolean, required: true },
    address: { type: String, trim: true, required: true, index: true },
    price: { type: Number },
    title: { type: String, trim: true, required: true },
    description: { type: String, trim: true, required: true },
    status: {
        type: String,
        enum: [
            config.CONSTANT.STATUS.BLOCKED,
            config.CONSTANT.STATUS.ACTIVE,
            config.CONSTANT.STATUS.DELETED
        ],
        default: config.CONSTANT.STATUS.ACTIVE
    },
    eventCategoryImage: { type: String, trim: true },
    imageUrl: { type: String },
    eventUrl: { type: String },
    shareUrl: { type: String },
    allowSharing: { type: Number },
    shortId: { type: String, default: shortid.generate, unique: true },
    goingCount: { type: Number, default: 0 },
    eventCategoryName: { type: String },
    eventCategoryId: { type: Schema.Types.ObjectId, required: true },
    interestCount: { type: Number, default: 0 },
    created: { type: Number },
    isVirtual: { type: Boolean }

}, {
    versionKey: false,
    timestamps: true
});

eventSchema.set("toObject", {
    virtuals: true
});

eventSchema.methods.toJSON = function () {
    const object = appUtils.clean(this.toObject());
    return object;
};

// Export shoutout
export const event: Model<Ievent> = mongoose.model<Ievent>(config.CONSTANT.DB_MODEL_REF.EVENT, eventSchema);
