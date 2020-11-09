"use strict";
import * as mongoose from "mongoose";
import { Schema, Model, Document } from "mongoose";
import * as appUtils from "@utils/appUtils";
import * as config from "@config/index";


export interface Ishoutout extends Document {
    userId: string,
    members: string[]
    title: string,
    description: string,
    memberAdded: string,
    created: number;
    endTime: number;
}

const shoutoutSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'users' },
    senderId: { type: Schema.Types.ObjectId, ref: 'users' },
    receiverId: { type: Schema.Types.ObjectId, ref: 'users' },
    title: { type: String, trim: true, required: true },
    description: { type: String, trim: true, required: true },
    members: { type: [Schema.Types.ObjectId], ref: 'User', default: [] }, // all member friends including me
    membersDetail: [{ userId: { type: Schema.Types.ObjectId, ref: "users", default: null, index: true } }],
    status: {
        type: String,
        enum: [
            config.CONSTANT.STATUS.BLOCKED,
            config.CONSTANT.STATUS.ACTIVE,
            config.CONSTANT.STATUS.DELETED
        ],
        default: config.CONSTANT.STATUS.ACTIVE
    },
    created: { type: Number },
    endTime: { type: Number }, // 24 hrs past
    privacy: {
        type: String, enum: [
            config.CONSTANT.PRIVACY_STATUS.PRIVATE,
            config.CONSTANT.PRIVACY_STATUS.PUBLIC,
        ],
        default: config.CONSTANT.PRIVACY_STATUS.PUBLIC,
    },
    memberAdded: { type: [Schema.Types.ObjectId], ref: 'User', default: [] },

}, {
    versionKey: false,
    timestamps: true
});

shoutoutSchema.set("toObject", {
    virtuals: true
});


shoutoutSchema.methods.toJSON = function () {
    const object = appUtils.clean(this.toObject());
    return object;
};

// Export shoutout
export const shoutout: Model<Ishoutout> = mongoose.model<Ishoutout>(config.CONSTANT.DB_MODEL_REF.SHOUTOUT, shoutoutSchema);
