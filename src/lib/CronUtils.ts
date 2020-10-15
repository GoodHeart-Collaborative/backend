const cron = require("node-cron");
const request = require("request");
// import { memberDao } from "@modules/admin/memberOfDay/v1/MemberDao";
import * as config from "@config/index";
import { userDao } from "@modules/user";
import * as  userDao1 from "@modules/user/v1/UserDao";

import * as notification from '@utils/NotificationManager';
const baseUrl = config.SERVER.APP_URL + config.SERVER.API_BASE_URL;
let task;

export class CronUtils {

	constructor() { }
	init() {
		// this will execute on the server time at 00:01:00 each day by server time
		task = cron.schedule("5 0 * * *", async function () {
			// task = cron.schedule('* * * * * *', function () {
			console.log("this will execute on the server time at 00:01:00 each day by server time");
			// request.get(baseUrl + "/common/appointment/upcoming");
			cronJob.createMember();

		}, { scheduled: false });
		task.start();
	}

	async createMember() {
		const minMemberCount = await userDao.findOne('global_var', {}, {}, {}, {});

		console.log('minMemberCountminMemberCountminMemberCount', minMemberCount);

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
		console.log('getUsersgetUsers', getUsers);

		const params: any = {};

		if (!getUsers || !getUsers[0]) {
			const updatePreviousMemberToFalse = await userDao.findOneAndUpdate('users', { isMemberOfDay: true }, { isMemberOfDay: false }, {});
			await this.updateCount(minMemberCount);
			return;
		}
		if (getUsers || getUsers[0]) {
			const getIsLike = await userDao1.userDao.getMemberOfDays({ userId: getUsers[0]._id });
			console.log('getIsLikegetIsLike', getIsLike);
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
		console.log('findGlobalCountfindGlobalCount', findGlobalCount);
		this.createMember();
	}

}

export const cronJob = new CronUtils()





	// }
		// if (!getUsers || !getUsers[0]) {
		// 	const findGlobalCount1 = await userDao.find('global_var', {}, {}, {}, {}, {}, {});


		// 	const findGlobalCount = await userDao.updateOne('global_var', { _id: findGlobalCount1._id }, {}, {});
		// 	console.log('findGlobalCountfindGlobalCount', findGlobalCount);

		// 	const criteria1 = [
		// 		{
		// 			$match: {
		// 				status: config.CONSTANT.STATUS.ACTIVE,
		// 				adminStatus: config.CONSTANT.USER_ADMIN_STATUS.VERIFIED,
		// 				isEmailVerified: true,
		// 				countMember: { $not: { $lt: minMemberCount.countMember } }
		// 			}
		// 		},
		// 		{ $sample: { size: 1 } } // You want to get 5 docs
		// 	];
		// 	console.log(' minMemberCount.countMember minMemberCount.countMember', minMemberCount.countMember);

		// 	const dataToUpdate = {
		// 		countMember: minMemberCount.countMember + 1,
		// 		memberCreatedAt: new Date(),
		// 	};

		// 	const getUser = await userDao.aggregate('users', criteria1, {});
		// 	console.log('datadatadatadata>>>>>>>>', getUser);

		// 	const data = await userDao.findOneAndUpdate('users', { _id: getUser[0]._id }, dataToUpdate, {});

		// }
