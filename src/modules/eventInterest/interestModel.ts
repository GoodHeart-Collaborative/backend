"use strict";
import * as mongoose from "mongoose";
import { Schema, Model, Document } from "mongoose";
import * as appUtils from "@utils/appUtils";
import * as config from "@config/index";
// import * as 

export interface IeventInterest extends Document {
    userId: string,
    eventId: string,
    created: number;
    type: number;
    status: string;
}

const eventInterestSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'users' },
    eventId: { type: Schema.Types.ObjectId, ref: 'event' },
    type: {
        type: Number, enum: [
            config.CONSTANT.EVENT_INTEREST.GOING,
            config.CONSTANT.EVENT_INTEREST.INTEREST,
        ]
    },
    status: {
        type: String, enum: [
            config.CONSTANT.STATUS.ACTIVE,
            config.CONSTANT.STATUS.BLOCKED,
            config.CONSTANT.STATUS.DELETED
        ],
        default: config.CONSTANT.STATUS.ACTIVE,

    },
    created: { type: Number },
}, {
    versionKey: false,
    timestamps: true
});

eventInterestSchema.set("toObject", {
    virtuals: true
});


eventInterestSchema.methods.toJSON = function () {
    const object = appUtils.clean(this.toObject());
    return object;
};

export const event_interest: Model<IeventInterest> = mongoose.model<IeventInterest>(config.CONSTANT.DB_MODEL_REF.EVENT_INTEREST, eventInterestSchema);
