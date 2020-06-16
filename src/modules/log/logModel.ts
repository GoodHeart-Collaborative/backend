"use strict";

import * as mongoose from "mongoose";
import { Schema, Model, Document } from "mongoose";

import * as appUtils from "@utils/appUtils";
import * as config from "@config/constant";

export interface ILog extends Document {
	collectionName: string;
	userId: mongoose.Schema.Types.ObjectId;
	data: object;
	crudAction: string;
	actionType: string;
	created: number;
}

const logSchema = new Schema({
	collectionName: {
		type: String,
		enum: ["users"]
	},
	userId: {
		type: mongoose.Schema.Types.ObjectId,
		required: true
	},
	data: {},
	crudAction: {
		type: String,
		enum: ["CREATE", "DELETE", "UPDATE"]
	},
	actionType: {
		type: String,
		enum: [
			config.CONSTANT.LOG_HISTORY_TYPE.ADD_USER,
			config.CONSTANT.LOG_HISTORY_TYPE.EDIT_USER,
			config.CONSTANT.LOG_HISTORY_TYPE.DELETE_USER,
			config.CONSTANT.LOG_HISTORY_TYPE.BLOCK_USER,
			config.CONSTANT.LOG_HISTORY_TYPE.UNBLOCK_USER
		]
	},
	created: { type: Number }
}, {
	versionKey: false,
	timestamps: true
});

logSchema.methods.toJSON = function () {
	const object = appUtils.clean(this.toObject());
	return object;
};

// Export log
export const logs: Model<ILog> = mongoose.model<ILog>(config.CONSTANT.DB_MODEL_REF.LOG, logSchema);