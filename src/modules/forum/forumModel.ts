"use strict";
import * as mongoose from "mongoose";
import { Schema, Model, Document } from "mongoose";
import * as appUtils from "@utils/appUtils";
import * as config from "@config/index";
// import * as 

export interface Iforum extends Document {
    categoryId: string,
    categoryName: string, // only for searching
    userId: string,
    userType: string;
    status: string;
    description: string;
    postAnonymous: boolean;
    likeCount: number;
    commentCount: number;
    created: number;
    postAt: string;
    createrId: string;
    // topic: string;
    thumbnailUrl: string;
    mediaUrl: string;
    mediaType: number;
    reportCount: number;
}

const forumSchema = new Schema({
    categoryId: { type: Schema.Types.ObjectId, required: true },
    commentId: { type: Schema.Types.ObjectId, required: false },
    type: { type: Number, default: 1 },
    userId: { type: Schema.Types.ObjectId, required: false },
    userType: {
        type: String, enum: [
            config.CONSTANT.ACCOUNT_LEVEL.ADMIN,
            config.CONSTANT.ACCOUNT_LEVEL.USER
        ],
        required: true
    },
    status: {
        type: String, enum: [
            config.CONSTANT.STATUS.ACTIVE,
            config.CONSTANT.STATUS.BLOCKED,
            config.CONSTANT.STATUS.DELETED,
        ],
        default: config.CONSTANT.STATUS.ACTIVE,
    },
    reportCount: { type: Number, default: 0 },
    createrId: { type: Schema.Types.ObjectId, required: true },
    likeCount: { type: Number, default: 0 },
    commentCount: { type: Number, default: 0 },
    topic: { type: String },
    description: { type: String, required: true },
    postAnonymous: { type: Boolean },
    created: { type: Number },
    postAt: { type: String, trim: true },
    mediaType: {
        type: Number,
        enum: [
            config.CONSTANT.MEDIA_TYPE.IMAGE,
            config.CONSTANT.MEDIA_TYPE.VIDEO,
            config.CONSTANT.MEDIA_TYPE.NONE,
        ],
        default: config.CONSTANT.MEDIA_TYPE.IMAGE
    },
    thumbnailUrl: { type: String },
    mediaUrl: { type: String },


}, {
    versionKey: false,
    timestamps: true
});

forumSchema.set("toObject", {
    virtuals: true
});


forumSchema.methods.toJSON = function () {
    const object = appUtils.clean(this.toObject());
    return object;
};

// Export shoutout
export const forum: Model<Iforum> = mongoose.model<Iforum>(config.CONSTANT.DB_MODEL_REF.FORUM, forumSchema);