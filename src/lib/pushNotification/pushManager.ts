"use strict";

// import * as apns from '@lib/pushNotification/apns';
import * as config from "@config/index";
import * as fcm from "@lib/pushNotification/fcm";
export const pushNotification = async function (data) {

	return new Promise(async (resolve, reject) => {
		try {
			if (config.SERVER.PUSH_TYPE === config.CONSTANT.PUSH_SENDING_TYPE.FCM) {
				const promiseResult = [];
				for (let i = 0; i < data.data.length; i++) {
					promiseResult.push(fcm.sendPush(data.data[i].deviceToken, data.deviceType, data.payload, data.data[i].userId));
				}
				resolve(Promise.all(promiseResult));
			}
		} catch (error) {
			reject(error);
		}
	});
};