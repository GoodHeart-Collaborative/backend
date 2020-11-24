"use strict";
import * as mongoose from "mongoose";
import { Schema, Model, Document } from "mongoose";

import * as appUtils from "@utils/appUtils";
import * as config from "@config/index";

export interface IExpert extends Document {
    title: string,
    description: string,
    // thumbnailUrl: string,
    createdAt: Date,
    updatedAt: Date
    type: number;
    created: number;
    mediaType: number,
    profilePicUrl: [string];
    bio: string;
    name: string;
    email: string;
    profession: string;
    industry: number;
    experience: string;
    categoryId: [string];
    price: number;
    status: string,
    privacy: string
}


const expertSchema = new Schema({
    name: { type: String },
    email: { type: String },
    // profession: { type: String },
    profession: {
        type: String, enum: [
            config.PROFESSION_TYPE.CEO,
            config.PROFESSION_TYPE.Founder,
            config.PROFESSION_TYPE.Consultant,
            config.PROFESSION_TYPE.Director,
            config.PROFESSION_TYPE.Executive_Director,
            config.PROFESSION_TYPE.Licensed_Counselor,
            config.PROFESSION_TYPE.Managing_Director,
            config.PROFESSION_TYPE.Professional_Coach,
            config.PROFESSION_TYPE.Professional_Trainer,
            config.PROFESSION_TYPE.Professor
        ]
    },
    industry: {
        type: Number, enum: [
            config.INDUSTRIES.NONPROFIT,
            config.INDUSTRIES.EMERGENCY_SERVICES,
            config.INDUSTRIES.SOCIAL_AND_COMMUNITY_SERVICES,
            config.INDUSTRIES.LAW_ENFORCEMENT,
            config.INDUSTRIES.HEALTHCARE_AND_COMMUNITY_MEDICAL_SERVICES
        ]
    },
    experience: {
        type: String, enum: [
            'Junior', 'Mid', 'Senior',
        ]
    },
    created: { type: Number },
    categoryId: [{ type: Schema.Types.ObjectId }],
    price: { type: Number, default: 0 },
    // likeCount: { type: Schema.Types.Number, default: 0 },
    // commentCount: { type: Schema.Types.Number, default: 0 },
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
    bio: { type: String },
    postAt: { type: String, trim: true },
    profilePicUrl: [Schema.Types.String],

}, {
    versionKey: false,
    timestamps: true
});

expertSchema.set("toObject", {
    virtuals: true
});



expertSchema.methods.toJSON = function () {
    const object = appUtils.clean(this.toObject());
    return object;
};


export const expert: Model<IExpert> = mongoose.model<IExpert>(config.CONSTANT.DB_MODEL_REF.EXPERT, expertSchema);