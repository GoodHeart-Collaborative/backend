"use strict";

// import * as autoIncrement from "@modules/category/node_modules/mongoose-auto-increment";
import * as mongoose from "mongoose";
import { Schema, Model, Document } from "mongoose";

import * as appUtils from "@utils/appUtils";
import * as config from "@config/index";

// const connection = mongoose.createConnection(config.SERVER.MONGO.DB_URL + config.SERVER.MONGO.DB_NAME, config.SERVER.MONGO.OPTIONS);
// autoIncrement.initialize(connection);

export interface IPost extends Document {
    userId: string,
    categoryId: string,
    likeCount: number,
    totalComments: number,
    title: string,
    status: string
    privacy: string
    description: string;
    // shortDescription: string;
    imageUrl: string;
    createdAt: number,
    updatedAt: number

}


const postSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'users', required: true },
    categoryId: { type: Schema.Types.ObjectId, required: true },
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
    privacy: {
        type: String, enum: [
            config.CONSTANT.PRIVACY_STATUS.PRIVATE,
            config.CONSTANT.PRIVACY_STATUS.PROTECTED,
            config.CONSTANT.PRIVACY_STATUS.PUBLIC,
        ],
        default: config.CONSTANT.PRIVACY_STATUS.PUBLIC,
    },
    description: { type: String },
    // shortDescription: { type: String },
    imageUrl: { type: String },
    createdAt: { type: Number },
    updatedAt: { type: Number }
}, {
    versionKey: false,
    timestamps: true
});

postSchema.set("toObject", {
    virtuals: true
});



postSchema.methods.toJSON = function () {
    const object = appUtils.clean(this.toObject());
    return object;
};

// to set findAndModify false
// mongoose.set("useFindAndModify", false);

// mongoose autoincrement
// userSchema.plugin(autoIncrement.plugin, { model: "User", field: "sno" });

// Export user
export const posts: Model<IPost> = mongoose.model<IPost>(config.CONSTANT.DB_MODEL_REF.POST, postSchema);