"use strict";

import { SERVER } from "@config/environment";
// import * as config from "@config/index";
// ${config.SERVER.APP_URL}${config.SERVER.API_BASE_URL}/

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
	DELETD_USER: 420,
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

	SUBSCRIPTION_EXPIRE_ERROR_CODE: 422

};

const EVENT_INTEREST = {
	GOING: 1,
	INTEREST: 2,
	MY_EVENT: 3
}

const MEMBER_TYPE = {
	FREE: "Free",
	PREMIUM: "Premium"
}

const USER_SUBSCRIPTION_PLAN = {
	FREE: {
		price: 0,
		value: 1
	},
	MONTHLY: {
		price: 8,
		value: 2
	},
	YEARLY: {
		price: 78,
		value: 3
	},
	NONE: {
		price: 0,
		value: 4
	}
}

// const USER_SUBSCRIPTION_PLAN_PRICE = {
// 	FREE: 0,
// 	MONTHLY: 8,
// 	YEARLY: 787,
// 	NONE: 0,
// }


const USER_ADMIN_STATUS = {
	PENDING: "pending",
	VERIFIED: "verified",
	REJECTED: "rejected",
}
const ACCOUNT_LEVEL = {
	ADMIN: "admin",
	USER: "user"
};

const DATE_FILTER = {
	LAST_WEEK: 1,
	LAST_MONTH: 2,
	TODAY: 3,
	TOMORROW: 4,
	WEEKEND: 5,
}

