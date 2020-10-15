"use strict";
import * as mongoose from "mongoose";
import { Schema, Model, Document } from "mongoose";
import * as config from "../../config/index";
import * as appUtils from "@utils/appUtils";

export interface Ireport extends Document {
    userId: string
    postId: string;
    type: number;
    reason: string;
}

const reportSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'users' },
    postId: { type: Schema.Types.ObjectId, trim: true, required: true },
    type: {
        type: Number,
        enum: [
            // config.CONSTANT.HOME_TYPE.UNICORN,
            // config.CONSTANT.HOME_TYPE.INSPIRATION,
            // config.CONSTANT.HOME_TYPE.DAILY_ADVICE,
            // config.CONSTANT.HOME_TYPE.GENERAL_GRATITUDE,
            // config.CONSTANT.HOME_TYPE.MEMBER_OF_DAY,
            config.CONSTANT.HOME_TYPE.FORUM_TOPIC,
            config.CONSTANT.HOME_TYPE.USER,
            config.CONSTANT.HOME_TYPE.EXPERTS_POST
        ],
        default: config.CONSTANT.HOME_TYPE.FORUM_TOPIC,
    },
    reportOption: {
        type: Number, enum: [
            config.CONSTANT.REPORT_MESSAGE.Explicit_photos.id,
            config.CONSTANT.REPORT_MESSAGE.Impostor_accounts.id,
            config.CONSTANT.REPORT_MESSAGE.Offensive_content.id,
            config.CONSTANT.REPORT_MESSAGE.Other.id,

            config.CONSTANT.REPORT_MESSAGE.FAKE_ACCOUNT.id,
            config.CONSTANT.REPORT_MESSAGE.FAKE_NAME.id,
            config.CONSTANT.REPORT_MESSAGE.POSTING_IN_APPROPRIATE_THINGS.id,
            config.CONSTANT.REPORT_MESSAGE.PretendingToBeSomeOne.id,
            config.CONSTANT.REPORT_MESSAGE.SOMETHING_ELSE.id,
        ],
    },
    reason: { type: String, required: true },
    created: { type: Number, default: new Date() }
}, {
    versionKey: false,
    timestamps: true
});

reportSchema.set("toObject", {
    virtuals: true
});

reportSchema.methods.toJSON = function () {
    const object = appUtils.clean(this.toObject());
    return object;
};

export const report: Model<Ireport> = mongoose.model<Ireport>(config.CONSTANT.DB_MODEL_REF.REPORT, reportSchema);
