"use strict";

import * as _ from "lodash";
// import * as atob from "atob";
// import * as bcrypt from "bcrypt";
import * as Boom from "boom";
// import * as btoa from "btoa";
import * as crypto from "crypto";
import * as del from "del";
import { ExcelJs } from "../lib/ExcelJs";
// import fs = require("fs");
import * as generatepassword from "generate-password";
import { Request, ResponseToolkit } from "hapi";
import * as MD5 from "md5";
import * as moment from "moment";
import * as mongoose from "mongoose";
import * as randomstring from "randomstring";
import * as path from "path";
import * as TinyURL from "tinyurl";
import * as validator from "validator";
import * as environment from '@config/environment'
import * as config from "@config/index";
import { logger } from "@lib/logger";
const TAG = "rcc-uploads";

const verifyEmailFormat = function (value: string) {
	return validator.isEmail(value);
};

const setInsertObject = function (source, destination, fields) {
	_.each(fields, function (value, index) {
		if (source[value] != null) {
			destination[value] = source[value];
		}
	});

	return destination;
};

const createMembersArray = function (members) {
	try {
		let membersMembers = []
		for (const userId of members) {
			membersMembers.push({userId: userId})
		}
		return membersMembers
	} catch (error) {
		throw error
	}
}

const unsetInsertObject = function (source, destination, fields) {
	_.each(fields, function (value, index) {
		if (!source[value]) {
			destination[value] = "";
		}
	});

	return destination;
};

const buildToken = function (params: TokenData) {
	const userObject: any = {};

	if (params.userId)
		userObject.userId = params.userId;
	if (params.socialLoginType)
		userObject.socialLoginType = params.socialLoginType;
	if (params.socialId)
		userObject.socialId = params.socialId;
	if (params.email)
		userObject.email = params.email;
	if (params.name)
		userObject.name = params.name;
	if (params.firstName)
		userObject.firstName = params.firstName;
	if (params.middleName)
		userObject.middleName = params.middleName;
	if (params.lastName)
		userObject.lastName = params.lastName;
	if (params.countryCode)
		userObject.countryCode = params.countryCode;
	if (params.mobileNo)
		userObject.mobileNo = params.mobileNo;
	userObject.platform = params.platform;
	if (params.deviceId)
		userObject.deviceId = params.deviceId;
	if (params.salt)
		userObject.salt = params.salt;
	userObject.accountLevel = params.accountLevel;
	if (params.adminType)
		userObject.adminType = params.adminType;
	if (params.timezone)
		userObject.timezone = params.timezone;
	if (params.created)
		userObject.created = params.created;

	return userObject;
};

/**
 * generates random string of characters i.e salt
 * @function
 * @param {number} length - Length of the random string.
*/
const genRandomString = function (length) {
	return crypto.randomBytes(Math.ceil(length / 2))
		.toString("hex") /** convert to hexadecimal format */
		.slice(0, length);   /** return required number of characters */
};

const getShoutoutCard = function () {
	let stringArr = ["Happy Birthday! ", "Congratulations! ", "Way to go! ", "Keep on Shining!", "So proud of you!", "Grateful for your passion!", "You go girl!", "You got this!", "Awesome job!"]
	let response:any = []
	for (let i = 0; i < stringArr.length; i++) {
		response.push({
			id: i+1,
			title: stringArr[i],
			gif: `${environment.SERVER.SERVER_URL}/images/gif_1.pdf`
		})
	}
	return response
};

const encryptHashPassword = function (password: string, salt: string) {
	// return bcrypt.hashSync(password, salt);
	const hash = crypto.createHmac("sha512", salt); /** Hashing algorithm sha512 */
	hash.update(password);
	return hash.digest("hex");
};

const toObjectId = function (_id: string): mongoose.Types.ObjectId {
	return mongoose.Types.ObjectId(_id);
};

