"use strict";

import * as mongoose from "mongoose";
import { Schema, Model, Document } from "mongoose";

import * as appUtils from "@utils/appUtils";
import * as config from "@config/constant";

export interface IContent extends Document {
	title: string;
	description: string;
	status: string;
	type: string;
	question: string;
	answer: string;
	created: number;
}

const contentSchema = new Schema({
	title: { type: String, trim: true, index: true },
	description: { type: String, trim: true },
	status: {
		type: String,
		enum: [
			config.CONSTANT.STATUS.DELETED
		]
	},
	type: {
		type: String,
		required: true,
		enum: [
			config.CONSTANT.CONTENT_TYPE.CONTACT_US,
			config.CONSTANT.CONTENT_TYPE.FAQ,
			config.CONSTANT.CONTENT_TYPE.PRIVACY_POLICY,
			config.CONSTANT.CONTENT_TYPE.TERMS_AND_CONDITIONS,
			config.CONSTANT.CONTENT_TYPE.ABOUT_US
		]
	},
	question: { type: String },
	answer: { type: String },
	created: { type: Number }
}, {
	versionKey: false,
	timestamps: true
});

contentSchema.set("toObject", {
	virtuals: true
});

contentSchema.methods.toJSON = function () {
	const object = appUtils.clean(this.toObject());
	return object;
};

// to set findAndModify false
mongoose.set("useFindAndModify", false);

// Export content
export const contents: Model<IContent> = mongoose.model<IContent>(config.CONSTANT.DB_MODEL_REF.CONTENT, contentSchema);