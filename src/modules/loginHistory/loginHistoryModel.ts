"use strict";

import * as mongoose from "mongoose";
import { Schema, Model, Document } from "mongoose";

import * as appUtils from "@utils/appUtils";
import * as config from "@config/constant";

export interface ILoginHistory extends Document {
	userId: mongoose.Schema.Types.ObjectId;
	salt: string;
	isLogin: boolean;
	lastLogin: number;
	deviceId: string;
	remoteAddress: string;
	platform: string;
	deviceToken: string;
	refreshToken: string;
	// arn: string;
	created: number;
}

const loginHistorySchema = new Schema({
	userId: {
		type: mongoose.Schema.Types.ObjectId,
		required: true
	},
	salt: { type: String }, // combination of userId.timestamp.deviceId
	isLogin: { type: Boolean, default: false },
	lastLogin: { type: Number },
	deviceId: { type: String },
	remoteAddress: { type: String },
	platform: {
		type: String,
		required: true,
		enum: [
			config.CONSTANT.DEVICE_TYPE.ANDROID,
			config.CONSTANT.DEVICE_TYPE.IOS,
			config.CONSTANT.DEVICE_TYPE.WEB
		]
	},
	deviceToken: { type: String, index: true },
	refreshToken: { type: String, index: true },
	arn: { type: String },
	created: { type: Number }
}, {
	versionKey: false,
	timestamps: true
});

loginHistorySchema.set("toObject", {
	virtuals: true
});

loginHistorySchema.methods.toJSON = function () {
	const object = appUtils.clean(this.toObject());
	return object;
};

// to set findAndModify false
mongoose.set("useFindAndModify", false);

/**
 * @description it is not in camelCase b/c mongoose gives that same as of our collections names
 */
export const login_histories: Model<ILoginHistory> = mongoose.model<ILoginHistory>(config.CONSTANT.DB_MODEL_REF.LOGIN_HISTORY, loginHistorySchema);