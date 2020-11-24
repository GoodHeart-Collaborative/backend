"use strict";

import * as AWS from "aws-sdk";

import * as appUtils from "@utils/appUtils";
import * as config from "@config/index";

let smsCounter = 0;

export class SMSManager {

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
}

export const smsManager = new SMSManager();