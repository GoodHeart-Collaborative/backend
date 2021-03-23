const cron = require("node-cron");
// const request = require("request");
// import { memberDao } from "@modules/admin/memberOfDay/v1/MemberDao";
import * as config from "@config/index";
import { userDao } from "@modules/user";
import * as  userDao1 from "@modules/user/v1/UserDao";
import { BaseDao } from "@modules/base/BaseDao";
import * as notification from '@utils/NotificationManager';
import { CONSTANT } from "@config/index";
import * as appUtils from "@utils/appUtils";
import { subscriptionController } from "@modules/subscription/subscriptionController";
const baseUrl = config.SERVER.APP_URL + config.SERVER.API_BASE_URL;
let task;
let task2;
let task3;

export class CronUtils extends BaseDao {

	init(payload) {
		console.log("Cron job");
		// this will execute on the server time at 00:01:00 each day by server time
		// task = cron.schedule("*/1 * * * *") //, async function () {
		// task = cron.schedule('* * * * * *', function () {
		// 	console.log("this will execute on the server time at 00:01:00 each day by server time");
		// 	cronJob.createMember();

		// }, { scheduled: false });
		// task.start();

		// task2 = cron.schedule("*/10 * * * *", () => {  //every past 10 minute
		// 	this.eventReminder();
		// }, { scheduled: false });

		// task2.start();

		// task3 = cron.schedule("0 0 0 * * *", async () => {
		// 	await subscriptionController.verifySubscriptionRenewal();
		// }, { schedule: false });
		// task3.start();

		// type: Joi.string().allow(['memberOfDay', 'subscription', 'eventReminder']),

		// if (payload.type === 'memberOfDay') {
		this.createMember()
		// } else if (payload.type === 'subscription') {
		subscriptionController.verifySubscriptionRenewal();
		// } else if (payload.type === 'eventReminder') {
		// this.eventReminder()
		// }
	}

	async createMember() {
		const minMemberCount = await userDao.findOne('global_var', {}, {}, {}, {});
		console.log('minMemberCount', minMemberCount);

		const criteria = [
			{
				$match: {
					status: config.CONSTANT.STATUS.ACTIVE,
					adminStatus: config.CONSTANT.USER_ADMIN_STATUS.VERIFIED,
					countMember: minMemberCount.memberOfDayCount,
					profession: { $ne: "" },
				}
			},
			{ $sample: { size: 1 } } // You want to get 5 docs
		];
		const dataToUpdate = {
			countMember: minMemberCount.memberOfDayCount + 1,
			isMemberOfDay: true,
			memberCreatedAt: new Date()  // Date.now();
		};

		const getUsers = await userDao.aggregate('users', criteria, {});

		const params: any = {};

		if (!getUsers || !getUsers[0]) {
			const updatePreviousMemberToFalse = await userDao.findOneAndUpdate('users', { isMemberOfDay: true }, { isMemberOfDay: false }, {});
			await this.updateCount(minMemberCount);
			return;
		}
		if (getUsers || getUsers[0]) {
			const getIsLike = await userDao1.userDao.getMemberOfDays({ userId: getUsers[0]._id });
			// isComment: {
			// 	$cond: { if: { "$eq": [{ $size: "$commentData" }, 0] }, then: false, else: true }
			// },
			params['userId'] = getUsers[0]._id;
			params['title'] = 'Leader of The Day';
			// params['body'] = {
			// 	userId: getUsers[0]._id,
			// };
			params['category'] = config.CONSTANT.NOTIFICATION_CATEGORY.LEADER_OF_DAY.category;
			params['message'] = "Congratulations! You are selected as Leader of The Day";
			params['type'] = config.CONSTANT.NOTIFICATION_CATEGORY.LEADER_OF_DAY.type;
			params['body'] = getUsers[0] ?
				{
					user: {
						// user: {
						_id: getIsLike._id,
						name: getIsLike.user.name,
						profilePicUrl: getIsLike.user.profilePicUrl,
						profession: getIsLike.user.profession,
						industryType: getIsLike.user.industryType,
						experience: getIsLike.user.experience,
						about: getIsLike.user.about,

					},
					likeCount: getIsLike.likeCount,
					commentCount: getIsLike.commentCount,
					isLike: getIsLike.isLike,
					isComment: getIsLike.isComment,
					created: getIsLike.created,
					_id: getIsLike._id,
				}
				: {};

			const updatePreviousMemberToFalse = await userDao.findOneAndUpdate('users', { isMemberOfDay: true }, { isMemberOfDay: false }, {});
			const data = await userDao.findOneAndUpdate('users', { _id: getUsers[0]._id }, dataToUpdate, {});
			const data1111 = notification.notificationManager.sendMemberOfDayNotification(params);
			return;
		}

	}

	async updateCount(minMemberCount) {
		const findGlobalCount = await userDao.findOneAndUpdate('global_var', { _id: minMemberCount._id }, { memberOfDayCount: minMemberCount.memberOfDayCount + 1 }, {});
		this.createMember();
	}

	async eventReminder() {
		console.log("************** Reminder cron has been started ***********")
		const query: any = {};
		query["$and"] = [{ startDate: { $gt: new Date().getTime(), $lte: await appUtils.nextMinuteTimeStamp() } }]; //{  
		query["status"] = CONSTANT.STATUS.ACTIVE;

		const events = await this.find(CONSTANT.DB_MODEL_REF.EVENT, query, {}, { lean: true }, {}, {}, {});

		events.forEach(async (element) => {
			const eventIntrests = await this.find(CONSTANT.DB_MODEL_REF.EVENT_INTEREST, { eventId: element._id }, {}, { lean: true }, {}, {}, {});
			const members: any = [];
			eventIntrests.forEach(async (element) => {
				members.push(element.userId);
			});

			if (members.length > 0) {
				const params: any = {};
				params.members = members;
				params.title = config.CONSTANT.NOTIFICATION_CATEGORY.EVENT_REMINDER.category;
				params['body'] = {
					_id: element._id,
				};
				params.category = config.CONSTANT.NOTIFICATION_CATEGORY.EVENT_REMINDER.category;
				params.message = config.CONSTANT.NOTIFICATION_CATEGORY.EVENT_REMINDER.message;
				params.type = config.CONSTANT.NOTIFICATION_CATEGORY.EVENT_REMINDER.type;
				params['eventId'] = element._id;
				notification.notificationManager.sendBulkNotification(params, { userId: "" });
			}
		});
		console.log(events);

	}

}

export const cronJob = new CronUtils()