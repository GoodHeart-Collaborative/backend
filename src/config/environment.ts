"use strict";

import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";

// console.log('process.envprocess.env',process.env)
const ENVIRONMENT = process.env.NODE_ENV.trim();

switch (ENVIRONMENT) {
	// case "dev":
	case "development": {
		if (fs.existsSync(path.join(process.cwd(), "/.env.development"))) {
			dotenv.config({ path: ".env.development" });
		} else {
			console.log("Unable to find Environment File");
			process.exit(1);
		}
		break;
	}
	case "stag":
	case "staging": {
		if (fs.existsSync(path.join(process.cwd(), "/.env.staging"))) {
			dotenv.config({ path: ".env.staging" });
		} else {
			process.exit(1);
		}
		break;
	}
	case "test":
	case "testing": {
		if (fs.existsSync(path.join(process.cwd(), "/.env.testing"))) {
			dotenv.config({ path: ".env.testing" });
		} else {
			process.exit(1);
		}
		break;
	}
	case "prod":
	case "production": {
		if (fs.existsSync(path.join(process.cwd(), "/.env"))) {
			dotenv.config({ path: ".env" });
		} else {
			process.exit(1);
		}
		break;
	}
	case "default": {
		if (fs.existsSync(path.join(process.cwd(), "/.env.default"))) {
			dotenv.config({ path: ".env.default" });
		} else {
			process.exit(1);
		}
		break;
	}
	case "local": {
		if (fs.existsSync(path.join(process.cwd(), "/.env.local"))) {
			dotenv.config({ path: ".env.local" });
		} else {
			process.exit(1);
		}
		break;
	}
	default: {
		if (fs.existsSync(path.join(process.cwd(), "/.env.local"))) {
			dotenv.config({ path: ".env.local" });
		} else {
			process.exit(1);
		}
	}
}

