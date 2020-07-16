"use strict";

// import * as autoIncrement from "@modules/category/node_modules/mongoose-auto-increment";
import * as mongoose from "mongoose";
import { Schema, Model, Document } from "mongoose";

import * as appUtils from "@utils/appUtils";
import * as config from "@config/index";


export interface Ihome extends Document {
    likeCount: number,
    totalComments: number,
    title: string,
    description: string,
    isPostLater: boolean,
    imageUrl: string,
    createdAt: Date,
    updatedAt: Date
    postedAt: Date,
    type: number;
    mediaType: number,
    mediaUrl: number
}


const homeSchema = new Schema({
    likeCount: { type: Schema.Types.Number, default: 0 },
    totalComments: { type: Schema.Types.Number, default: 0 },
    title: { type: Schema.Types.String, required: true },
    status: {
        type: String,
        enum: [
            config.CONSTANT.STATUS.BLOCKED,
            config.CONSTANT.STATUS.ACTIVE,
            config.CONSTANT.STATUS.DELETED
        ],
        default: config.CONSTANT.STATUS.ACTIVE
    },
    type: {
        type: Number,
        enum: [
            config.CONSTANT.HOME_TYPE.UNICRON,
            config.CONSTANT.HOME_TYPE.INSPIRATION,
            config.CONSTANT.HOME_TYPE.DAILY_ADVICE,
        ],
        default: config.CONSTANT.HOME_TYPE.UNICRON
    },
    description: { type: String },
    isPostLater: { type: Boolean },
    postedAt: { type: Date, trim: true, required: true },
    mediaType: {
        type: Number,
        enum: [
            config.CONSTANT.MEDIA_TYPE.IMAGE,
            config.CONSTANT.MEDIA_TYPE.VIDEO
        ],
        default: config.CONSTANT.MEDIA_TYPE.IMAGE
    },
    mediaUrl: { type: String },
    imageUrl: { type: String },
    // // createdAt: { type: Date },
    // updatedAt: { type: Date }
}, {
    versionKey: false,
    timestamps: true
});

homeSchema.set("toObject", {
    virtuals: true
});



homeSchema.methods.toJSON = function () {
    const object = appUtils.clean(this.toObject());
    return object;
};


// Export home
export const home: Model<Ihome> = mongoose.model<Ihome>(config.CONSTANT.DB_MODEL_REF.HOME, homeSchema);