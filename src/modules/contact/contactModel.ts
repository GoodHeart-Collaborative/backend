"use strict";

import * as mongoose from "mongoose";
import { Schema, Model, Document } from "mongoose";

import * as appUtils from "@utils/appUtils";
import * as config from "@config/constant";

export interface IContact extends Document {
	sno: number;
	userId: mongoose.Schema.Types.ObjectId;
	contactName: string;
	mobileNo: string;
	profilePicture: string;
	appUserId: mongoose.Schema.Types.ObjectId;
	deviceId: string;
	created: number;
}

const contactSchema = new Schema({
	sno: { type: Number },
	// if i sync contact then it is my id
	userId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: config.CONSTANT.DB_MODEL_REF.USER,
		index: true
	},
	contactName: { type: String },
	mobileNo: { type: String },
	profilePicture: { type: String, default: "" },
	// if i sync contact which is present in app then this is the id of those users
	appUserId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: config.CONSTANT.DB_MODEL_REF.USER
	},
	deviceId: { type: String, required: true },
	created: { type: Number }
}, {
		versionKey: false,
		timestamps: true
	});

contactSchema.set("toObject", {
	virtuals: true
});

contactSchema.methods.toJSON = function () {
	const object = appUtils.clean(this.toObject());
	return object;
};

// Export contact
export const contacts: Model<IContact> = mongoose.model<IContact>(config.CONSTANT.DB_MODEL_REF.CONTACT, contactSchema);