"use strict";
import * as mongoose from "mongoose";
import { Schema, Model, Document } from "mongoose";

import * as appUtils from "@utils/appUtils";
import * as config from "@config/index";
import { ElasticSearch } from "@lib/ElasticSearch";


export interface IGratitudeJournal extends Document {
    likeCount: number,
    commentCount: number,
    title: string,
    description: string,
    isPostLater: boolean,
    thumbnailUrl: string,
    createdAt: Date,
    updatedAt: Date
    postedAt: String,
    type: number;
    mediaType: number,
    mediaUrl: number
}


const gratitudeJournalSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'users' },
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
    created: { type: Number }
}, {
    versionKey: false,
    timestamps: true
});

gratitudeJournalSchema.set("toObject", {
    virtuals: true
});



gratitudeJournalSchema.methods.toJSON = function () {
    const object = appUtils.clean(this.toObject());
    return object;
};


export const gratitude_journals: Model<IGratitudeJournal> = mongoose.model<IGratitudeJournal>(config.CONSTANT.DB_MODEL_REF.GRATITUDE_JOURNAL, gratitudeJournalSchema);