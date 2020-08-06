"use strict";

import { SERVER } from "@config/environment";

const SWAGGER_DEFAULT_RESPONSE_MESSAGES = [
	{ code: 200, message: "OK" },
	{ code: 400, message: "Bad Request" },
	{ code: 401, message: "Unauthorized" },
	{ code: 404, message: "Data Not Found" },
	{ code: 500, message: "Internal Server Error" }
];

const ENUM = {
	SORT_TYPE: [1, -1],
};

const HTTP_STATUS_CODE = {
	OK: 200,
	CREATED: 201,
	UPDATED: 202,
	NO_CONTENT: 204,
	BAD_REQUEST: 400,
	UNAUTHORIZED: 401,
	PAYMENY_REQUIRED: 402,
	ACCESS_FORBIDDEN: 403,
	URL_NOT_FOUND: 404,
	METHOD_NOT_ALLOWED: 405,
	UNREGISTERED: 410,
	PAYLOAD_TOO_LARGE: 413,
	BLOCKED_USER: 420,
	CONCURRENT_LIMITED_EXCEEDED: 429,
	// TOO_MANY_REQUESTS: 429,
	INTERNAL_SERVER_ERROR: 500,
	BAD_GATEWAY: 502,
	SHUTDOWN: 503,
	// custom
	INVALID_TOKEN: 419,
	SESSION_EXPIRED: 423, // LOGIN_SESSION_EXPIRED
	SOCIAL_ACCOUNT_ALREADY_EXIST: 424,

	EMAIL_NOT_REGISTER: 400,//411,
	MOBILE_NOT_REGISTER: 400,//412,

	EMAIL_NOT_VERIFIED: 411,
	MOBILE_NO_NOT_VERIFY: 412,
	REGISTER_BDAY: 413,             // accessToken
	ADMIN_ACCOUNT_SCREENING: 414,
	ADMIN_REJECT_ACCOUNT: 415,
	LOGIN_STATUS_HOME_SCREEN: 416,
	ADMIN_REJECTED_USER: 421,
};

const MEMBER_TYPE = {
	FREE: 'Free',
	PREMIUM: 'Premium'
}

const USER_ADMIN_STATUS = {
	PENDING: 'pending',
	VERIFIED: 'verified',
	REJECTED: 'rejected',
}
const ACCOUNT_LEVEL = {
	ADMIN: "admin",
	USER: "user"
};

const DB_MODEL_REF = {
	ADMIN: "admin",
	ADMIN_NOTIFICATION: "admin_notification",
	CONTACT: "contact",
	CONTENT: "content",
	COUPON: "coupon",
	LOG: "log",
	NOTIFICATION: "notification",
	USER: "user",
	GRATITUDE_JOURNAL: "gratitude_journal",
	LOGIN_HISTORY: "login_history",
	VERSION: "version",
	POST: "posts",
	CATEGORY: "categories",
	INSPIRATION: 'inspiration',
	HOME: 'home',
	DISCOVER: 'discover',
	SHOUTOUT: 'shoutout',
	UNICORN: 'unicorn',
	COMMENT: "comment",
	LIKE: "like",
	ADVICE: 'advice',
	MEMBER: 'member',
	EXPERT: 'expert',
	EXPERT_POST: 'expert_post'

};

const DEVICE_TYPE = {
	ANDROID: "1",
	IOS: "2",
	WEB: "3",
	ALL: "4"
};

const ADMIN_TYPE = {
	SUPER_ADMIN: "super",
	SUB_ADMIN: "sub"
};

const GENDER = {
	MALE: "male",
	FEMALE: "female",
	// ALL: "all"
	// TRANSG
};

export const INDUSTRIES = {
	// Experts_in_Executive_Burnout: "Experts in Executive Burnout",
	// Nonprofit_Resiliency_Coaches: "Nonprofit Resiliency Coaches",
	// Wellness_Coaches: "Wellness Coaches",
	// Licensed_Therapists_specializing_in_Vicarious_and_Secondary_Trauma: "Licensed Therapists specializing in Vicarious and Secondary Trauma",
	// Compassion_Fatigue: 'Compassion Fatigue',
	Nonprofit: 'Nonprofit',
	Emergency_Services: 'Emergency Services',
	Social_And_Community_Services: 'Social and Community Services',
	Law_Enforcement: "Law Enforcement",
	Healthcare_And_Community_Medical_Services: "Healthcare and Community Medical Services"
};

