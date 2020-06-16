"use strict";

import * as mongoose from "mongoose";
import { Schema, Model, Document } from "mongoose";

import * as config from "@config/constant";
import * as appUtils from "@utils/appUtils";

export interface IAdminNotification extends Document {
	image: string;
	title: string;
	link: string;
	message: string;
	platform: string;
	fromDate: number;
	toDate: number;
	created: number;
}

const adminNotificationSchema = new Schema({
	image: { type: String, trim: true },
	title: { type: String, trim: true, index: true, required: true },
	link: { type: String, required: false },
	message: { type: String, required: true },
	platform: {
		type: String,
		required: true,
		enum: [
			config.CONSTANT.DEVICE_TYPE.ANDROID,
			config.CONSTANT.DEVICE_TYPE.IOS,
			config.CONSTANT.DEVICE_TYPE.ALL
		]
	},
	fromDate: { type: Number },
	toDate: { type: Number },
	gender: {
		type: String,
		enum: [
			config.CONSTANT.GENDER.MALE,
			config.CONSTANT.GENDER.FEMALE,
			config.CONSTANT.GENDER.ALL
		]
	},
	sentCount: { type: Number },
	created: { type: Number }
}, {
		versionKey: false,
		timestamps: true
	});

adminNotificationSchema.set("toObject", {
	virtuals: true
});

adminNotificationSchema.methods.toJSON = function () {
	const object = appUtils.clean(this.toObject());
	return object;
};

// to set findAndModify false
mongoose.set("useFindAndModify", false);

/**
 * @description it is not in camelCase b/c mongoose gives that same as of our collections names
 */
export const admin_notifications: Model<IAdminNotification> = mongoose.model<IAdminNotification>(config.CONSTANT.DB_MODEL_REF.ADMIN_NOTIFICATION, adminNotificationSchema);