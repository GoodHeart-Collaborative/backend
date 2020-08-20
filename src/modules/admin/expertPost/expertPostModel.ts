"use strict";
import * as mongoose from "mongoose";
import { Schema, Model, Document } from "mongoose";

import * as appUtils from "@utils/appUtils";
import * as config from "@config/index";


export interface IExpert extends Document {
    expertId: string,
    topic: string;
    // profession: string,
    categoryId: string,
    price: number;
    contentId: number
    contentType: string,
    contentDisplayName: string,

    likeCount: number;
    commentCount: number;
    status: string;
    privacy: string;
    description: string,
    mediaType: number,
    // postAt: { type: String, trim: true },
    mediaUrl: string;
    thumbnailUrl: string;
    created: number;
}


const expertPostSchema = new Schema({
    expertId: { type: Schema.Types.ObjectId, ref: 'expert' },
    topic: { type: String },
    // profession: { type: String },
    categoryId: { type: Schema.Types.ObjectId },
    price: { type: Number, default: 0 },
    contentId: {
        type: Schema.Types.Number,
        default: config.CONSTANT.EXPERT_CONTENT_TYPE.ARTICLE.VALUE,
        enum: Object.values(config.CONSTANT.EXPERT_CONTENT_TYPE).map(({ VALUE }) => VALUE)
    },
    contentType: { type: String },
    contentDisplayName: { type: String },

    likeCount: { type: Schema.Types.Number, default: 0 },
    commentCount: { type: Schema.Types.Number, default: 0 },
    status: {
        type: String,
        enum: [
            config.CONSTANT.STATUS.BLOCKED,
            config.CONSTANT.STATUS.ACTIVE,
            config.CONSTANT.STATUS.DELETED
        ],
        default: config.CONSTANT.STATUS.ACTIVE
    },
    privacy: {
        type: String,
        enum: [
            config.CONSTANT.PRIVACY_STATUS.PRIVATE,
            config.CONSTANT.PRIVACY_STATUS.PROTECTED,
            config.CONSTANT.PRIVACY_STATUS.PUBLIC
        ],
        default: config.CONSTANT.PRIVACY_STATUS.PRIVATE
    },
    description: { type: String },
    mediaType: {
        type: Number,
        enum: [
            config.CONSTANT.MEDIA_TYPE.IMAGE,
            config.CONSTANT.MEDIA_TYPE.VIDEO
        ],
        default: config.CONSTANT.MEDIA_TYPE.IMAGE
    },
    postAt: { type: String, trim: true },
    mediaUrl: { type: String },
    thumbnailUrl: { type: String },
    created: { type: Number, default: new Date() },

}, {
    versionKey: false,
    timestamps: true
});

expertPostSchema.set("toObject", {
    virtuals: true
});



expertPostSchema.methods.toJSON = function () {
    const object = appUtils.clean(this.toObject());
    return object;
};


export const expert_post = mongoose.model<IExpert>(config.CONSTANT.DB_MODEL_REF.EXPERT_POST, expertPostSchema);