const failActionFunction = async function (request: Request, h: ResponseToolkit, error: any) {
	let customErrorMessage = "";
	if (error.name === "ValidationError") {
		customErrorMessage = error.details[0].message;
	} else {
		customErrorMessage = error.output.payload.message;
	}
	customErrorMessage = customErrorMessage.replace(/"/g, "");
	customErrorMessage = customErrorMessage.replace("[", "");
	customErrorMessage = customErrorMessage.replace("]", "");
	return Boom.badRequest(customErrorMessage);
};

const convertISODateToTimestamp = function (value) {
	// 2018-12-06T07:28:14.793Z to 1545578721887
	return new Date(value).getTime();
};

Object.defineProperty(Array.prototype, "chunk_inefficient", {
	value: function (chunkSize) {
		const array = this;
		return [].concat.apply([], array.map(function (elem, i) {
			return i % chunkSize ? [] : [array.slice(i, i + chunkSize)];
		}));
	}
});

const splitArrayInToChunks = function (data) {
	return data.chunk_inefficient(config.SERVER.CHUNK_SIZE);
};

const createAndroidPushPayload = function (data) {
	let set: any = {};
	const fieldsToFill = ["type", "title", "body", "link", "image", "contentType", "category", "priority", "sound", "click_action"];

	data.priority = data.priority ? data.priority : "high";
	// data.image = data.image ? data.image : "https://s3.amazonaws.com/appinventiv-development/ustandby/15644684745409Ri3K.png";
	data.contentType = data.image ? "image" : "text"; // video, audio, gif, text
	data.category = "action";
	// data.click_action = "FLUTTER_NOTIFICATION_CLICK";
	set = this.setInsertObject(data, set, fieldsToFill);

	if (config.SERVER.PUSH_TYPE === config.CONSTANT.PUSH_SENDING_TYPE.FCM) { // create FCM payload
		return {
			"data": set,
			// "body": set,
			"notification": {
				"title": data.title,
				"body": data.body
			}
		};
	} else if (config.SERVER.PUSH_TYPE === config.CONSTANT.PUSH_SENDING_TYPE.SNS) { // create SNS payload
		const payload = {
			data: set
		};
		return JSON.stringify(payload);
	}
};

const createIOSPushPayload = function (data) {
	let set: any = {};
	const fieldsToFill = ["type", "title", "body", "link", "image", "contentType", "category", "mutableContent", "threadId", "priority", "sound"];

	data.priority = data.priority ? data.priority : "high";
	// data.image = data.image ? data.image : "https://s3.amazonaws.com/appinventiv-development/ustandby/15644684745409Ri3K.png";
	data.contentType = data.image ? "image" : "text"; // video, audio, gif, text
	data.category = "action"; // to show buttons
	data.mutableContent = 1;
	data.threadId = "RichPush";
	set = this.setInsertObject(data, set, fieldsToFill);

	if (config.SERVER.PUSH_TYPE === config.CONSTANT.PUSH_SENDING_TYPE.FCM) { // create FCM payload
		return {
			// "data": set,
			"data": {
				"data": set
			},
			"notification": {
				"title": data.title,
				"body": data.body,
				"sound": "default",
				"priority": data.priority ? data.priority : "high"
			}
		};
	} else if (config.SERVER.PUSH_TYPE === config.CONSTANT.PUSH_SENDING_TYPE.SNS) { // create SNS payload
		const payload = {};
		payload[config.CONSTANT.SNS_SERVER_TYPE.DEV] = JSON.stringify({
			aps: set
		});
		return payload;
	}
};

const createWebPushPayload = function (data) {
	let set: any = {};
	const fieldsToFill = ["title", "type", "priority", "sound", "click_action", "body", "icon", "force", "badge", "requireInteraction", "silent"];

	data.icon = data.icon ? data.icon : "https://s3.amazonaws.com/appinventiv-development/ustandby/15644684745409Ri3K.png";
	data.priority = data.priority ? data.priority : "high";
	data.force = data.force ? data.force : true;
	data.badge = data.badge ? data.badge : 1;
	// data.click_action = data.click_action;
	data.requireInteraction = data.requireInteraction ? data.requireInteraction : true;
	data.silent = data.silent ? data.silent : true;
	data.sound = "default";
	set = setInsertObject(data, set, fieldsToFill);
	if (config.SERVER.PUSH_TYPE === config.CONSTANT.PUSH_SENDING_TYPE.FCM) { // create FCM payload
		return set;
	} else if (config.SERVER.PUSH_TYPE === config.CONSTANT.PUSH_SENDING_TYPE.SNS) { // create SNS payload
	}
};

const calculateAge = function (dob) {
	// 1545578721887 to 24
	dob = new Date(dob);
	const now = new Date();
	const otherDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
	let years = (otherDate.getFullYear() - dob.getFullYear());

	if (otherDate.getMonth() < dob.getMonth() || otherDate.getMonth() === dob.getMonth() && otherDate.getDate() < dob.getDate()) {
		years--;
	}

	return years;
};

const convertStringToRegExp = function (value: string) {
	return new RegExp(value);
};

const convertRegExpToString = function (value) {
	return value.source;
};

const CryptDataMD5 = function (stringToCrypt: string) {
	return MD5(stringToCrypt);
};

const encodeToBase64 = function (value: string) {
	// return btoa(value);
	return new Buffer(value).toString("base64");
};

const decodeBase64 = function (value: string) {
	// return atob(value);
	return Buffer.from(value, "base64").toString("ascii");
};

const tinyUrl = (url: string) => {
	return new Promise((resolve, reject) => {
		TinyURL.shorten(url, async (response) => {
			resolve(response);
		});
	});
};

// const getRandomOtp = function () {
// 	return randomstring.generate({ charset: "numeric", length: 6 });
// };

const generateOtp = async function () {
	let otp = (Math.floor(1000 + Math.random() * 9000));
	return otp
}

const isValidEmail = function (email: string) {
	const pattern = config.CONSTANT.REGEX.EMAIL;
	return new RegExp(pattern).test(email);
};

const stringToBoolean = function (value: string) {
	switch (value.toString().toLowerCase().trim()) {
		case "true":
		case "yes":
		case "1":
			return true;
		case "false":
		case "no":
		case "0":
		case null:
			return false;
		default:
			return Boolean(value);
	}
};

const stringReplace = function (value: string) {
	return value.replace(config.CONSTANT.REGEX.STRING_REPLACE, "");
};

const isValidMobileNumber = function (value: string) {
	const pattern = config.CONSTANT.REGEX.MOBILE_NUMBER;
	return new RegExp(pattern).test(value); // countryCode + mobileNo
};

const clean = function (object) {
	for (const propName in object) {
		if (object[propName] === null || object[propName] === undefined || object[propName] === "") {
			delete object[propName];
		}
	}
	// delete object["createdAt"];
	// delete object["updatedAt"];
	return object;
};

const convertMillisToEndOfTheDay = function (value: number) {
	// 1545868800000 to 1545955199999
	return value + 86399999;
};

const captalizeFirstLetter = function (value: string) {
	return value.charAt(0).toUpperCase() + value.substr(1);
};

const convertTimestampToDate = function (value: number) {
	// 1545868800000 to 01-01-2019
	const year = new Date(value).getFullYear();
	const month = ((new Date(value).getMonth() + 1) < 10) ? "0" + (new Date(value).getMonth() + 1) : (new Date(value).getMonth() + 1);
	const day = (new Date(value).getDate() < 10) ? "0" + new Date(value).getDate() : new Date(value).getDate();

	return day + "-" + month + "-" + year;
};

const convertTimestampToUnixDate = function (value: number) {
	// 1546281000000 to 31 Dec 2018
	return moment.utc(value).format("DD MMM YYYY");
};

const convertTimestampToLocalDate = function (value: number) {
	// 1546281000000 to 01 Jan 2019
	return moment(value).format("DD MMM YYYY");
};

const convertStringDateToTimestamp = function (value: string) {
	// 03 Jun 2011 to 1307039400000
	// 3 Jun 2011 to 1307039400000
	return new Date(value).getTime();
};

const excelFilter = function (fileName: string) {
	// accept image only
	if (!fileName.toLowerCase().match(/\.(csv|xlsx|xls)$/)) {
		return false;
	}
	return true;
};

const getDynamicName = function (file) {
	return file.hapi ? (new Date().getTime() + "_" + randomstring.generate(5) + path.extname(file.hapi.filename)) : (new Date().getTime() + "_" + randomstring.generate(5) + path.extname(file.filename));
};

const deleteFiles = function (filePath) {
	// delete files inside folder but not the folder itself
	del.sync([`${filePath}`, `!${config.SERVER.UPLOAD_DIR}`]);
	// fs.unlink(filePath, (err) => {
	// 	if (err) {
	// 		console.error(err)
	// 		return;
	// 	}
	// });
	logger.info(TAG, "All files deleted successfully.");
};

// function _filterReadAndParseJSON(json) {
// 	json = _.filter(json, function (value) {
// 		if (value["email"] ? !isValidEmail(value["email"]) : false) {
// 			return;
// 		} else if (!value["email"] && (!value["countryCode"] || !value["mobileNo"])) {
// 			return;
// 		} else {
// 			return value;
// 		}
// 	});
// 	return json;
// }

const readAndParseJSON = function (json) {
	const excelKeyMap = config.CONSTANT.EXCEL_KEY_MAP;
	json = _.map(json, (element, elementIndex) => {
		const jsonTemp = {};
		_.each(element, (value, index) => {
			if (value) {
				if (typeof excelKeyMap[index] !== "undefined") {
					if (typeof excelKeyMap[index] === "object") {
						if (typeof jsonTemp[excelKeyMap[index]["parent"]] === "undefined") {
							jsonTemp[excelKeyMap[index]["parent"]] = {};
						}
						jsonTemp[excelKeyMap[index]["parent"]][excelKeyMap[index]["child"]] = value;
					} else {
						jsonTemp[excelKeyMap[index]] = value;
					}
				} else if (typeof excelKeyMap[index] === "undefined") {
					delete excelKeyMap[index];
				} else {
					jsonTemp[index] = value;
				}
			}
		});
		if (jsonTemp["countryCode"]) {
			jsonTemp["countryCode"] = "" + jsonTemp["countryCode"];
		}
		if (jsonTemp["mobileNo"]) {
			jsonTemp["mobileNo"] = jsonTemp["mobileNo"].toString();
		}
		if (jsonTemp["dob"]) {
			jsonTemp["dob"] = Number(jsonTemp["dob"]);
		}
		// if (jsonTemp["gender"]) {
		// 	jsonTemp["gender"] = (jsonTemp["gender"] === "Male") ? config.CONSTANT.GENDER.MALE : config.CONSTANT.GENDER.FEMALE;
		// }
		// if (jsonTemp["dob"]) {
		// 	jsonTemp["dob"] = convertStringDateToTimestamp(jsonTemp["dob"]) + 19800000;
		// 	jsonTemp["age"] = calculateAge(jsonTemp["dob"]);
		// }
		return jsonTemp;
	});
	return json;
	// return _filterReadAndParseJSON(json);
};

const stringifyNumber = function (n) {
	const special = ["zeroth", "first", "second", "third", "fourth", "fifth", "sixth", "seventh", "eighth", "ninth", "tenth", "eleventh", "twelvth", "thirteenth", "fourteenth", "fifteenth", "sixteenth", "seventeenth", "eighteenth", "nineteenth"];
	const deca = ["twent", "thirt", "fourt", "fift", "sixt", "sevent", "eight", "ninet"];
	if (n < 20) { return special[n]; }
	if (n % 10 === 0) { return deca[Math.floor(n / 10) - 2] + "ieth"; }
	return deca[Math.floor(n / 10) - 2] + "y-" + special[n % 10];
};

/**
 * @name createStream
 * @description To create stream
 * @param userInfo - userData comes from mongo query
 * @param ExcelSheetheader - header for exel sheet
*/
// const createStream = function (mongoQueryData: [object], ExcelSheetheader, sheetName: string) {
const createStream = function (mongoQueryData: any, ExcelSheetheader, sheetName: string) {
	const createInstace = new ExcelJs("");
	const CreateWorkSheet = createInstace.addWorksheet(sheetName);
	createInstace.addColumns(CreateWorkSheet, ExcelSheetheader);
	createInstace.addRows(CreateWorkSheet, mongoQueryData);
	return createInstace;
};

const makeBaseAuth = function (username, password) {
	// return "Basic " + btoa(username + ":" + password);
	return new Buffer(username + ":" + password).toString("base64");
};

const basicAuthFunction = async function (access_token) {
	const credentials = Buffer.from(access_token, "base64").toString("ascii");
	const [username, password] = credentials.split(":");
	if (username !== password) {
		return false;
	}
	return true;
};

const validateLatLong = function (lat, long) {
	let valid = true;
	if (lat < -90 || lat > 90) {
		valid = false;
	}
	if (long < -180 || long > 180) {
		valid = false;
	}
	return valid;
};

function timeConversion(value) {
	const seconds: number = Number((value / 1000).toFixed(0));
	const minutes: number = Number((value / (1000 * 60)).toFixed(0));
	const hours: number = Number((value / (1000 * 60 * 60)).toFixed(0));
	const days: number = Number((value / (1000 * 60 * 60 * 24)).toFixed(0));

	if (seconds < 60) {
		return seconds + " Sec";
	} else if (minutes < 60) {
		return minutes + " Min";
	} else if (hours < 24) {
		return hours + " Hrs";
	} else {
		return days + " Days";
	}
}

function generateRandomString(length) {
	let result = "";
	const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	const charactersLength = characters.length;
	for (let i = 0; i < length; i++) {
		result += characters.charAt(Math.floor(Math.random() * charactersLength));
	}
	return result;
}

const isTimeExpired = function (exp) {
	let isTimeExpired = false;
	if (Number(exp) < new Date().getTime()) {
		isTimeExpired = true;
	}
	return isTimeExpired;
};

const generatePassword = function (length?: number) {
	return generatepassword.generate({
		length: length ? length : 10,
		numbers: true,
		uppercase: true,
		symbols: true,
		exclude: ",+!*()_-{}[];'`:/\?<>.\"|~",
		strict: true
	});
};

const mailAttachments = function (payload) {
	switch (payload.type) {
		case "xlsx":
			return [
				{
					filename: new Date().getTime() + ".xlsx",
					content: payload.data,
					// content: new Buffer(payload.data),
					// content: fs.createReadStream(payload.data),
					// content: fs.readFileSync(payload.data),
					contentType: config.CONSTANT.MIME_TYPE.CSV2
				}
			];
		case "csv":
			return [
				{
					filename: payload.url.split("/").slice(-1)[0],
					path: payload.url,
					// content: fs.readFileSync(payload.url),
					cid: payload.url.split("/").slice(-1)[0],
					contentType: payload.file.hapi.headers["content-type"]
				}
			];
	}
};

const consolelog = (identifier: string, value: any, status: boolean) => {
	try {
		const displayColors = config.SERVER.DISPLAY_COLORS;
		if (Array.isArray(value)) {
			value.forEach((obj, i) => {
				if (status) {
					console.info(displayColors ? "\x1b[31m%s\x1b[0m" : "%s", "<--------------" + identifier + "--------------" + i + "-------------->", obj);
				} else {
					console.error(displayColors ? "\x1b[31m%s\x1b[0m" : "%s", "<--------------" + identifier + "--------------" + i + "-------------->", obj);
				}
			});
			return;
		} else {
			if (status) {
				console.info(displayColors ? "\x1b[31m%s\x1b[0m" : "%s", "<--------------" + identifier + "-------------->", value);
			} else {
				console.error(displayColors ? "\x1b[31m%s\x1b[0m" : "%s", "<--------------" + identifier + "-------------->", value);
			}
			return;
		}
	} catch (error) {
		console.log("Error in logging console", error);
		return;
	}
};

export {
	verifyEmailFormat,
	setInsertObject,
	unsetInsertObject,
	buildToken,
	genRandomString,
	encryptHashPassword,
	toObjectId,
	failActionFunction,
	convertISODateToTimestamp,
	splitArrayInToChunks,
	createAndroidPushPayload,
	createIOSPushPayload,
	createWebPushPayload,
	calculateAge,
	convertStringToRegExp,
	convertRegExpToString,
	CryptDataMD5,
	encodeToBase64,
	decodeBase64,
	tinyUrl,
	createMembersArray,
	// getRandomOtp,
	isValidEmail,
	stringToBoolean,
	stringReplace,
	isValidMobileNumber,
	clean,
	convertMillisToEndOfTheDay,
	captalizeFirstLetter,
	convertTimestampToDate,
	convertTimestampToUnixDate,
	convertTimestampToLocalDate,
	convertStringDateToTimestamp,
	excelFilter,
	getDynamicName,
	deleteFiles,
	readAndParseJSON,
	stringifyNumber,
	createStream,
	makeBaseAuth,
	basicAuthFunction,
	validateLatLong,
	timeConversion,
	generateRandomString,
	isTimeExpired,
	generatePassword,
	mailAttachments,
	consolelog,
	generateOtp,
	getShoutoutCard
};