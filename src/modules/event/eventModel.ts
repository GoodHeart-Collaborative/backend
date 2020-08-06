"use strict";
import * as mongoose from "mongoose";
import { Schema, Model, Document } from "mongoose";
import * as appUtils from "@utils/appUtils";
import * as config from "@config/index";
// import * as 

export interface Ievent extends Document {
    userId: string,
    categoryId: string;
    name:string;

    title: string,
    type:string;
    startDate:Date;
    endDate:Date;
    price:string;


    description: string,
}

const eventSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'users' },
    categoryId:{type:Schema.Types.ObjectId },
    name:{type:String},
type:{type:String,enum:[
    config.CONSTANT.PRIVACY_STATUS.PRIVATE,
    config.CONSTANT.PRIVACY_STATUS.PROTECTED,
    config.CONSTANT.PRIVACY_STATUS.PUBLIC
]},
startDate:{type:Date},
endDate:{type:Date},
// location:{},
price:{type:String,default:0},
	// title: { type: String, trim: true, required: true },
    description: { type: String, trim: true, required: true },
    // membersDetail: [{userId: { type: Schema.Types.ObjectId, ref: "users", default: null, index: true }}],
    status: {
        type: String,
        enum: [
            config.CONSTANT.STATUS.BLOCKED,
            config.CONSTANT.STATUS.ACTIVE,
            config.CONSTANT.STATUS.DELETED
        ],
        default: config.CONSTANT.STATUS.ACTIVE
    }
}, {
    versionKey: false,
    timestamps: true
});

eventSchema.set("toObject", {
    virtuals: true
});


eventSchema.methods.toJSON = function () {
    const object = appUtils.clean(this.toObject());
    return object;
};

// Export shoutout
export const event: Model<Ievent> = mongoose.model<Ievent>(config.CONSTANT.DB_MODEL_REF.EVENT, eventSchema);