const DB_MODEL_REF: any = {
	ADMIN: "admin",
	ADMIN_NOTIFICATION: "admin_notification",
	CONTENT: "content",
	LOG: "log",
	NOTIFICATION: "notification",
	USER: "user",
	GRATITUDE_JOURNAL: "gratitude_journal",
	LOGIN_HISTORY: "login_history",
	VERSION: "version",
	POST: "posts",
	CATEGORY: "categories",
	INSPIRATION: "inspiration",
	HOME: "home",
	DISCOVER: "discover",
	SHOUTOUT: "shoutout",
	UNICORN: "unicorn",
	COMMENT: "comment",
	LIKE: "like",
	ADVICE: "advice",
	MEMBER: "member",
	EXPERT: "expert",
	EXPERT_POST: "expert_post",
	EVENT: "event",
	EVENT_INTEREST: "event_interest",
	FORUM: "forum",
	REPORT: "report",
	GLOBAL_VARIABLE: "global_var",
	SUBSCRIPTION: "subscription"
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


// const EVENT_CATEGORY = {
// 	EVENTS: {
// 		TYPE: "events",
// 		VALUE: 1,
// 		DISPLAY_NAME: "EVENTS"
// 	},

const REPORT_MESSAGE = {
	Explicit_photos: {
		reason: "Explicit photos",
		id: 1
	},
	Offensive_content: {
		reason: "Offensive content",
		id: 2
	},
	Impostor_accounts: {
		reason: "Impostor accounts",
		id: 3
	},
	Other: {
		reason: "Other",
		id: 4
	},


	PretendingToBeSomeOne: {
		reason: "Pretending to be Someone",
		id: 10
	},
	FAKE_ACCOUNT: {
		reason: "Fake account",
		id: 11
	},
	FAKE_NAME: {
		reason: "Fake name",
		id: 12
	},
	POSTING_IN_APPROPRIATE_THINGS: {
		reason: "Posting in appropriate things",
		id: 13
	},
	SOMETHING_ELSE: {
		reason: "Something else",
		id: 14
	}
}

const GENDER = {
	MALE: "male",
	FEMALE: "female",
	ALL: "all"
	// TRANSG
};


const EXPERIENCE_LEVEL = {
	years_0_2: "0-2 years",
	years_2_5: "2-5 years",
	years_5_10: "5-10 years",
	year_10: "10+",
}

export const INDUSTRIES = {
	NONPROFIT: 1,
	EMERGENCY_SERVICES: 2,
	SOCIAL_AND_COMMUNITY_SERVICES: 3,
	LAW_ENFORCEMENT: 4,
	HEALTHCARE_AND_COMMUNITY_MEDICAL_SERVICES: 5,
	Mental_Health: 6,
	Education: 7,
	Legal_Profession: 8
};

export const PROFESSION_TYPE = {
	Founder: "Founder",
	CEO: "CEO",
	Executive_Director: "Executive Director",
	Managing_Director: "Managing Director",
	Licensed_Counselor: "Licensed Counselor",
	Professional_Coach: "Professional Coach",
	Consultant: "Consultant",
	Professor: "Professor",
	Professional_Trainer: "Professional Trainer",
	Director: " Director",
	Manager_Supervisor: "Manager/Supervisor",
	Therapist_Counselor: "Therapist/Counselor",
	Social_Worker: "Social Worker",
	Direct_Care_Staff: "Direct Care Staff",
	Caregiver: "Caregiver",
	Doctor_Nurse_Medical_Staff: "Doctor/Nurse/Medical Staff",
	Teacher_School_Staff: "Teacher/School Staff",
	First_Responder: "First Responder",
	Attorney: "Attorney",
	Lawyer: "Lawyer",
	Paralegal: "Paralegal",
	Judge: "Judge"
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

const SUBSCRIPTION_STATUS = {
	INACTIVE: 2,
	ACTIVE: 1,
	DELETED: 3
}
const CATEGORY_TYPE = {
	EVENT_CAEGORY: 1,
	OTHER_CATEGORY: 2
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
// 	DAILY_ADVICE: 3,nnec
// 	GENERAL_GRATITUDE: 4,
// 	MEMBER_OF_DAY: 5
// };

const REQUEST_TYPE = {
	RECEIVED_REQUEST: 0,
	SEND_REQUEST: 1
}
const HOME_TYPE = {
	UNICORN: 1,
	INSPIRATION: 2,
	DAILY_ADVICE: 3,
	GENERAL_GRATITUDE: 4,
	MEMBER_OF_DAY: 5,
	CONGRATS: 6,
	EXPERTS_POST: 7,
	SHOUTOUT: 8,
	FORUM_TOPIC: 9,
	USER: 10
};

const HOME_TYPES = {
	UNICORN: "Daily smiles",
	INSPIRATION: "Inspiring women",
	DAILY_ADVICE: "Daily pep talk",
	GENERAL_GRATITUDE: "General gratitude",
	MEMBER_OF_DAY: "Leader of the day"
};


const EXPERT_CONTENT_TYPE = {
	VIDEO: {
		TYPE: "video",
		VALUE: 2,
		DISPLAY_NAME: "VIDEO"
	},
	ARTICLE: {
		TYPE: "article",
		VALUE: 3,
		DISPLAY_NAME: "ARTICLE"
	},
	IMAGE: {
		TYPE: "image",
		VALUE: 1,
		DISPLAY_NAME: "IMAGE"
	},
	VOICE_NOTE: {
		TYPE: "voice_note",
		VALUE: 4,
		DISPLAY_NAME: "VOICE_NOTE"
	},
	// NONE: {
	// 	TYPE: "none",
	// 	VALUE: 4,
	// 	DISPLAY_NAME: "NONE"
	// },

}
const MEDIA_TYPE = {
	IMAGE: 1,
	VIDEO: 2,
	NONE: 5
};

const PRIVACY_STATUS = {
	PUBLIC: "public",
	PRIVATE: "private",
	PROTECTED: "protected"
};

const EVENT_CATEGORY = {
	EVENTS: {
		TYPE: "events",
		VALUE: 1,
		DISPLAY_NAME: "EVENTS"
	},
	CLASSES: {
		TYPE: "classes",
		VALUE: 2,
		DISPLAY_NAME: "CLASSES"
	},
	TRAINING: {
		TYPE: "training",
		VALUE: 3,
		DISPLAY_NAME: "TRAINING"
	},
	MEETUP: {
		TYPE: "meetup",
		VALUE: 4,
		DISPLAY_NAME: "MEETUP"
	}
}

// const EVENT_CATEGORY = {
// 	EVENTS: "events",
// 	CLASSES: "classes",
// 	TRAINING: "training",
// 	MEETUP: "meetup"
// }
const VALIDATION_CRITERIA = {
	FIRST_NAME_MIN_LENGTH: 1,
	FIRST_NAME_MAX_LENGTH: 50,
	MIDDLE_NAME_MIN_LENGTH: 3,
	MIDDLE_NAME_MAX_LENGTH: 10,
	LAST_NAME_MIN_LENGTH: 1,
	LAST_NAME_MAX_LENGTH: 50,
	NAME_MIN_LENGTH: 3,
	COUNTRY_CODE_MIN_LENGTH: 1,
	COUNTRY_CODE_MAX_LENGTH: 4,
	PASSWORD_MIN_LENGTH: 8,
	PASSWORD_MAX_LENGTH: 40
};

const BYPASS_OTP = "4242";

const MESSAGES = {
	ERROR: {
		UNAUTHORIZED_ACCESS: {
			"statusCode": HTTP_STATUS_CODE.INVALID_TOKEN,
			"message": "You are not authorized to perform this action.",
			"type": "UNAUTHORIZED_ACCESS"
		},
		SOMETHING_WENT_WRONG: {
			"statusCode": HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,
			"message": "Something went wrong",
			"type": "SOMETHING_WENT_WRONG"
		},
		INTERNAL_SERVER_ERROR: {
			"statusCode": HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,
			"message": "Please try after some time.",
			"type": "INTERNAL_SERVER_ERROR"
		},
		SUBSCRIPTION_EXPIRED: {
			"statusCode": HTTP_STATUS_CODE.BAD_REQUEST,
			"message": "Subscription has been already expired",
			"type": "SUBSCRIPTION_EXPIRED"
		},
		APPLE_ID_ALRADY_IN_USE: {
			"statusCode": HTTP_STATUS_CODE.BAD_REQUEST,
			"message": "This apple id is already in use with other account",
			"type": "APPLE_ID_ALRADY_IN_USE"
		},
		INVALID_TOKEN: {
			"statusCode": HTTP_STATUS_CODE.INVALID_TOKEN,
			// "statusCode": HTTP_STATUS_CODE.UNAUTHORIZED,
			// "message": "Token is invalid.",
			"message": "Your login session has expired. Please login again",
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
		EMAIL_ALREADY_VERIFIED: {
			"statusCode": HTTP_STATUS_CODE.BAD_REQUEST,
			"message": "Hi your email is already verified, please login to continue",
			"type": "EMAIL_NOT_REGISTERED"
		},
		EMAIL_NOT_REGISTERED: {
			"statusCode": HTTP_STATUS_CODE.BAD_REQUEST,
			"message": "Oops! It looks like you are not registered on the network",
			"type": "EMAIL_NOT_REGISTERED"
		},
		EMAIL_NOT_VERIFIED: {
			"statusCode": HTTP_STATUS_CODE.EMAIL_NOT_VERIFIED,
			"message": "Your email is not verified. Please check your email for email verification instruction.",
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
			statusCode: HTTP_STATUS_CODE.DELETD_USER,
			"message": "Your account has been deleted by admin.",
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
		USER_SUBSCRIBED: {
			"statusCode": HTTP_STATUS_CODE.OK,
			"message": "User subscribed",
			"type": "USER_SUBSCRIBED"
		},
		USER_NOT_SUBSCRIBED: {
			"statusCode": HTTP_STATUS_CODE.OK,
			"message": "User not subscribed",
			"type": "USER_NOT_SUBSCRIBED"
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
		SUCCESSFULLY_DELETED: {
			"statusCode": HTTP_STATUS_CODE.OK,
			"message": "Successfully deleted",
			"type": "SUCCESSFULLY_DELETED"
		},
		REFRESH_TOKEN: (data) => {
			return {
				"statusCode": HTTP_STATUS_CODE.OK,
				"message": "Token refresh successfully",
				"type": "REFRESH_TOKEN",
				"data": data
			};
		},
		USER_EMAIL_VERIFY: (data) => {
			// data['message'] = "Your email has been verified. You can now login with your verified email."
			return {
				"statusCode": HTTP_STATUS_CODE.OK,
				"message": "Your email has been verified. You can now login with your verified email",
				"type": "USER_EMAIL_VERIFY",
				data: data,
			}
		},
		EMAIL_ALREADY_VERIFIED: (data) => {
			return {
				"statusCode": HTTP_STATUS_CODE.OK,
				"message": "Email already verified.",
				"type": "EMAIL_NOT_REGISTERED",
				"data": data
			}
		},
		MOBILE_NOT_VERIFIED: (data) => {
			data["message"] = "Please verify your mobile number"
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
		WELCOME: "Welcome to Good Heart Collaborative!",
		IMPORT_SHEET_FAILURE: "Import Sheet Failure"
	},
	BCC_MAIL: ["shubham.maheshwari@appinventiv.com"],
	FROM_MAIL: "app_support@goodheart.app"
};

const SMS = {
	TOKEN: "[TOKEN]",
	TEMPLATES: {
		FORGOT_PASSWORD: "Your forgot password link!\
		\nLINK\
		\n \
		\nRegards, \nWOMEN app",
		WELCOME: "Welcome! Thank you for creating women user\
		\naccount. You are almost there??? To start your service,\
		\nplease enter your Email as EMAIL and password as PASSWORD\
		\nin the below link\
		\nLINK\
		\n \
		\nRegards, \nWOMEN app",
	}
};

const NOTIFICATION_TYPE = {
	BULK_NOTIFICATION: 1,
	ONE_TO_ONE: 2
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

const REGEX = {
	EMAIL: /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,63}$/,
	// EMAIL: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
	/* URL: /^(http?|ftp|https):\/\/([a-zA-Z0-9.-]+(:[a-zA-Z0-9.&%$-]+)*@)*((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]?)(\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])){3}|([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+\.(com|edu|gov|\
		int|mil|net|org|biz|arpa|info|name|pro|aero|coop|museum|[a-zA-Z]{2}))(:[0-9]+)*(\/($|[a-zA-Z0-9.,?"\\+&%$#=~_-]+))*$/, */
	URL: /^(https?|http|ftp|torrent|image|irc):\/\/(-\.)?([^\s\/?\.#-]+\.?)+(\/[^\s]*)?$/i,
	SSN: /^(?!219-09-9999|078-05-1120)(?!666|000|9\d{2})\d{3}-(?!00)\d{2}-(?!0{4})\d{4}$/, // US SSN
	ZIP_CODE: /^[0-9]{5}(?:-[0-9]{4})?$/,
	// PASSWORD: /(?=[^A-Z]*[A-Z])(?=[^a-z]*[a-z])(?=[^0-9]*[0-9]).{8,}/, // Minimum 6 characters, At least 1 lowercase alphabetical character, At least 1 uppercase alphabetical character, At least 1 numeric character, At least one special character
	// PASSWORD: /^(?=.{8,})(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=]).*$/,
	COUNTRY_CODE: /^\d{1,4}$/,
	MOBILE_NUMBER: /^\d{6,16}$/,
	STRING_REPLACE: /[-+ ()*_$#@!{}|\/^%`~=?,.<>:;""]/g,
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
	// SENDGRID: 1,
	SMTP: 2,
	// AMAZON: 3
};

const NOTIFICATION_CATEGORY = {
	ADMIN_STATUS_VERIFIED: {
		type: 1,
		category: "ADMIN_STATUS_VERIFIED"
	},
	FRIEND_REQUEST_SEND: {
		type: 2,
		category: "FRIEND_REQUEST"
	},
	FRIEND_REQUEST_APPROVED: {
		type: 3,
		category: "VIEW_PROFILE"
	},
	LEADER_OF_DAY: {
		type: 4,
		category: "LEADER_OF_DAY"
	},
	SHOUTOUT_TAGGED_ME: {
		type: 5,
		category: "VIEW_SHOUTLIST_ACTION"
	},
	EVENT_GOING: {
		type: 6,
		category: "going"
	},
	EVENT_INTEREST: {
		type: 7,
		category: "interst events"
	},
	EVENT_REMINDER: {
		type: 8,
		category: "Event Reminder",
		message: "Your event is about to start"
	},
	// EVENT_INTEREST :{
	// 	type: 8,
	// 	category: "VIEW_SHOUTLIST_ACTION"
	// }
}

const SMS_SENDING_TYPE = {
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
	GOOGLE: 'https://google.com',
	DEFAULT_FALLBACK_URL: "http://womencomdevapi.appskeeper.com/v1/common/resetPasswordWeb",
	RESET_PASSWORD_FALLBACK_URL: `${SERVER.API_BASE_URL}?accessToken=`,
	WELCOME_FALLBACK: `${SERVER.APP_URL}/src/views/welcome-email.html`,
	// RESET_PASSWORD_FALLBACK_URL: "http://womencomdevapi.appskeeper.com/v1/common/resetPasswordWeb/?accessToken=",

	// for android deeplink
	// ANDROID_SCHEME: "ustandbyuser://" + SERVER.APP_URL.split("://")[1], // scheme:// + app url + ?token=&type=
	ANDROID_SCHEME: "com.goodheart://",
	// for ios user deeplink
	IOS_SCHEME: "com.goodheart://",
	// for ios sp deeplink
	IOS_STORE_LINK: "https://itunes.apple.com",
	ANDROID_PACKAGE_NAME: "com.goodheart", // when app is not installed redirect to google playstore
	IOS_PACKAGE_NAME: "com.goodheart"
};
const WEBSITE_URL = {
	ADMIN_URL: "http://womenappdevadmin.appskeeper.com"
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
		// return `<div class="coll-box">
		// 	<div class="col-header clearfix">
		// 	<span><img src="./public/images/plus.svg" > </span>
		// 	<h3>
		// 	${question}
		// 		</h3>
		// 		</div>
		// 		<div class= "col-content hide-col-con">
		// 		${answer} </div>
		// 	</div>`;
		return `<div class="panel_wrap">
		<button class="accordion">${question}</button>
		<div class="panel_body">
			<p> ${answer}</p>
		</div>
	</div>`

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
};

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
	REGEX: REGEX,
	VERSION_UPDATE_TYPE: VERSION_UPDATE_TYPE,
	EXPORT_SHEET: EXPORT_SHEET,
	PUSH_SENDING_TYPE: PUSH_SENDING_TYPE,
	MAIL_SENDING_TYPE: MAIL_SENDING_TYPE,
	SMS_SENDING_TYPE: SMS_SENDING_TYPE,
	NOTIFICATION_DATA: NOTIFICATION_DATA,
	DEEPLINK: DEEPLINK,
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
	USER_PROFILE_TYPE,
	EVENT_CATEGORY,
	HOME_TYPES,
	EVENT_INTEREST,
	EXPERIENCE_LEVEL,
	DATE_FILTER,
	REQUEST_TYPE,
	REPORT_MESSAGE,
	NOTIFICATION_CATEGORY,
	USER_SUBSCRIPTION_PLAN,
	SUBSCRIPTION_STATUS,
	CATEGORY_TYPE
});