export const PROFESSION_TYPE = {
	Founder: "Founder",
	CEO: "CEO",
	Executive_Director: 'Executive Director',
	Managing_Director: 'Managing Director'
}

const SOCIAL_LOGIN_TYPE = {
	FACEBOOK: "facebook",
	GOOGLE: "google",
	INSTA: "instagram",
	TWITTER: "twitter",
	LINKED_IN: "linkedin",
	APPLE: "apple"
};

const STATUS = {
	BLOCKED: "blocked",
	ACTIVE: "active",
	DELETED: "deleted"
};
const COMMENT_CATEGORY = {
	POST: 1,
	COMMENT: 2
};
const DISCOVER_STATUS = {
	PENDING: 1,
	ACCEPT: 2,
	REJECT: 3,
	NO_ACTION: 4
};
const USER_PROFILE_TYPE = {
	GRATITUDE_JOURNAL: 1,
	POST: 2,
	DISCOVER: 3
};

// const COMMENT_TYPE = {
// 	UNICORN: 1,
// 	INSPIRATION: 2,
// 	DAILY_ADVICE: 3,
// 	GENERAL_GRATITUDE: 4,
// 	MEMBER_OF_DAY: 5
// };
// const COMMENT_TYPE = {
// 	UNICORN: 1,
// 	INSPIRATION: 2,
// 	DAILY_ADVICE: 3,
// 	GENERAL_GRATITUDE: 4,
// 	MEMBER_OF_DAY: 5
// };
const HOME_TYPE = {
	UNICORN: 1,
	INSPIRATION: 2,
	DAILY_ADVICE: 3,
	GENERAL_GRATITUDE: 4,
	MEMBER_OF_DAY: 5
};

const EXPERT_CONTENT_TYPE = {
	VIDEO: {
		TYPE: 'video',
		VALUE: 1,
		DISPLAY_NAME: 'VIDEO'
	},
	ARTICLE: {
		TYPE: 'article',
		VALUE: 2,
		DISPLAY_NAME: 'ARTICLE'
	},
	IMAGE: {
		TYPE: 'image',
		VALUE: 3,
		DISPLAY_NAME: 'IMAGE'
	},
	VOICE_NOTE: {
		TYPE: 'voice_note',
		VALUE: 4,
		DISPLAY_NAME: 'VOICE_NOTE'
	}
}
const MEDIA_TYPE = {
	IMAGE: 1,
	VIDEO: 2
};

const PRIVACY_STATUS = {
	PUBLIC: 'public',
	PRIVATE: 'private',
	PROTECTED: 'protected'
};

const VALIDATION_CRITERIA = {
	FIRST_NAME_MIN_LENGTH: 3,
	FIRST_NAME_MAX_LENGTH: 20,
	MIDDLE_NAME_MIN_LENGTH: 3,
	MIDDLE_NAME_MAX_LENGTH: 10,
	LAST_NAME_MIN_LENGTH: 3,
	LAST_NAME_MAX_LENGTH: 20,
	NAME_MIN_LENGTH: 3,
	COUNTRY_CODE_MIN_LENGTH: 1,
	COUNTRY_CODE_MAX_LENGTH: 4,
	PASSWORD_MIN_LENGTH: 8,
	PASSWORD_MAX_LENGTH: 30
};

const BYPASS_OTP = '4242';

