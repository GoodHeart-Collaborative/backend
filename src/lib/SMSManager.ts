"use strict";

import * as AWS from "aws-sdk";

import * as appUtils from "@utils/appUtils";
import * as config from "@config/index";

// Twilio Constants
const TWILIO_NUMBER = config.SERVER.TWILIO.TWILIO_NUMBER,
	client = require("twilio")(config.SERVER.TWILIO.ACCOUNT_SID, config.SERVER.TWILIO.AUTH_TOKEN);

let smsCounter = 0;

export class SMSManager {

	sendMessageViaTwilio(countryCode, mobileNo, body) {
		return client.messages.create({
			to: countryCode ? "+" + countryCode + mobileNo : "+" + mobileNo,
			from: TWILIO_NUMBER,
			body: body
		})
			.then(function (data) {
				smsCounter++;
			})
			.catch(function (error) {
				throw error;
			});
	}

	sendMessageViaAWS(countryCode, mobileNo, body) {
		// Set region
		AWS.config.update({
			region: config.SERVER.SNS.REGION,
			accessKeyId: config.SERVER.SNS.ACCESS_KEY_ID,
			secretAccessKey: config.SERVER.SNS.SECRET_ACCESS_KEY
		});
		console.log(countryCode ? "+" + countryCode + mobileNo : "+" + mobileNo);
		// Create promise and SNS service object
		const publishTextPromise = new AWS.SNS({ apiVersion: "2010-03-31" }).publish({
			Message: body,
			PhoneNumber: countryCode ? "+" + countryCode + mobileNo : "+" + mobileNo,
		}).promise();

		publishTextPromise
			.then(function (data) {
				console.log("MessageID...... is " + data.MessageId);
				smsCounter++;
			})
			.catch(function (error) {
				console.error(error, error.stack);
				throw error;
			});
	}

	_validateNumber(countryCode, mobileNo) {
		if (!appUtils.isValidMobileNumber(countryCode + "" + mobileNo)) {
			return Promise.reject(config.CONSTANT.MESSAGES.ERROR.INVALID_MOBILE_NUMBER);
		}
		if (config.SERVER.ENVIRONMENT !== "production" && smsCounter > 100) {
			return Promise.reject(config.CONSTANT.MESSAGES.ERROR.BLOCKED_MOBILE);
		}
	}

	_sendMessage(countryCode, mobileNo, body) {
		// Validate Number Locally
		this._validateNumber(countryCode, mobileNo);
		if (config.SERVER.SMS_TYPE === config.CONSTANT.SMS_SENDING_TYPE.AWS_SDK) {
			return this.sendMessageViaAWS(countryCode, mobileNo, body);
		} else { // config.CONSTANT.SMS_SENDING_TYPE.TWILIO
			return this.sendMessageViaTwilio(countryCode, mobileNo, body);
		}
	}

	sendForgotPasswordLink(countryCode, mobileNo, token) {
		return new Promise(async function (resolve, reject) {
			try {
				const link = config.SERVER.APP_URL + "/forgot-password/" + token;
				const tinyLink = await appUtils.tinyUrl(link);
				const sms = config.CONSTANT.SMS.TEMPLATES.FORGOT_PASSWORD.replace(/LINK/g, String(tinyLink));
				resolve(this._sendMessage(countryCode, mobileNo, sms));
			} catch (error) {
				throw error;
			}
		});
	}

	sendPassword(params) {
		return new Promise(async function (resolve, reject) {
			try {
				const link = `${config.SERVER.APP_URL}${config.SERVER.API_BASE_URL}/common/deepLink?fallback=${config.SERVER.ADMIN_URL}
					/login&android=${config.CONSTANT.DEEPLINK.ANDROID_SCHEME}?type=login&ios=${config.CONSTANT.DEEPLINK.IOS_SCHEME}login@&type=login`;
				const tinyLink = await appUtils.tinyUrl(link);
				const sms = config.CONSTANT.SMS.TEMPLATES.WELCOME.replace(/LINK/g, String(tinyLink)).replace(/EMAIL/g, params.email).replace(/PASSWORD/g, params.password);
				resolve(this._sendMessage(params.countryCode, params.mobileNo, sms));
			} catch (error) {
				throw error;
			}
		});
	}
}

export const smsManager = new SMSManager();