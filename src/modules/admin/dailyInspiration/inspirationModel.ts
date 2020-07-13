"use strict";

// import * as autoIncrement from "@modules/category/node_modules/mongoose-auto-increment";
import * as mongoose from "mongoose";
import { Schema, Model, Document } from "mongoose";

import * as appUtils from "@utils/appUtils";
import * as config from "@config/index";

// const connection = mongoose.createConnection(config.SERVER.MONGO.DB_URL + config.SERVER.MONGO.DB_NAME, config.SERVER.MONGO.OPTIONS);
// autoIncrement.initialize(connection);

export interface Inspiration extends Document {

    // categoryId: string,
    likeCount: number,
    totalComments: number,
    title: string,
    status: string
    privacy: string
    description: string;
    // shortDescription: string;
    isPostLater: boolean;
    imageUrl: string;
    createdAt: number,
    updatedAt: number

}


const inspirationSchema = new Schema({
    // categoryId: { type: Schema.Types.ObjectId, required: true },
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
    // privacy: {
    //     type: String, enum: [
    //         config.CONSTANT.PRIVACY_STATUS.PRIVATE,
    //         config.CONSTANT.PRIVACY_STATUS.PROTECTED,
    //         config.CONSTANT.PRIVACY_STATUS.PUBLIC,
    //     ],
    //     default: config.CONSTANT.PRIVACY_STATUS.PUBLIC,
    // },
    description: { type: String, required: true },
    // shortDescription: { type: String },
    isPostLater: { type: Boolean },
    postedAt: { type: String, trim: true },
    imageUrl: { type: String },
    createdAt: { type: Number },
    updatedAt: { type: Number }
}, {
    versionKey: false,
    timestamps: true
});

inspirationSchema.set("toObject", {
    virtuals: true
});



inspirationSchema.methods.toJSON = function () {
    const object = appUtils.clean(this.toObject());
    return object;
};

// to set findAndModify false
// mongoose.set("useFindAndModify", false);

// mongoose autoincrement
// userSchema.plugin(autoIncrement.plugin, { model: "User", field: "sno" });

// Export user
export const inspiration: Model<Inspiration> = mongoose.model<Inspiration>(config.CONSTANT.DB_MODEL_REF.INSPIRATION, inspirationSchema);