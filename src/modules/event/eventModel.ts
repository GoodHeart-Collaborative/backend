"use strict";
import * as mongoose from "mongoose";
import { Schema, Model, Document } from "mongoose";
import * as appUtils from "@utils/appUtils";
import * as config from "@config/index";
// import * as 

export interface Ievent extends Document {
    userId: string,
    // categoryId: string;
    name: string;
    location: any;
    title: string,
    privacy: string;
    startDate: Date;
    endDate: Date;
    price: number;
    url: string;
    allowSharing: boolean;
    description: string;
    goingCount: number;
    interestCount: number;
    eventCategory: string,
    created: number;
}

const eventSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, required: true, ref: 'users' },
    // categoryId:{type:Schema.Types.ObjectId },
    name: { type: String },
    privacy: {
        type: String, enum: [
            config.CONSTANT.PRIVACY_STATUS.PRIVATE,
            config.CONSTANT.PRIVACY_STATUS.PROTECTED,
            config.CONSTANT.PRIVACY_STATUS.PUBLIC
        ]
    },
    startDate: { type: Date },
    endDate: { type: Date },
    location: {
        type: { type: String, default: "Point" },
        coordinates: [Number],
    },
    address: { type: String, trim: true, required: true },
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
    allowSharing: { type: Boolean },
    goingCount: { type: Number, default: 0 },
    eventCategory: {
        type: String, enum: [
            config.CONSTANT.EVENT_CATEGORY.CLASSES,
            config.CONSTANT.EVENT_CATEGORY.EVENTS,
            config.CONSTANT.EVENT_CATEGORY.MEETUP,
            config.CONSTANT.EVENT_CATEGORY.TRAINING
        ]
    },
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
