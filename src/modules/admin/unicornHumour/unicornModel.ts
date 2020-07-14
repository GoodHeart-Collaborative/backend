"use strict";

// import * as autoIncrement from "@modules/category/node_modules/mongoose-auto-increment";
import * as mongoose from "mongoose";
import { Schema, Model, Document } from "mongoose";

import * as appUtils from "@utils/appUtils";
import * as config from "@config/index";

// const connection = mongoose.createConnection(config.SERVER.MONGO.DB_URL + config.SERVER.MONGO.DB_NAME, config.SERVER.MONGO.OPTIONS);
// autoIncrement.initialize(connection);

export interface Iunicorn extends Document {

    // categoryId: string,
    likeCount: number,
    totalComments: number,
    title: string,
    status: string
    privacy: string
    description: string;
    // shortDescription: string;
    postedAt?: string;
    isPostLater: boolean;
    imageUrl: string;
    createdAt: Date;
    updatedAt: Date;

}


const unicrornSchema = new Schema({
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
    shortDescription: { type: String },
    isPostLater: { type: Boolean },
    postedAt: { type: String, trim: true },
    imageUrl: { type: String },

    createdAt: { type: Date },
    updatedAt: { type: Date }
}, {
    versionKey: false,
    timestamps: true
});

unicrornSchema.set("toObject", {
    virtuals: true
});



unicrornSchema.methods.toJSON = function () {
    const object = appUtils.clean(this.toObject());
    return object;
};

// to set findAndModify false
// mongoose.set("useFindAndModify", false);

// mongoose autoincrement
// userSchema.plugin(autoIncrement.plugin, { model: "User", field: "sno" });

// Export user
export const unicorn: Model<Iunicorn> = mongoose.model<Iunicorn>(config.CONSTANT.DB_MODEL_REF.UNICORN, unicrornSchema);