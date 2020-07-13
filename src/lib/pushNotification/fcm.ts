"use strict";

const FCM = require("fcm-node");

import * as config from "@config/index";

const fcmServerKey = config.SERVER.FCM_SERVER_KEY; // put your server key here
const fcm = new FCM(fcmServerKey);

export const sendPush = async function (deviceId, deviceType, payload) {
	console.log("======================>", deviceId);
	console.log("======================>", deviceType);
	console.log("======================>", payload);
	let message = {};
	if (deviceType === config.CONSTANT.DEVICE_TYPE.ANDROID) {
		message = {
			"to": deviceId,
			"data": payload.data,
			"notification": payload.notification
		};
	}
	if (deviceType === config.CONSTANT.DEVICE_TYPE.IOS) {
		message = {
			"to": deviceId,
			"data": payload.data,
			"notification": payload.notification
		};
	}
	return new Promise(async (resolve, reject) => {
		try {
			console.log(message);
			fcm.send(message, function (error, response) {
				console.log(error, response);
				if (error) {
					console.log(error);
					// reject(error);
				} else {
					resolve(response);
				}
			});
		} catch (error) {
			reject(error);
		}
	});
};

export const subscribeToTopic = async function (deviceIds, payload) {
	return new Promise(async (resolve, reject) => {
		try {
			fcm.subscribeToTopic(deviceIds, "some_topic_name", (err, res) => {
				console.log(err, res);
			});
		} catch (error) {
			reject(error);
		}
	});
};

export const unsubscribeToTopic = async function (deviceIds, payload) {
	return new Promise(async (resolve, reject) => {
		try {
			fcm.unsubscribeToTopic(deviceIds, "some_topic_name", (err, res) => {
				console.log(err, res);
			});
		} catch (error) {
			reject(error);
		}
	});
};