"use strict";

// import * as bcrypt from "bcrypt";
import * as mongoose from "mongoose";
import { Schema, Model, Document } from "mongoose";

import * as appUtils from "@utils/appUtils";
import * as config from "@config/index";

export interface IAdmin extends Document {
	_id: string;
	name: string;
	email: string;
	salt: string;
	hash: string;
	adminType: string;
	forgotToken?: string;
	profilePicture?: string;
	permission: string[];
	status: string;
	created: number;
}

const adminSchema = new Schema({
	_id: { type: Schema.Types.ObjectId, required: true, auto: true },
	name: { type: String, trim: true, required: true },
	email: { type: String, trim: true, index: true, lowercase: true, required: true },
	salt: { type: String, required: false },
	hash: { type: String, required: false },
	adminType: {
		type: String,
		enum: [
			config.CONSTANT.ADMIN_TYPE.SUPER_ADMIN,
			config.CONSTANT.ADMIN_TYPE.SUB_ADMIN
		],
		default: config.CONSTANT.ADMIN_TYPE.SUPER_ADMIN
	},
	forgotToken: { type: String },
	profilePicture: { type: String },
	permission: [{
		type: String,
		default: [],
		enum: [
			"view_user", "send_notification_user", "block_user", "delete_user", "import_user",
			"view_content", "add_content", "delete_content", "edit_content",
			"view_notification", "add_notification", "delete_notification", "edit_notification",
			"view_version", "add_version", "delete_version", "edit_version"
		]
	}],
	status: {
		type: String,
		enum: [
			config.CONSTANT.STATUS.BLOCKED,
			config.CONSTANT.STATUS.UN_BLOCKED,
			config.CONSTANT.STATUS.DELETED
		],
		default: config.CONSTANT.STATUS.UN_BLOCKED
	},
	created: { type: Number }
}, {
	versionKey: false,
	collection: config.CONSTANT.DB_MODEL_REF.ADMIN,
	timestamps: true,
	// toObject: {
	// 	virtuals: true
	// },
	// toJSON: {
	// 	virtuals: true
	// },
	// toObject: {
	// 	transform: function(doc, ret){
	// 		// delete ret._id;
	// 		console.log(doc, ret, "toObject");
	// 	}
	// },
	// toJSON: {
	// 	transform: function(doc, ret){
	// 		console.log(doc, ret, "toJSON");
	// 		// delete ret._id;
	// 	}
	// }
});

// Ensure virtual fields are serialised.
// adminSchema.set('toJSON', {
// 	virtuals: true
// });
adminSchema.set("toObject", {
	virtuals: true
});

// Load password virtually
adminSchema.virtual("password")
	.get(function () {
		return this._password;
	})
	.set(function (password) {
		this._password = password;
		// let salt = this.salt = bcrypt.genSaltSync(config.SERVER.SALT_ROUNDS);
		const salt = this.salt = appUtils.genRandomString(config.SERVER.SALT_ROUNDS);
		this.hash = appUtils.encryptHashPassword(password, salt);
	});

// adminSchema.set('toObject', {
// 	transform: function (doc, ret){
// 		console.log(ret);
// 	}
// });
// OR
adminSchema.methods.toJSON = function () {
	const object = appUtils.clean(this.toObject());
	return object;
};

// to set findAndModify false
mongoose.set("useFindAndModify", false);

// Export admin
export const admins: Model<IAdmin> = mongoose.model<IAdmin>(config.CONSTANT.DB_MODEL_REF.ADMIN, adminSchema);