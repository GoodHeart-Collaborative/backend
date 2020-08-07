"use strict";
import * as mongoose from "mongoose";
import { Schema, Model, Document } from "mongoose";

import * as appUtils from "@utils/appUtils";
import * as config from "@config/index";


export interface IExpert extends Document {
    title: string,
    description: string,
    isPostLater: boolean,
    // thumbnailUrl: string,
    createdAt: Date,
    updatedAt: Date
    postedAt: String,
    type: number;
    mediaType: number,
    // mediaUrl: number,
    // contentId: number
    // contentType: string;
    // contentDisplayName: string;
    profilePicUrl: [string];
    bio: string
}


const expertSchema = new Schema({
    // userId: { type: Schema.Types.ObjectId, ref: 'users' },
    name: { type: String },
    email: { type: String },

    profession: { type: String },
    industry: {
        type: Number, enum: [
            // config.INDUSTRIES.Compassion_Fatigue,
            // config.INDUSTRIES.Experts_in_Executive_Burnout,
            // config.INDUSTRIES.Licensed_Therapists_specializing_in_Vicarious_and_Secondary_Trauma,
            // config.INDUSTRIES.Nonprofit_Resiliency_Coaches,
            // config.INDUSTRIES.Wellness_Coaches,
            // config.INDUSTRIES.Emergency_Services,
            // config.INDUSTRIES.Healthcare_And_Community_Medical_Services,
            // config.INDUSTRIES.Law_Enforcement,
            // config.INDUSTRIES.Nonprofit,
            // config.INDUSTRIES.Social_And_Community_Services,
        config.INDUSTRIES.NONPROFIT,
        config.INDUSTRIES.EMERGENCY_SERVICES,
        config.INDUSTRIES.SOCIAL_AND_COMMUNITY_SERVICES,
        config.INDUSTRIES.LAW_ENFORCEMENT,
        config.INDUSTRIES.HEALTHCARE_AND_COMMUNITY_MEDICAL_SERVICES
        ]
    },
    // bio: { type: String },
    experience: {
        type: String, enum: [
            'Junior', 'Mid', 'Senior',
        ]
    },
    categoryId: [{ type: Schema.Types.ObjectId }],
    price: { type: Number, default: 0 },
    // contentId: {
    //     type: Schema.Types.Number,
    //     default: config.CONSTANT.EXPERT_CONTENT_TYPE.ARTICLE.VALUE,
    //     enum: Object.values(config.CONSTANT.EXPERT_CONTENT_TYPE).map(({ VALUE }) => VALUE)
    // },
    // contentType: { type: String },
    // contentDisplayName: { type: String },

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
    bio: { type: String },

    // mediaType: {
    //     type: Number,
    //     enum: [
    //         config.CONSTANT.MEDIA_TYPE.IMAGE,
    //         config.CONSTANT.MEDIA_TYPE.VIDEO
    //     ],
    //     default: config.CONSTANT.MEDIA_TYPE.IMAGE
    // },
    postAt: { type: String, trim: true },
    profilePicUrl: [Schema.Types.String],
    // mediaUrl: { type: String },
    // thumbnailUrl: { type: String },
    created: { type: Number }
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