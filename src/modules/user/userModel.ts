"use strict";

// import * as autoIncrement from "@modules/category/node_modules/mongoose-auto-increment";
// import * as bcrypt from "bcrypt";
import * as mongoose from "mongoose";
import { Schema, Model, Document } from "mongoose";

import * as appUtils from "@utils/appUtils";
import * as config from "@config/index";
import { ElasticSearch } from "@lib/ElasticSearch";

const elasticSearch = new ElasticSearch();

// const connection = mongoose.createConnection(config.SERVER.MONGO.DB_URL + config.SERVER.MONGO.DB_NAME, config.SERVER.MONGO.OPTIONS);
// autoIncrement.initialize(connection);

export interface IUser extends Document {
	// sno: string;
	appleId: string;
	isAppleLogin: boolean;
	isAppleVerified: boolean;
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
	// createdAt: number;
	countMember: number;
	memberCreatedAt: Date;
	isMemberOfDay: boolean;
	likeCount: number,
	commentCount: number,
	adminStatus: string;
	reportCount: number;
	// isAdminRejected: boolean;
	// isAdminVerified: boolean;
}

var geoSchema = new Schema({
	location: { type: String, trim: true, required: true, default: '' },
	type: { type: String, default: "Point" },
	coordinates: { type: [Number], default: [0, 0] }// [lngitude, latitude]
}, {
	_id: false
});

const userSchema = new Schema({
	mobileOtp: { type: Number },
	// social data
	isAppleLogin: { type: Boolean, default: false },
	isMobileVerified: { type: Boolean, default: false },
	isEmailVerified: { type: Boolean, default: false },
	appleId: { type: String, trim: true, index: true },
	facebookId: { type: String, trim: true, index: true },
	isFacebookLogin: { type: Boolean, default: false },
	googleId: { type: String, trim: true, index: true },
	isGoogleLogin: { type: Boolean, default: false },
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
	memberType: {
		type: String, default: config.CONSTANT.MEMBER_TYPE.FREE, enum: [
			config.CONSTANT.MEMBER_TYPE.FREE,
			config.CONSTANT.MEMBER_TYPE.PREMIUM,
		]
	}, // Free(Default rakho)
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
		default: config.INDUSTRIES.NONPROFIT
	},
	// isAdminVerified: { type: Boolean, default: false },
	// isAdminRejected: { type: Boolean, default: false },

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
			config.CONSTANT.EXPERIENCE_LEVEL.JUNIOR,
			config.CONSTANT.EXPERIENCE_LEVEL.MID,
			config.CONSTANT.EXPERIENCE_LEVEL.SENIOR
		]
	},
	countMember: { type: Number, default: 0 },
	memberCreatedAt: { type: Date },
	isMemberOfDay: { type: Boolean, default: false },
	members: { type: [Schema.Types.ObjectId], ref: 'User', default: [] },
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
	// createdAt: { type: Date },
	// updatedAt: { type: Date },
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
/* Crate 2dsphere index */
userSchema.index({
	location: '2dsphere'
});

// to set findAndModify false
mongoose.set("useFindAndModify", false);

// mongoose autoincrement
// userSchema.plugin(autoIncrement.plugin, { model: "User", field: "sno" });

// Export user
export const users: Model<IUser> = mongoose.model<IUser>(config.CONSTANT.DB_MODEL_REF.USER, userSchema);