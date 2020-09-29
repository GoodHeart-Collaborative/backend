/**
 * /// <reference path="../node_modules/@types/mocha/index.d.ts" />
 */
require("module-alias/register");
import "mocha";
import "chai-http";
import * as chai from "chai";
const should = chai.should();
chai.use(require("chai-http"));

import * as config from "@config/index";

let accessToken;

/**
 * commented keys are not mandatory
 */
describe("User Specification Tests", () => {
	// beforeEach(async () => {
	// });

	describe("User login via (email | mobile) and password", () => {
		it("returns status code 200", (done) => {
			const request = {
				"email": "rajat@gmail.com",
				// "countryCode": "91",
				// "mobileNo": "string",
				"password": "String@123",
				"deviceId": "string",
				"deviceToken": "string"
			};
			chai.request(config.SERVER.APP_URL)
				.post(config.SERVER.API_BASE_URL + "/user/login")
				.set({
					// "authorization": "Basic cmNjOnJjY0AxMjM=",
					"platform": config.CONSTANT.DEVICE_TYPE.ANDROID,
					"api_key": config.SERVER.API_KEY
				})
				.auth(config.SERVER.BASIC_AUTH.NAME, config.SERVER.BASIC_AUTH.PASS)
				.send(request)
				.end((error, response) => {
					if (error) {
						console.log(error);
					}
					accessToken = response.body.data.accessToken;
					response.body.should.have.property("statusCode").eql(200);
					done();
				});
		});
	});

	describe("User signup via (email | mobile) and password", () => {
		it("returns status code 201", (done) => {
			const request = {
				"firstName": "rajat",
				"middleName": "string",
				"lastName": "string",
				"email": "rajat@gmail.com",
				// "countryCode": "91",
				// "mobileNo": "string",
				"password": "String@123",
				"deviceId": "string",
				"deviceToken": "string"
			};
			chai.request(config.SERVER.APP_URL)
				.post(config.SERVER.API_BASE_URL + "/user")
				.set({
					// "authorization": "Basic cmNjOnJjY0AxMjM=",
					"platform": config.CONSTANT.DEVICE_TYPE.ANDROID,
					"api_key": config.SERVER.API_KEY
				})
				.auth(config.SERVER.BASIC_AUTH.NAME, config.SERVER.BASIC_AUTH.PASS)
				.send(request)
				.end((error, response) => {
					if (error) {
						console.log(error);
					}
					response.body.should.have.property("statusCode").eql(201);
					done();
				});
		});
	});

	describe("Social Login (facebook/google)", () => {
		it("returns status code 200", (done) => {
			const request = {
				"socialLoginType": "facebook",
				"socialId": "string",
				"firstName": "rajat",
				"middleName": "string",
				"lastName": "string",
				"email": "rajat@gmail.com",
				// "countryCode": "91",
				// "mobileNo": "string",
				// "dob": 0,
				"gender": "male",
				// "profilePicture": "string",
				"deviceId": "string",
				"deviceToken": "string"
			};
			chai.request(config.SERVER.APP_URL)
				.post(config.SERVER.API_BASE_URL + "/user/social-login")
				.set({
					// "authorization": "Basic cmNjOnJjY0AxMjM=",
					"platform": config.CONSTANT.DEVICE_TYPE.ANDROID,
					"api_key": config.SERVER.API_KEY
				})
				.auth(config.SERVER.BASIC_AUTH.NAME, config.SERVER.BASIC_AUTH.PASS)
				.send(request)
				.end((error, response) => {
					if (error) {
						console.log(error);
					}
					response.body.should.have.property("statusCode").eql(200);
					done();
				});
		});
	});

	describe("Send Password reset link on (email | mobile)", () => {
		it("returns status code 200", (done) => {
			const request = {
				"email": "rajat@gmail.com",
				// "countryCode": "91",
				// "mobileNo": "string"
			};
			chai.request(config.SERVER.APP_URL)
				.post(config.SERVER.API_BASE_URL + "/user/forgot-password")
				.set({
					// "authorization": "Basic cmNjOnJjY0AxMjM=",
					"platform": config.CONSTANT.DEVICE_TYPE.ANDROID,
					"api_key": config.SERVER.API_KEY
				})
				.auth(config.SERVER.BASIC_AUTH.NAME, config.SERVER.BASIC_AUTH.PASS)
				.send(request)
				.end((error, response) => {
					if (error) {
						console.log(error);
					}
					response.body.should.have.property("statusCode").eql(200);
					done();
				});
		});
	});

	describe("User Logout API", () => {
		it("returns status code 200", (done) => {
			const request = {
				"deviceId": "string"
			};
			chai.request(config.SERVER.APP_URL)
				.post(config.SERVER.API_BASE_URL + "/user/logout")
				.set({
					"authorization": "Bearer " + accessToken,
					"platform": config.CONSTANT.DEVICE_TYPE.ANDROID,
					"api_key": config.SERVER.API_KEY
				})
				.auth(config.SERVER.BASIC_AUTH.NAME, config.SERVER.BASIC_AUTH.PASS)
				.send(request)
				.end((error, response) => {
					if (error) {
						console.log(error);
					}
					response.body.should.have.property("statusCode").eql(200);
					done();
				});
		});
	});

	// afterEach(() => {
	// });
});