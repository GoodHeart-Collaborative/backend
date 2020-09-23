"use strict";

// import * as apns from '@lib/pushNotification/apns';
import * as config from "@config/index";
import * as fcm from "@lib/pushNotification/fcm";
import * as sns from "@lib/pushNotification/sns";
export const pushNotification = async function (data) {
	return new Promise(async (resolve, reject) => {
		try {
			if (config.SERVER.PUSH_TYPE === config.CONSTANT.PUSH_SENDING_TYPE.SNS) {
				const promiseResult = [];
				for (let i = 0; i < data.data.length; i++) {
					if (data.deviceType === config.CONSTANT.DEVICE_TYPE.ANDROID) {
						promiseResult.push(sns.sendPushToAndroidUser(data.data[i].arn, data.payload));
					}
					if (data.deviceType === config.CONSTANT.DEVICE_TYPE.IOS) {
						promiseResult.push(sns.sendPushToIOSUser(data.data[i].arn, data.payload));
					}
				}
				resolve(Promise.all(promiseResult));
			} else if (config.SERVER.PUSH_TYPE === config.CONSTANT.PUSH_SENDING_TYPE.FCM) {
				const promiseResult = [];
				for (let i = 0; i < data.data.length; i++) {
					promiseResult.push(fcm.sendPush(data.data[i].deviceToken, data.deviceType, data.payload, data.payload.category));
				}
				resolve(Promise.all(promiseResult));
			}
		} catch (error) {
			reject(error);
		}
	});
};