const MESSAGES = {
	ERROR: {
		UNAUTHORIZED_ACCESS: {
			"statusCode": HTTP_STATUS_CODE.UNAUTHORIZED,
			"message": "You are not authorized to perform this action.",
			"type": "UNAUTHORIZED_ACCESS"
		},
		INTERNAL_SERVER_ERROR: {
			"statusCode": HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,
			"message": "Please try after some time.",
			"type": "INTERNAL_SERVER_ERROR"
		},
		INVALID_TOKEN: {
			// "statusCode": HTTP_STATUS_CODE.INVALID_TOKEN,
			"statusCode": HTTP_STATUS_CODE.UNAUTHORIZED,
			"message": "Token is invalid.",
			"type": "INVALID_TOKEN"
		},
		TOKEN_EXPIRED: {
			"statusCode": HTTP_STATUS_CODE.INVALID_TOKEN,
			"message": "Token has been expired.",
			"type": "TOKEN_EXPIRED"
		},
		TOKEN_GENERATE_ERROR: (error) => {
			return {
				"statusCode": HTTP_STATUS_CODE.BAD_REQUEST,
				"message": `${error}.`,
				"type": "TOKEN_GENERATE_ERROR"
			};
		},
		EMAIL_NOT_REGISTERED: {
			"statusCode": HTTP_STATUS_CODE.BAD_REQUEST,
			"message": "Please register your email address.",
			"type": "EMAIL_NOT_REGISTERED"
		},
		EMAIL_NOT_VERIFIED: {
			"statusCode": HTTP_STATUS_CODE.EMAIL_NOT_VERIFIED,
			"message": "Your email is not verified. Please check your email for email verification instruction.",
			"type": "EMAIL_NOT_REGISTERED"
		},
		EMAIL_ALREADY_VERIFIED: {
			"statusCode": HTTP_STATUS_CODE.BAD_REQUEST,
			"message": "Email already verified.",
			"type": "EMAIL_NOT_REGISTERED"
		},
		MOBILE_NOT_VERIFIED: {
			"statusCode": HTTP_STATUS_CODE.MOBILE_NO_NOT_VERIFY,
			"message": "Please verify your mobile number",
			"type": "MOBILE_NO_NOT_VERIFY"
		},
		BLOCKED: {
			"statusCode": HTTP_STATUS_CODE.UNAUTHORIZED,
			"message": "Your account have been blocked by admin.",
			"type": "USER_BLOCKED"
		},
		USER_BLOCKED: {
			"statusCode": HTTP_STATUS_CODE.BLOCKED_USER,
			"message": "Your account has been blocked by admin",
			"type": "USER_BLOCKED"
		},
		DELETED: {
			statusCode: HTTP_STATUS_CODE.UNAUTHORIZED,
			"message": "Your account have been deleted by admin.",
			type: "DELETED"
		},
		ADMIN_REJECTED_USER: {
			statusCode: HTTP_STATUS_CODE.ADMIN_REJECTED_USER,
			"message": "Your account is rejected in the verification process.",
			type: "REJECTED"
		},
		INCORRECT_PASSWORD: {
			"statusCode": HTTP_STATUS_CODE.ACCESS_FORBIDDEN,
			"message": "Authentication failed, wrong password.",
			"type": "INCORRECT_PASSWORD"
		},
		USER_NOT_FOUND: {
			"statusCode": HTTP_STATUS_CODE.UNREGISTERED,
			"message": "User not found.",
			"type": "USER_NOT_FOUND"
		},
		ACCESS_DENIED: {
			"statusCode": HTTP_STATUS_CODE.ACCESS_FORBIDDEN,
			"message": "Access denied.",
			"type": "ACCESS_DENIED"
		},
		INVALID_MOBILE_NUMBER: {
			"statusCode": HTTP_STATUS_CODE.UNAUTHORIZED,
			"message": "Please enter valid mobile number.",
			"type": "INVALID_MOBILE_NUMBER"
		},
		BLOCKED_MOBILE: {
			"statusCode": HTTP_STATUS_CODE.UNAUTHORIZED,
			"message": "Action blocked for illegal use of services.",
			"type": "BLOCKED_MOBILE"
		},
		SESSION_EXPIRED: {
			"statusCode": HTTP_STATUS_CODE.SESSION_EXPIRED,
			"message": "Your login session has been expired.",
			"type": "SESSION_EXPIRED"
		},
		INVALID_OTP: {
			"statusCode": HTTP_STATUS_CODE.UNAUTHORIZED,
			"message": "Invalid otp",
			"type": "INVALID_OTP"
		},
		FIELD_REQUIRED: (value) => {
			return {
				"statusCode": HTTP_STATUS_CODE.BAD_REQUEST,
				"message": value + " is required.",
				"type": "FIELD_REQUIRED"
			};
		}
	},
	SUCCESS: {
		DEFAULT: {
			"statusCode": HTTP_STATUS_CODE.OK,
			"message": "Success",
			"type": "DEFAULT"
		},
		SUCCESSFULLY_ADDED: {
			"statusCode": HTTP_STATUS_CODE.OK,
			"message": "Successfully added",
			"type": "DEFAULT"
		},
		SUCCESSFULLY_UPDATED: {
			"statusCode": HTTP_STATUS_CODE.OK,
			"message": "Successfully updated",
			"type": "DEFAULT"
		},
		REFRESH_TOKEN: (data) => {
			return {
				"statusCode": HTTP_STATUS_CODE.OK,
				"message": "Token refresh successfully",
				"type": "REFRESH_TOKEN",
				"data": data
			};
		},
		MOBILE_NOT_VERIFIED: (data) => {
			data['message'] = "Please verify your mobile number"
			return {
				"statusCode": HTTP_STATUS_CODE.MOBILE_NO_NOT_VERIFY,
				"message": "Please verify your mobile number",
				"type": "MOBILE_NO_NOT_VERIFY",
				data: data,
			}
		},
	}
};

