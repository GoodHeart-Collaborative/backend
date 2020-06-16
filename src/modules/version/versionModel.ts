"use strict";

import * as mongoose from "mongoose";
import { Schema, Model, Document } from "mongoose";

import * as appUtils from "@utils/appUtils";
import * as config from "@config/constant";

export interface IVersion extends Document {
	name: string;
	description: string;
	platform: string;
	updateType: string;
	currentVersion: string;
	status: string;
	created: number;
}

const versionSchema = new Schema({
	name: { type: String, trim: true, index: true, required: true },
	description: { type: String, trim: true, required: true },
	platform: {
		type: String,
		required: true,
		enum: [
			config.CONSTANT.DEVICE_TYPE.ANDROID,
			config.CONSTANT.DEVICE_TYPE.IOS
		]
	},
	updateType: {
		type: String,
		required: true,
		enum: [
			config.CONSTANT.VERSION_UPDATE_TYPE.NORMAL,
			config.CONSTANT.VERSION_UPDATE_TYPE.FORCEFULLY
		]
	},
	currentVersion: { type: String },
	status: {
		type: String,
		enum: [
			config.CONSTANT.STATUS.UN_BLOCKED,
			config.CONSTANT.STATUS.BLOCKED,
			config.CONSTANT.STATUS.DELETED
		],
		default: config.CONSTANT.STATUS.UN_BLOCKED
	},
	created: { type: Number }
}, {
		versionKey: false,
		timestamps: true
	});

versionSchema.set("toObject", {
	virtuals: true
});

versionSchema.methods.toJSON = function () {
	const object = appUtils.clean(this.toObject());
	return object;
};

// to set findAndModify false
mongoose.set("useFindAndModify", false);

// Export version
export const versions: Model<IVersion> = mongoose.model<IVersion>(config.CONSTANT.DB_MODEL_REF.VERSION, versionSchema);