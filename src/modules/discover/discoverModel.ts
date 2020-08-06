"use strict";
import * as mongoose from "mongoose";
import { Schema, Model, Document } from "mongoose";
import * as appUtils from "@utils/appUtils";
import * as config from "@config/index";


export interface Idiscover extends Document {
    userId: string,
    followerd: string,
    discover_status: number
}

const discoverSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'users' },
    followerId: { type: Schema.Types.ObjectId, ref: 'users' },
    discover_status: {
        type: Number,
        enum: [
            config.CONSTANT.DISCOVER_STATUS.PENDING,
            config.CONSTANT.DISCOVER_STATUS.ACCEPT,
            config.CONSTANT.DISCOVER_STATUS.REJECT,
            config.CONSTANT.DISCOVER_STATUS.NO_ACTION
        ],
        default: config.CONSTANT.DISCOVER_STATUS.PENDING
    }
}, {
    versionKey: false,
    timestamps: true
});

discoverSchema.set("toObject", {
    virtuals: true
});



discoverSchema.methods.toJSON = function () {
    const object = appUtils.clean(this.toObject());
    return object;
};


// Export home
export const discover: Model<Idiscover> = mongoose.model<Idiscover>(config.CONSTANT.DB_MODEL_REF.DISCOVER, discoverSchema);