const EMAIL_TEMPLATE = {
	SOCIAL_LINK: {
		FB: "https://www.facebook.com",
		INSTAGRAM: "https://www.instagram.com",
		TWITTER: "https://twitter.com"
	},
	GSG_ADDRESS: "Appinventiv Technologies Pvt. Ltd. B-25 Nr Thomson Reuters, Sector 58, Noida, Uttar Pradesh 201301, India",
	SUBJECT: {
		FORGOT_PWD_EMAIL: "Reset Password Request",
		RESET_PASSWORD: "Reset password link",
		VERIFY_EMAIL: "Verify e-mail address",
		WELCOME: "Welcome to Women community!",
		IMPORT_SHEET_FAILURE: "Import Sheet Failure"
	},
	BCC_MAIL: ["shubham.maheshwari@appinventiv.com"],
	FROM_MAIL: "do-not-reply@mail.appinventive.com"
};

const SMS = {
	TOKEN: "[TOKEN]",
	TEMPLATES: {
		FORGOT_PASSWORD: "Your forgot password link!\
		\nLINK\
		\n \
		\nRegards, \nRCC app",
		WELCOME: "Welcome! Thank you for creating rcc user\
		\naccount. You are almost there… To start your service,\
		\nplease enter your Email as EMAIL and password as PASSWORD\
		\nin the below link\
		\nLINK\
		\n \
		\nRegards, \nRCC app",
	}
};

const NOTIFICATION_TYPE = {
	BULK_NOTIFICATION: "1",
	ONE_TO_ONE: "2"
};

const SNS_SERVER_TYPE = {
	DEV: "APNS_SANDBOX",
	PROD: "APNS"
};

const CONTENT_TYPE = {
	PRIVACY_POLICY: "1",
	TERMS_AND_CONDITIONS: "2",
	FAQ: "3",
	CONTACT_US: "4",
	ABOUT_US: "5"
};

const MIME_TYPE = {
	XLSX: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
	CSV1: "application/vnd.ms-excel",
	CSV2: "text/csv",
	XLS: "application/vnd.ms-excel"
};

const EXCEL_KEY_MAP = {
	"First Name": "firstName",
	"Middle Name": "middleName",
	"Last Name": "lastName",
	"DOB": "dob",
	"Gender": "gender",
	"Email": "email",
	"Country Code": "countryCode",
	"Mobile Number": "mobileNo"
	// 'Company Reg 1':{'parent':'companyReg', 'child':'registration1'}
};

