// "use strict";

// // We need to use the sns-mobile module
// const SNS = require("sns-mobile");

// import * as config from "@config/environment";

// // Object to represent the PlatformApplication
// // we're interacting with
// const androidApp = new SNS({
// 	platform: SNS.SUPPORTED_PLATFORMS.ANDROID,
// 	region: config.SERVER.SNS.REGION,
// 	apiVersion: config.SERVER.SNS.API_VERSION,
// 	accessKeyId: config.SERVER.SNS.ACCESS_KEY_ID,
// 	secretAccessKey: config.SERVER.SNS.SECRET_ACCESS_KEY,
// 	platformApplicationArn: config.SERVER.SNS.ANDROID_ARN
// });

// // const iosApp = new SNS({
// // 	platform: SNS.SUPPORTED_PLATFORMS.IOS,
// // 	region: config.SERVER.SNS.REGION,
// // 	apiVersion: config.SERVER.SNS.API_VERSION,
// // 	accessKeyId: config.SERVER.SNS.ACCESS_KEY_ID,
// // 	secretAccessKey: config.SERVER.SNS.SECRET_ACCESS_KEY,
// // 	// platformApplicationArn: config.SERVER.SNS.IOS_ARN,
// // 	// sandbox: true (This is required for targetting (iOS) APNS_SANDBOX only)
// // });

// // Handle user added events
// androidApp.on("userAdded", function (endpointArn, deviceToken) {
// 	console.log("\nSuccessfully added device with deviceToken: " + deviceToken + ".\nEndpointArn for user is: " + endpointArn);
// 	// Maybe do some other stuff...
// });

// // Handle user added events
// iosApp.on("userAdded", function (endpointArn, deviceToken) {
// 	console.log("\nSuccessfully added device with deviceToken: " + deviceToken + ".\nEndpointArn for user is: " + endpointArn);
// 	// Maybe do some other stuff...
// });

// export const registerAndroidUser = async function (deviceToken) {
// 	return new Promise((resolve, reject) => {
// 		try {
// 			// Add the user to SNS
// 			androidApp.addUser(deviceToken, null, function (error, endpointArn) {
// 				// SNS returned an error
// 				if (error) {
// 					reject(error);
// 				} else {
// 					resolve(endpointArn);
// 				}
// 			});
// 		} catch (error) {
// 			reject(error);
// 		}
// 	});
// };

// export const registerIOSUser = async function (deviceToken) {
// 	return new Promise((resolve, reject) => {
// 		try {
// 			// Add the user to SNS
// 			iosApp.addUser(deviceToken, null, function (error, endpointArn) {
// 				// SNS returned an error
// 				if (error) {
// 					reject(error);
// 				} else {
// 					resolve(endpointArn);
// 				}
// 			});
// 		} catch (error) {
// 			reject(error);
// 		}
// 	});
// };

// export const sendPushToAndroidUser = async function (endpointArn, payload) {
// 	return new Promise((resolve, reject) => {
// 		try {
// 			// Message to send
// 			androidApp.sendMessage(endpointArn, payload, function (error, messageId) {
// 				if (error) {
// 					console.log(error);
// 				} else {
// 					console.log("Successfully sent a message to device %s. MessageID was %s", endpointArn, messageId);
// 				}
// 			});
// 			resolve();
// 		} catch (error) {
// 			reject(error);
// 		}
// 	});
// };

// /**
//  * @description for sending sns push to ios users
//  * steps are 1) login to aws. 2) search for simple notification service(sns). 3) then Create platform application.
//  * 4) select Apple Development (only for development) in Push notification platform. 5) you need p12 file from app end.
//  * 6) load that file credentials 7) then submit. 8) then go to Applications, search for the application you have created before.
//  * 9) copy arn of your application and configure it in your environment.
//  */
// export const sendPushToIOSUser = async function (endpointArn, payload) {
// 	return new Promise((resolve, reject) => {
// 		try {
// 			// Message to send
// 			iosApp.sendMessage(endpointArn, { default: "text", APNS: payload, APNS_SANDBOX: payload }, function (error, messageId) {
// 				if (error) {
// 					console.log(error);
// 				} else {
// 					console.log("Successfully sent a message to device %s. MessageID was %s", endpointArn, messageId);
// 				}
// 			});
// 			resolve();
// 		} catch (error) {
// 			reject(error);
// 		}
// 	});
// };

// // Load the AWS SDK for Node.js
// const AWS = require("aws-sdk");
// AWS.config.update({
// 	region: config.SERVER.SNS.REGION,
// 	accessKeyId: config.SERVER.SNS.ACCESS_KEY_ID,
// 	secretAccessKey: config.SERVER.SNS.SECRET_ACCESS_KEY
// });