"use strict";

// import * as autoIncrement from "@modules/category/node_modules/mongoose-auto-increment";
// import * as bcrypt from "bcrypt";
import * as mongoose from "mongoose";
import { Schema, Model, Document } from "mongoose";

import * as appUtils from "@utils/appUtils";
import * as config from "@config/index";

export interface IUser extends Document {
	appleId: string;
	isAppleLogin: boolean;
	isAppleVerified: boolean;
	isMobileVerified: boolean;
	isEmailVerified: boolean;
	facebookId: string;
	isFacebookLogin: boolean;
	googleId: string;
	isGoogleLogin: boolean;
	isSubscribed: boolean;
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
	dob: string;
	profilePicUrl: [string];
	address: Address;
	status: string;
	mobileOtp: number;
	preference: string;
	industryType: string;
	experience: number;
	about: string;
	userPrivacy: string;
	loginToken: string;
	countMember: number;
	memberCreatedAt: string;
	isMemberOfDay: boolean;
	likeCount: number,
	commentCount: number,
	adminStatus: string;
	reportCount: number;
	// memberType: number;
	subscriptionType: string;
	subscriptionEndDate: number;
	badgeCount: number;
	subscriptionPlatform: string;
	subscriptionStartDate: number;
	isDowngradeDone: boolean;
}

var geoSchema = new Schema({
	// location: { type: String, trim: true, required: true, default: "" },
	type: { type: String, default: "Point" },
	coordinates: { type: [Number], default: [0, 0] }// [lngitude, latitude]
}, {
	_id: false
});

const userSchema = new Schema({
	mobileOtp: { type: Number },
	isAppleLogin: { type: Boolean, default: false },
	isMobileVerified: { type: Boolean, default: false },
	isEmailVerified: { type: Boolean, default: false },
	appleId: { type: String, trim: true, index: true },
	facebookId: { type: String, trim: true, index: true },
	isFacebookLogin: { type: Boolean, default: false },
	googleId: { type: String, trim: true, index: true },
	isGoogleLogin: { type: Boolean, default: false },
	isSubscribed: { type: Boolean, default: false },
	firstName: { type: String, trim: true, index: true, required: true },
	lastName: { type: String, trim: true, index: true },
	email: { type: String, trim: true, index: true, lowercase: true },
	countryCode: { type: String, trim: true, index: true, },
	mobileNo: { type: String, trim: true, index: true },
	fullMobileNo: { type: String, trim: true, index: true, default: "" },
	salt: { type: String, required: false },
	hash: { type: String, required: false },
	forgotToken: { type: String },
	loginToken: { type: String },
	profession: {
		type: String, enum: [
			config.CONSTANT.PROFESSION_TYPE.CEO,
			config.CONSTANT.PROFESSION_TYPE.Executive_Director,
			config.CONSTANT.PROFESSION_TYPE.Founder,
			config.CONSTANT.PROFESSION_TYPE.Managing_Director,
		]
	},
	gender: {
		type: String,
		enum: [
			config.CONSTANT.GENDER.FEMALE,
			config.CONSTANT.GENDER.MALE,
		]
	},
	dob: { type: String },
	profilePicUrl: [Schema.Types.String],
	status: {
		type: String,
		enum: [
			config.CONSTANT.STATUS.BLOCKED,
			config.CONSTANT.STATUS.ACTIVE,
			config.CONSTANT.STATUS.DELETED
		],
		default: config.CONSTANT.STATUS.ACTIVE
	},
	subscriptionType: {
		// memberType: {
		type: Number, enum: [
			config.CONSTANT.USER_SUBSCRIPTION_PLAN.FREE.value,
			config.CONSTANT.USER_SUBSCRIPTION_PLAN.MONTHLY.value,
			config.CONSTANT.USER_SUBSCRIPTION_PLAN.YEARLY.value,
			config.CONSTANT.USER_SUBSCRIPTION_PLAN.NONE.value,
		],
		default: config.CONSTANT.USER_SUBSCRIPTION_PLAN.NONE.value
	},
	subscriptionEndDate: {
		type: Number
	},
	subscriptionStartDate: {
		type: Number
	},
	subscriptionPlatform: {
		type: String, enum: [
			config.CONSTANT.DEVICE_TYPE.ANDROID,
			config.CONSTANT.DEVICE_TYPE.IOS,
		],
		default: config.CONSTANT.DEVICE_TYPE.IOS,

	},
	memberShipStatus: { type: String },
	myConnection: { type: Number, default: 0 },
	emailOtp: { type: Number },
	preference: { type: String },
	industryType: {
		type: Number,
		enum: [
			config.INDUSTRIES.NONPROFIT,
			config.INDUSTRIES.EMERGENCY_SERVICES,
			config.INDUSTRIES.SOCIAL_AND_COMMUNITY_SERVICES,
			config.INDUSTRIES.LAW_ENFORCEMENT,
			config.INDUSTRIES.HEALTHCARE_AND_COMMUNITY_MEDICAL_SERVICES,
		],
		// default: config.INDUSTRIES.NONPROFIT
	},
	adminStatus: {
		type: String, enum: [
			config.CONSTANT.USER_ADMIN_STATUS.PENDING,
			config.CONSTANT.USER_ADMIN_STATUS.REJECTED,
			config.CONSTANT.USER_ADMIN_STATUS.VERIFIED,
		],
		default: config.CONSTANT.USER_ADMIN_STATUS.PENDING,
	},
	experience: {
		type: String, enum: [
			config.CONSTANT.EXPERIENCE_LEVEL.years_0_2,
			config.CONSTANT.EXPERIENCE_LEVEL.years_2_5,
			config.CONSTANT.EXPERIENCE_LEVEL.years_5_10,
			config.CONSTANT.EXPERIENCE_LEVEL.year_10
		]
	},
	countMember: { type: Number, default: 0 },
	memberCreatedAt: { type: Date },
	isMemberOfDay: { type: Boolean, default: false },
	isDowngradeDone: { type: Boolean, default: false },
	members: { type: [Schema.Types.ObjectId], ref: "User", default: [] },
	about: { type: String },
	userPrivacy: {
		type: String, enum: [
			config.CONSTANT.PRIVACY_STATUS.PRIVATE,
			config.CONSTANT.PRIVACY_STATUS.PROTECTED,
			config.CONSTANT.PRIVACY_STATUS.PUBLIC,
		]
	},
	location: geoSchema,
	likeCount: { type: Number, default: 0 },
	commentCount: { type: Number, default: 0 },
	badgeCount: { type: Number, default: 0 },
	reportCount: { type: Number, default: 0 }
}, {
	versionKey: false,
	timestamps: true
});

userSchema.set("toObject", {
	virtuals: true,
});

// Load password virtually
userSchema.virtual("password")
	.get(function () {
		return this._password;
	})
	.set(function (password) {
		this._password = password;
		const salt = this.salt = appUtils.genRandomString(config.SERVER.SALT_ROUNDS);
		this.hash = appUtils.encryptHashPassword(password, salt);
	});

userSchema.methods.toJSON = function () {
	const object = appUtils.clean(this.toObject());
	return object;
};
/* Crate 2dsphere index */
userSchema.index({
	location: "2dsphere"
});

// to set findAndModify false
mongoose.set("useFindAndModify", false);

export const users: Model<IUser> = mongoose.model<IUser>(config.CONSTANT.DB_MODEL_REF.USER, userSchema);