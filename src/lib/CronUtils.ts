const cron = require("node-cron");
const request = require("request");
// import { memberDao } from "@modules/admin/memberOfDay/v1/MemberDao";
import * as config from "@config/index";
import { userDao } from "@modules/user";

const baseUrl = config.SERVER.APP_URL + config.SERVER.API_BASE_URL;
let task;

export class CronUtils {

	constructor() { }

	static init() {
		// this will execute on the server time at 00:01:00 each day by server time
		task = cron.schedule("00 01 00 * * *", async function () {
			// task = cron.schedule('* * * * * *', function () {
			console.log("this will execute on the server time at 00:01:00 each day by server time");
			// request.get(baseUrl + "/common/appointment/upcoming");
			// request.get(baseUrl + "/common/appointment/pending");

			let a = 0;
			// if (globalVariable = 1) {
			// 	countMember: a
			// }
			const criteria = [
				{
					$match: {
						status: config.CONSTANT.STATUS.ACTIVE,
						// isAdminVerified: true,
						adminStatus: config.CONSTANT.USER_ADMIN_STATUS.VERIFIED,
						countMember: 0,
					}
				},
				{ $sample: { size: 1 } } // You want to get 5 docs
			];
			const dataToUpdate = {
				countMember: a,
				memberCreatedAt: new Date()
			};
			console.log('criteriacriteriacriteria', criteria);

			const getUsers = await userDao.aggregate('users', criteria, {});
			console.log('getUsersgetUsersppppppppppppp', getUsers);

			// const GetUser = await memberDao.findOne

			if (getUsers && getUsers[0]) {
				const criteria = {
					_id: getUsers[0]._id
				};
				const data = await userDao.findOneAndUpdate('users', criteria, dataToUpdate, {});
				console.log('datadatadatadata', data);
			}

		}, { scheduled: false });
		task.start();
	}

}