const REGEX = {
	EMAIL: /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,63}$/,
	// EMAIL: /^(([^<>()\[\]\\.,;:\s@']+(\.[^<>()\[\]\\.,;:\s@']+)*)|('.+'))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
	/* URL: /^(http?|ftp|https):\/\/([a-zA-Z0-9.-]+(:[a-zA-Z0-9.&%$-]+)*@)*((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]?)(\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])){3}|([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+\.(com|edu|gov|\
		int|mil|net|org|biz|arpa|info|name|pro|aero|coop|museum|[a-zA-Z]{2}))(:[0-9]+)*(\/($|[a-zA-Z0-9.,?'\\+&%$#=~_-]+))*$/, */
	URL: /^(https?|http|ftp|torrent|image|irc):\/\/(-\.)?([^\s\/?\.#-]+\.?)+(\/[^\s]*)?$/i,
	SSN: /^(?!219-09-9999|078-05-1120)(?!666|000|9\d{2})\d{3}-(?!00)\d{2}-(?!0{4})\d{4}$/, // US SSN
	ZIP_CODE: /^[0-9]{5}(?:-[0-9]{4})?$/,
	// PASSWORD: /(?=[^A-Z]*[A-Z])(?=[^a-z]*[a-z])(?=[^0-9]*[0-9]).{8,}/, // Minimum 6 characters, At least 1 lowercase alphabetical character, At least 1 uppercase alphabetical character, At least 1 numeric character, At least one special character
	// PASSWORD: /^(?=.{8,})(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=]).*$/,
	COUNTRY_CODE: /^\d{1,4}$/,
	MOBILE_NUMBER: /^\d{6,16}$/,
	STRING_REPLACE: /[-+ ()*_$#@!{}|\/^%`~=?,.<>:;'"]/g,
	MONGO_ID: /^[a-f\d]{24}$/i
};

const VERSION_UPDATE_TYPE = {
	NORMAL: "normal",  // skippable
	FORCEFULLY: "forcefully"
};

const EXPORT_SHEET = {
	USER_LIST: [
		{ header: "S No.", key: "S No." },
		{ header: "First Name", key: "First Name", width: 32, outlineLevel: 1 },
		{ header: "Middle Name", key: "Middle Name", width: 32, outlineLevel: 1 },
		{ header: "Last Name", key: "Last Name", width: 32, outlineLevel: 1 },
		{ header: "DOB", key: "DOB", width: 32, outlineLevel: 1 },
		{ header: "Gender", key: "Gender", width: 32, outlineLevel: 1 },
		{ header: "Email", key: "Email", width: 32, outlineLevel: 1 },
		{ header: "Country Code", key: "Country Code" },
		{ header: "Moblile Number", key: "Moblile Number", width: 32, outlineLevel: 1 },
		{ header: "Registration Date", key: "Registration Date", width: 32, outlineLevel: 1 },
		{ header: "Status", key: "Status", width: 32, outlineLevel: 1 }
	],
	FILE_SAMPLE: [
		{ header: "S No.", key: "S No." },
		{ header: "First Name", key: "First Name", width: 32, outlineLevel: 1 },
		{ header: "Middle Name", key: "Middle Name", width: 32, outlineLevel: 1 },
		{ header: "Last Name", key: "Last Name", width: 32, outlineLevel: 1 },
		{ header: "DOB", key: "DOB", width: 32, outlineLevel: 1 },
		{ header: "Gender", key: "Gender", width: 32, outlineLevel: 1 },
		{ header: "Email", key: "Email", width: 32, outlineLevel: 1 },
		{ header: "Country Code", key: "Country Code" },
		{ header: "Moblile Number", key: "Moblile Number", width: 32, outlineLevel: 1 }
	],
	FAILED_USER_LIST: [
		{ header: "First Name", key: "First Name", width: 32, outlineLevel: 1 },
		{ header: "Middle Name", key: "Middle Name", width: 32, outlineLevel: 1 },
		{ header: "Last Name", key: "Last Name", width: 32, outlineLevel: 1 },
		{ header: "DOB", key: "DOB", width: 32, outlineLevel: 1 },
		{ header: "Gender", key: "Gender", width: 32, outlineLevel: 1 },
		{ header: "Email", key: "Email", width: 32, outlineLevel: 1 },
		{ header: "Country Code", key: "Country Code" },
		{ header: "Moblile Number", key: "Moblile Number", width: 32, outlineLevel: 1 },
		{ header: "Failed Reason", key: "Failed Reason", width: 40, outlineLevel: 1 }
	],
};

const PUSH_SENDING_TYPE = {
	SNS: 1,
	FCM: 2,
	APNS: 3
};

const MAIL_SENDING_TYPE = {
	SENDGRID: 1,
	SMTP: 2,
	AMAZON: 3
};

const SMS_SENDING_TYPE = {
	TWILIO: 1,
	AWS_SDK: 2
};

const NOTIFICATION_DATA = {
	BULK_NOTIFICATION: (title, message) => {
		return {
			"type": NOTIFICATION_TYPE.BULK_NOTIFICATION,
			"message": `${message}`,
			"title": `${title}`
		};
	},
	ONE_TO_ONE: (title, message) => {
		return {
			"type": NOTIFICATION_TYPE.ONE_TO_ONE,
			"message": `${message}`,
			"title": `${title}`
		};
	}
};

const DEEPLINK = {
	DEFAULT_FALLBACK_URL: "https://google.com",
	// for android deeplink
	// ANDROID_SCHEME: "ustandbyuser://" + SERVER.APP_URL.split("://")[1], // scheme:// + app url + ?token=&type=
	ANDROID_SCHEME: "com.womencommunity://",
	// for ios user deeplink
	IOS_SCHEME: "com.womencommunity://",
	// for ios sp deeplink
	IOS_STORE_LINK: "https://itunes.apple.com",
	ANDROID_PACKAGE_NAME: "com.womencommunity", // when app is not installed redirect to google playstore
	IOS_PACKAGE_NAME: "com.womencommunity"
};
const WEBSITE_URL = {
	ADMIN_URL: "http://womenappdevadmin.appskeeper.com"
};

let SOCKET = {
	DEFAULT: {
		CONNECTION: "connection",
		CONNECTED: "connected",
		DISCONNECT: "disconnect",
	},
	TYPE: {
		CONTACT_SYNCING: 1,
		BELL_COUNT: 2
	},
	ERROR: {
		FAILURE_ACKNOWLEDGEMENT: (listner) => {
			return {
				"statusCode": HTTP_STATUS_CODE.BAD_REQUEST,
				"message": "Message not recveived on server.",
				"type": "FAILURE_ACKNOWLEDGEMENT",
				"data": {
					"listner": listner
				}
			};
		},
		INVALID_LISTENER_TYPE: {
			"statusCode": HTTP_STATUS_CODE.BAD_REQUEST,
			"message": "Invalid Listener type.",
			"type": "INVALID_LISTENER_TYPE",
			"data": {}
		},
		AUTHORIZATION: {
			"statusCode": HTTP_STATUS_CODE.BAD_REQUEST,
			"message": "Error in authorization.",
			"type": "AUTHORIZATION_ERROR",
			"data": {}
		},
		NETWORK: {
			"statusCode": HTTP_STATUS_CODE.BAD_REQUEST,
			"message": "Implementation error.",
			"type": "NETWORK_ERROR",
			"data": {}
		},
		SOCKET: {
			"statusCode": HTTP_STATUS_CODE.BAD_REQUEST,
			"message": "Socket Implementation error.",
			"type": "SOCKET_ERROR",
			"data": {}
		}
	},
	SUCCESS: {
		CONNECTION_ESTABLISHED: {
			"statusCode": HTTP_STATUS_CODE.OK,
			"message": "Connection Established",
			"data": {}
		},
		CONTACT_SYNCING: (data) => {
			return {
				"statusCode": data.statusCode,
				"message": "Contacts synchronize successfully.",
				"type": "CONTACT_SYNCING",
				"data": {
					"contacts": data.contacts,
					"lastSno": data.lastSno
				}
			};
		}
	},
	EVENT: {
		NETWORK_ERROR: "network-error",
		SOCKET_ERROR: "socket-error",
		ACK_ERROR: "ack-error",
		INSUFFICIENT_INFO_ERROR: "insufficient-info",
		AUTHORIZATION_ERROR: "authorization-error",
		CONTACT_SYNC: "contact-sync", // add
		CONTACT_FETCH: "contact-fetch",
		CONTACT_DELETE: "contact-delete",
		CONTACT_UPDATE: "contact-update",
		BELL_COUNT: "bell-count"
	}
};

const LOG_HISTORY_TYPE = {
	ADD_USER: "1",
	EDIT_USER: "2",
	DELETE_USER: "3",
	BLOCK_USER: "4",
	UNBLOCK_USER: "5"
};

const TEMPLATES = {
	FAQ: (question, answer) => {
		return `<div class="coll-box">
			<div class="col-header clearfix">
			<span><img src="./public/images/plus.svg" > </span>
			<h3>
			${question}
				</h3>
				</div>
				<div class= "col-content hide-col-con">
				${answer} </div>
			</div>`;
	}
};

const GRAPH_TYPE = {
	DAILY: "DAILY",
	WEEKLY: "WEEKLY",
	MONTHLY: "MONTHLY",
	YEARLY: "YEARLY"
};

const MONTHS = [
	{ index: 1, day: 31, week: 5 },
	{ index: 2, day: 28, week: 4 },
	// { index: 2, day: 29, week: 5 },
	{ index: 3, day: 31, week: 5 },
	{ index: 4, day: 30, week: 5 },
	{ index: 5, day: 31, week: 5 },
	{ index: 6, day: 30, week: 5 },
	{ index: 7, day: 31, week: 5 },
	{ index: 8, day: 31, week: 5 },
	{ index: 9, day: 30, week: 5 },
	{ index: 10, day: 31, week: 5 },
	{ index: 11, day: 30, week: 5 },
	{ index: 12, day: 31, week: 5 }
];

const MONTH_NAME = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"];

const JOB_SCHEDULER_TYPE = {
	AUTO_SESSION_EXPIRE: "AUTO_SESSION_EXPIRE"
};

const PAGINATION = {
	limit: 10,
	page: 1
}

export const CONSTANT = Object.freeze({
	SWAGGER_DEFAULT_RESPONSE_MESSAGES: SWAGGER_DEFAULT_RESPONSE_MESSAGES,
	HTTP_STATUS_CODE: HTTP_STATUS_CODE,
	ACCOUNT_LEVEL: ACCOUNT_LEVEL,
	DB_MODEL_REF: DB_MODEL_REF,
	DEVICE_TYPE: DEVICE_TYPE,
	ADMIN_TYPE: ADMIN_TYPE,
	GENDER: GENDER,
	SOCIAL_LOGIN_TYPE: SOCIAL_LOGIN_TYPE,
	STATUS: STATUS,
	VALIDATION_CRITERIA: VALIDATION_CRITERIA,
	MESSAGES: MESSAGES,
	EMAIL_TEMPLATE: EMAIL_TEMPLATE,
	SMS: SMS,
	HOME_TYPE: HOME_TYPE,
	NOTIFICATION_TYPE: NOTIFICATION_TYPE,
	SNS_SERVER_TYPE: SNS_SERVER_TYPE,
	CONTENT_TYPE: CONTENT_TYPE,
	MIME_TYPE: MIME_TYPE,
	EXCEL_KEY_MAP: EXCEL_KEY_MAP,
	REGEX: REGEX,
	VERSION_UPDATE_TYPE: VERSION_UPDATE_TYPE,
	EXPORT_SHEET: EXPORT_SHEET,
	PUSH_SENDING_TYPE: PUSH_SENDING_TYPE,
	MAIL_SENDING_TYPE: MAIL_SENDING_TYPE,
	SMS_SENDING_TYPE: SMS_SENDING_TYPE,
	NOTIFICATION_DATA: NOTIFICATION_DATA,
	DEEPLINK: DEEPLINK,
	SOCKET: SOCKET,
	LOG_HISTORY_TYPE: LOG_HISTORY_TYPE,
	TEMPLATES: TEMPLATES,
	GRAPH_TYPE: GRAPH_TYPE,
	MONTHS: MONTHS,
	MONTH_NAME: MONTH_NAME,
	JOB_SCHEDULER_TYPE: JOB_SCHEDULER_TYPE,
	DEFAULT_PASSWORD: "String@123",
	BYPASS_OTP,
	WEBSITE_URL,
	PAGINATION,
	PRIVACY_STATUS,
	ENUM,
	MEMBER_TYPE,
	USER_ADMIN_STATUS,
	COMMENT_CATEGORY: COMMENT_CATEGORY,
	// COMMENT_TYPE: COMMENT_TYPE,
	MEDIA_TYPE: MEDIA_TYPE,
	EXPERT_CONTENT_TYPE,
	PROFESSION_TYPE,
	DISCOVER_STATUS,
	USER_PROFILE_TYPE
});