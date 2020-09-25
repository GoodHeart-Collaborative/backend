"use strict";

import * as mongoose from "mongoose";
import { Schema, Model, Document } from "mongoose";

import * as appUtils from "@utils/appUtils";
import * as config from "@config/index";

export interface INotification extends Document {
	senderId: mongoose.Schema.Types.ObjectId;
	receiverId: mongoose.Schema.Types.ObjectId;
	title: string;
	message: string;
	type: Number;
	isRead: boolean;
	created: number;
}

/**
 * @description used to track the notification history
 */
const notificationSchema = new Schema({
	senderId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: config.CONSTANT.DB_MODEL_REF.USER
	},
	receiverId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: config.CONSTANT.DB_MODEL_REF.USER
	},
	title: { type: String, required: true },
	message: { type: String, required: true },
	type: {
		type: Number,
		enum: [
			config.CONSTANT.NOTIFICATION_TYPE.BULK_NOTIFICATION,
			config.CONSTANT.NOTIFICATION_TYPE.ONE_TO_ONE,
			// config.CONSTANT.NOTIFICATION_CATEGORY.ADMIN_STATUS_VERIFIED.type,
			config.CONSTANT.NOTIFICATION_CATEGORY.LEADER_OF_DAY.type,
			config.CONSTANT.NOTIFICATION_CATEGORY.FRIEND_REQUEST_APPROVED.type,
			config.CONSTANT.NOTIFICATION_CATEGORY.SHOUTOUT_TAGGED_ME.type,
			config.CONSTANT.NOTIFICATION_CATEGORY.FRIEND_REQUEST_SEND.type,
		],
		required: true
	},
	isRead: { type: Boolean, default: false },
	created: { type: Number }
}, {
	versionKey: false,
	timestamps: true
});

notificationSchema.set("toObject", {
	virtuals: true
});

notificationSchema.methods.toJSON = function () {
	const object = appUtils.clean(this.toObject());
	return object;
};

// to set findAndModify false
mongoose.set("useFindAndModify", false);

// Export notification schema
export const notifications: Model<INotification> = mongoose.model<INotification>(config.CONSTANT.DB_MODEL_REF.NOTIFICATION, notificationSchema);