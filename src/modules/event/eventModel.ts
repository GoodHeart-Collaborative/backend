"use strict";
import * as mongoose from "mongoose";
import { Schema, Model, Document } from "mongoose";
import * as appUtils from "@utils/appUtils";
import * as config from "@config/index";
// import * as 

export interface Ievent extends Document {
    userId: string,
    // categoryId: string;
    // name: string;
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
    // eventCategoryType: string;
    // eventCategoryDisplayName: string;
    eventCategoryId: string;
}

const eventSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, required: true, ref: 'users', index: true },
    // categoryId:{type:Schema.Types.ObjectId },
    // name: { type: String, index: true },
    privacy: {
        type: String, enum: [
            config.CONSTANT.PRIVACY_STATUS.PRIVATE,
            config.CONSTANT.PRIVACY_STATUS.PROTECTED,
            config.CONSTANT.PRIVACY_STATUS.PUBLIC
        ]
    },
    isFeatured: { type: Boolean, default: false, index: true },
    startDate: { type: Number, index: true },
    endDate: { type: Number, indx: true },
    location: {
        type: { type: String, default: "Point" },
        coordinates: [Number],
    },
    address: { type: String, trim: true, required: true, index: true },
    price: { type: Number, default: 0 },
    title: { type: String, trim: true, required: true },
    description: { type: String, trim: true, required: true },
    // membersDetail: [{userId: { type: Schema.Types.ObjectId, ref: "users", default: null, index: true }}],
    status: {
        type: String,
        enum: [
            config.CONSTANT.STATUS.BLOCKED,
            config.CONSTANT.STATUS.ACTIVE,
            config.CONSTANT.STATUS.DELETED
        ],
        default: config.CONSTANT.STATUS.ACTIVE
    },
    imageUrl: { type: String },
    eventUrl: { type: String },
    allowSharing: { type: Number },
    goingCount: { type: Number, default: 0 },
    // eventCategoryType: {
    //     type: String, enum: [
    //         config.CONSTANT.EVENT_CATEGORY.CLASSES.TYPE,
    //         config.CONSTANT.EVENT_CATEGORY.EVENTS.TYPE,
    //         config.CONSTANT.EVENT_CATEGORY.MEETUP.TYPE,
    //         config.CONSTANT.EVENT_CATEGORY.TRAINING.TYPE
    //     ]
    // },
    // eventCategoryDisplayName: {
    //     type: String, enum: [
    //         config.CONSTANT.EVENT_CATEGORY.CLASSES.DISPLAY_NAME,
    //         config.CONSTANT.EVENT_CATEGORY.EVENTS.DISPLAY_NAME,
    //         config.CONSTANT.EVENT_CATEGORY.MEETUP.DISPLAY_NAME,
    //         config.CONSTANT.EVENT_CATEGORY.TRAINING.DISPLAY_NAME
    //     ]
    // },
    eventCategoryId: { type: Schema.Types.ObjectId, required: true },
    // {
    //     type: Number, index: true, enum: [
    //         config.CONSTANT.EVENT_CATEGORY.CLASSES.VALUE,
    //         config.CONSTANT.EVENT_CATEGORY.EVENTS.VALUE,
    //         config.CONSTANT.EVENT_CATEGORY.MEETUP.VALUE,
    //         config.CONSTANT.EVENT_CATEGORY.TRAINING.VALUE
    //     ]
    // },
    interestCount: { type: Number, default: 0 },
    created: { type: Number },

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
