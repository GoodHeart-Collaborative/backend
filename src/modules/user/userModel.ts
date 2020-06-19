"use strict";

import * as autoIncrement from "mongoose-auto-increment";
// import * as bcrypt from "bcrypt";
import * as mongoose from "mongoose";
import { Schema, Model, Document } from "mongoose";

import * as appUtils from "@utils/appUtils";
import * as config from "@config/index";
import { ElasticSearch } from "@lib/ElasticSearch";

const elasticSearch = new ElasticSearch();

const connection = mongoose.createConnection(config.SERVER.MONGO.DB_URL + config.SERVER.MONGO.DB_NAME, config.SERVER.MONGO.OPTIONS);
autoIncrement.initialize(connection);

export interface IUser extends Document {
	// sno: string;
	isMobileVerified: boolean;
	isEmailVerified: boolean;
	facebookId: string;
	isFacebookLogin: boolean;
	googleId: string;
	isGoogleLogin: boolean;
	firstName: string;
	lastName: string;
	email: string;
	countryCode: string;
	mobileNo: string;
	fullMobileNo: string;
	salt: string;
	hash: string;
	forgotToken: string;
	gender: string;
	dob: number;
	profilePicUrl: string;
	address: Address;
	status: string;
	mobileOtp: number;
	preference: string;
	industryType: string;
	experience: number;
	about: string;
	createdAt: number;
}

const geoSchema = new Schema({
	address: { type: String, trim: true, required: true },
	type: { type: String, default: "Point" },
	coordinates: { type: [Number], index: "2dsphere" }// [longitude, latitude]
}, {
		_id: false
	});

const userSchema = new Schema({
	// sno: { type: String, required: true },
	// _id: { type: mongoose.Schema.Types.ObjectId, required: true, auto: true },
	mobileOtp: { type: Number },

	// social data
	isMobileVerified: { type: Boolean, default: false },
	isEmailVerified: { type: Boolean, default: false },
	facebookId: { type: String, trim: true, index: true },
	isFacebookLogin: { type: Boolean, default: false },
	googleId: { type: String, trim: true, index: true },
	isGoogleLogin: { type: Boolean, default: false },
	firstName: { type: String, trim: true, index: true, required: true },
	lastName: { type: String, trim: true, index: true },
	email: { type: String, trim: true, index: true, lowercase: true, default: "" },
	countryCode: { type: String, trim: true, index: true, default: "" },
	mobileNo: { type: String, trim: true, index: true, default: "" },
	fullMobileNo: { type: String, trim: true, index: true, default: "" },
	salt: { type: String, required: false },
	hash: { type: String, required: false },
	forgotToken: { type: String },
	gender: {
		type: String,
		enum: [
			config.CONSTANT.GENDER.FEMALE
		]
	},
	dob: { type: Number },
	profilePicUrl: { type: String },
	address: geoSchema,
	status: {
		type: String,
		enum: [
			config.CONSTANT.STATUS.BLOCKED,
			config.CONSTANT.STATUS.ACTIVE,
			config.CONSTANT.STATUS.DELETED
		],
		default: config.CONSTANT.STATUS.ACTIVE
	},
	emailOtp: { type: Number },
	preference: { type: String },
	industryType: { type: String },
	experience: { type: Number },
	about: { type: String },
	createdAt: { type: Number },
	updatedAt: { type: Number }
}, {
		versionKey: false,
		timestamps: true
	});

userSchema.set("toObject", {
	virtuals: true
});

// Load password virtually
userSchema.virtual("password")
	.get(function () {
		return this._password;
	})
	.set(function (password) {
		this._password = password;
		// const salt = this.salt = bcrypt.genSaltSync(config.SERVER.SALT_ROUNDS);
		const salt = this.salt = appUtils.genRandomString(config.SERVER.SALT_ROUNDS);
		this.hash = appUtils.encryptHashPassword(password, salt);
	});

// userSchema.virtual("fullName")
// 	.get(function () {
// 		if (this.middleName) {
// 			this.firstName = this.firstName + " " + this.middleName;
// 		} if (this.lastName) {
// 			this.firstName = this.firstName + " " + this.lastName;
// 		}
// 		return this.firstName;
// 	});

// If elastic search engine is enabled
// if (config.SERVER.IS_ELASTIC_SEARCH_ENABLE) {
// 	// save user data in elastic search db
// 	userSchema.post("save", function (doc) {
// 		doc = doc.toJSON();
// 		const id = doc["_id"];
// 		if (doc["_id"]) delete doc["_id"];
// 		if (doc["password"]) delete doc["password"];
// 		elasticSearch.addDocument("admin_rcc", id, "users", doc);
// 	});

// 	// update user data in elastic search db
// 	userSchema.post("findOneAndUpdate", async function (doc) {
// 		doc = doc.toJSON();
// 		const id = doc["_id"];
// 		return await elasticSearch.deleteDocument("admin_rcc", id, "users")
// 			.then(async () => {
// 				if (doc["_id"]) delete doc["_id"];
// 				if (doc["password"]) delete doc["password"];
// 				return await elasticSearch.addDocument("admin_rcc", id, "users", doc);
// 			});
// 	});
// }

userSchema.methods.toJSON = function () {
	const object = appUtils.clean(this.toObject());
	return object;
};

// to set findAndModify false
mongoose.set("useFindAndModify", false);

// mongoose autoincrement
// userSchema.plugin(autoIncrement.plugin, { model: "User", field: "sno" });

// Export user
export const users: Model<IUser> = mongoose.model<IUser>(config.CONSTANT.DB_MODEL_REF.USER, userSchema);