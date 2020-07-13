const cron = require("node-cron");
const request = require("request");
import { memberDao } from "@modules/admin/memberOfDay/v1/MemberDao";
import * as config from "@config/index";
import { userDao } from "@modules/user";

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

			const a = 1;
			const criteria = {
				status: config.CONSTANT.STATUS.ACTIVE,
				isAdminVerified: true,
				countMember: 1,

			};

			const getUsers = userDao.findOne('users', criteria, {}, {});
			// const GetUser = await memberDao.findOne

		}, { scheduled: false });
		task.start();
	}
}