export const SERVER = Object.freeze({
	APP_NAME: "WC",
	// BASE_PATH: process.cwd(),
	TEMPLATE_PATH: process.cwd() + "/src/views/",
	UPLOAD_DIR: process.cwd() + "/src/uploads/",
	UPLOAD_IMAGE_DIR: process.cwd() + "/src/uploads/images/",
	// ONE_DAY_TIME_STAMP: 24 * 60 * 60 * 1000, // 1 day
	// LOGIN_TOKEN_EXPIRATION_TIME: "180d", // 180 days
	LOGIN_TOKEN_EXPIRATION_TIME: 180 * 24 * 60 * 60 * 1000, // 180 days
	// LOGIN_TOKEN_EXPIRATION_TIME: '20h', // 180 days

	JWT_CERT_KEY: "g8b9(-=~Sdf)",
	SALT_ROUNDS: 10,
	SERVER_URL: process.env["SERVER_URL"],
	// for private.key file use RS256, SHA256, RSA
	JWT_ALGO: "HS256", // HS384
	CHUNK_SIZE: 100,
	APP_URL: process.env["APP_URL"],
	ADMIN_URL: process.env["ADMIN_URL"],
	ADMIN_RESST_PASSWORD_URL: "/auth/reset-password/token/",
	API_BASE_URL: "",
	API_URL: process.env['API_URL'],
	flockApi: process.env['flock'],
	// API_BASE_URL: "/rcc/api",
	MONGO: {

		DB_NAME: process.env["DB_NAME"],
		DB_URL: process.env["DB_URL"],
		DB_AUTH_URL: process.env["DB_AUTH_URL"],
		OPTIONS: {
			user: process.env["DB_USER"],
			pass: process.env["DB_PASSWORD"],
			useNewUrlParser: true,
			useCreateIndex: true,
			useUnifiedTopology: true,
			// server: { socketOptions: { keepAlive: 1, connectTimeoutMS: 30000 } },
			// replset: { socketOptions: { keepAlive: 1, connectTimeoutMS: 30000 } }
			// reconnectTries: 100000,
			// reconnectInterval: 6000,
			// useFindAndModify: false
		}
	},
	ADMIN_CREDENTIALS: {
		EMAIL: "adminwc@yopmail.com",
		PASSWORD: "Admin@123",
		NAME: "Rcc Admin"
	},
	REDIS: {
		SERVER: "localhost",
		PORT: 6379,
		NAMESPACE: "rccapp",
		APP_NAME: "rcc"
	},
	SOCKET: {
		PORT: 6379,
		HOST: "localhost"
	},
	ELASTIC_SEARCH: {
		SERVER: "localhost",
		PORT: 9200,
		HOST: process.env["ELASTIC_SEARCH_HOST"]
	},
	MAIL: {
		SENDGRID: {
			API_USER: "rajat_maheshwari",
			API_KEY: "Rajat@123"
		},
		SMTP: {
			HOST: "smtp.gmail.com",
			PORT: "587",
			USER: "womencommunite@gmail.com",
			PASSWORD: "12345@women"
		}
	},
	TWILIO: {
		ACCOUNT_SID: process.env["ACCOUNT_SID"],
		AUTH_TOKEN: process.env["AUTH_TOKEN"],
		TWILIO_NUMBER: process.env["TWILIO_NUMBER"]
	},
	BASIC_AUTH: {
		NAME: "wc",
		PASS: "wc@123"
	},
	API_KEY: "1234",
	AWS_IAM_USER: {
		ACCESS_KEY_ID: process.env["AWS_ACCESS_KEY"],
		SECRET_ACCESS_KEY: process.env["AWS_SECRET_KEY"]
	},
	SNS: {
		ACCESS_KEY_ID: process.env["SNS_ACCESS_KEY_ID"],
		SECRET_ACCESS_KEY: process.env["SNS_SECRET_ACCESS_KEY"],
		ANDROID_ARN: process.env["SNS_ANDROID_ARN"],
		IOS_ARN: process.env["SNS_IOS_ARN"],
		API_VERSION: process.env["SNS_API_VERSION"],
		REGION: process.env["SNS_REGION"],
		TOPIC_ARN: process.env["TOPIC_ARN"],
		PROTOCOL: process.env["SNS_PROTOCOL"]
	},
	// option parameters constantys for s3
	S3: {
		MAX_ASYNC_S3: process.env["MAX_ASYNC_S3"], // this is the default
		S3_RETRY_COUNT: process.env["S3_RETRY_COUNT"], // this is the default
		S3_RETRY_DELAY: process.env["S3_RETRY_DELAY"], // this is the default
		MULTIPART_UPLOAD_THREASHOLD: process.env["MULTIPART_UPLOAD_THREASHOLD"], // this is the default (20 MB)
		MULTIPART_UPLOAD_SIZE: process.env["MULTIPART_UPLOAD_SIZE"], // this is the default (15 MB)
		BUCKET_NAME: process.env["S3_BUCKET_NAME"],
		PUBLIC_BUCKET_NAME: process.env["PUBLIC_BUCKET_NAME"],
		SIGNATURE_VERSION: process.env["SIGNATURE_VERSION"],
		REGION: process.env["S3_REGION"],
		ACL: process.env["ACL"],
		AWS_BASEPATH: "https://s3.amazonaws.com/"
	},
	AWS_CONSOLE: {
		ACCESS_KEY: process.env["CONSOLE_ACCESS_KEY"],
		SECRET_KEY: process.env["CONSOLE_SECRET_KEY"],
		BUCKET_NAME: process.env["CONSOLE_BUCKET_NAME"],
		SMALL_BUCKET: process.env["SMALL_PHOTOS"],
		LARGE_BUUCKET: process.env["LARGE_PHOTOS"],
		MEDIUM_BUCKET: process.env["MEDIUM_PHOTOS"]
	},
	ENVIRONMENT: process.env["NODE_ENV"],
	IP: process.env["IP"],
	PORT: process.env["PORT"],
	// ADMIN_PORT: process.env["ADMIN_PORT"],
	PROTOCOL: process.env["PROTOCOL"],
	TAG: process.env["TAG"],
	FCM_SERVER_KEY: process.env["FCM_SERVER_KEY"],
	GOOGLE_API_KEY: process.env["GOOGLE_API_KEY"],
	DISPLAY_COLORS: process.env["DISPLAY_COLORS"],
	PUSH_TYPE: 2,
	MAIL_TYPE: 2,
	SMS_TYPE: 2,
	SOCKET_TYPE: 1,
	IS_REDIS_ENABLE: false,
	IN_ACTIVITY_SESSION: false,
	IS_ELASTIC_SEARCH_ENABLE: false,
	IS_SINGLE_DEVICE_LOGIN: true
});

export const IN_APP = {
	ANDROID: {
		SUBSCRIPTIONS: {

		},
		ANDROID_PACKAGE_NAME: process.env["ANDROID_PACKAGE_NAME"]
	},
	IOS: {
		SANDBOXURL: process.env["SANDBOX_URL"],
		LIVE_URL: process.env["LIVE_URL"],
		LIVE_SHARED_SECRET: process.env["LIVE_SHARED_SECRET"]
	},
};