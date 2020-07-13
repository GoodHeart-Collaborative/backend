const cron = require("node-cron");
const request = require("request");

import * as config from "@config/index";

const baseUrl = config.SERVER.APP_URL + config.SERVER.API_BASE_URL;
let task;

export class CronUtils {

	constructor() { }

	static init() {
		// this will execute on the server time at 00:01:00 each day by server time
		task = cron.schedule("00 01 00 * * *", function () {
			// task = cron.schedule('* * * * * *', function () {
			console.log("this will execute on the server time at 00:01:00 each day by server time");
			// request.get(baseUrl + "/common/appointment/upcoming");
			// request.get(baseUrl + "/common/appointment/pending");
		}, { scheduled: false });
		task.start();
	}
}