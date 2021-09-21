"use strict";
import * as mongoose from "mongoose";
import { Schema, Model, Document } from "mongoose";
import * as appUtils from "@utils/appUtils";
import * as config from "@config/index";
import * as shortid from 'shortid';

interface category {
    _id: mongoose.ObjectId;
    name: string,
    imageUrl: String
}

export interface IselfCare extends Document {
    userId: mongoose.ObjectId;
    reminderTime: number;
    isDaily: string;
    affirmationText: string;
    userType: string;
    category: category;
    isClosed: string;
    isComplete: string;
    isNotificationAllow: string;
    status: string;

}

const selfCareSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, required: true, ref: 'users', index: true },
    reminderTime: { type: Number },
    isDaily: { type: Boolean },

    affirmationText: { type: String },
    userType: {
        type: String, required: true, enum: [
            config.CONSTANT.ACCOUNT_LEVEL.ADMIN,
            config.CONSTANT.ACCOUNT_LEVEL.USER
        ]
    },
    category: {
        _id: { type: Schema.Types.ObjectId },
        name: { type: String },
        imageUrl: { type: String },
    },
    isClosed: { type: Boolean },
    isComplete: { type: Boolean },
    isNotificationAllow: { type: Boolean },
    status: {
        type: String,
        enum: [
            config.CONSTANT.STATUS.BLOCKED,
            config.CONSTANT.STATUS.ACTIVE,
            config.CONSTANT.STATUS.DELETED
        ],
        default: config.CONSTANT.STATUS.ACTIVE
    },
}, {
    versionKey: false,
    timestamps: true
});

// selfCareSchema.set("toObject", {
//     virtuals: true
// });

// selfCareSchema.methods.toJSON = function () {
//     const object = appUtils.clean(this.toObject());
//     return object;
// };

// Export shoutout
export const selfCare: Model<IselfCare> = mongoose.model<IselfCare>(config.CONSTANT.DB_MODEL_REF.SELF_CARE, selfCareSchema);
