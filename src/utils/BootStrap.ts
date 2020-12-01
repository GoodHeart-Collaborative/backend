"use strict";

import { adminDao } from "@modules/admin/users/AdminDao";
import { contentDao } from "@modules/content/v1/ContentDao";
import * as config from "@config/index";
import { cronJob } from "@lib/CronUtils";
import { Database } from "@utils/Database";
import { userDao } from "@modules/user";

export class BootStrap {

	private dataBaseService = new Database();

	async bootStrap(server) {

		await this.dataBaseService.connectToDb();
		await this.bootstrapSeedData();
		await this.generateMemberOfDay();

		console.log("Init Request");

		// ENABLE/DISABLE Console Logs
		if (config.SERVER.ENVIRONMENT === "production") {
			console.log = function () { };
		}
	}

	async bootstrapSeedData() {
		const adminData = {
			"email": config.SERVER.ADMIN_CREDENTIALS.EMAIL,
			"password": config.SERVER.ADMIN_CREDENTIALS.PASSWORD,
			"name": config.SERVER.ADMIN_CREDENTIALS.NAME
		};
		try {
			const step1 = await adminDao.isEmailExists(adminData, "");
			if (!step1) {
				const step2 = adminDao.createAdmin(adminData);
			}
			const step3 = await contentDao.isContentExists({ "type": config.CONSTANT.CONTENT_TYPE.CONTACT_US });
			if (!step3) {
				const data = {
					"title": "CONTACT_US",
					"description": "",
					"type": config.CONSTANT.CONTENT_TYPE.CONTACT_US
				};
				const step4 = contentDao.addContent(data);
			}
			const step5 = await contentDao.isContentExists({ "type": config.CONSTANT.CONTENT_TYPE.PRIVACY_POLICY });
			if (!step5) {
				const data = {
					"title": "PRIVACY_POLICY",
					"description": "",
					"type": config.CONSTANT.CONTENT_TYPE.PRIVACY_POLICY
				};
				const step6 = contentDao.addContent(data);
			}
			const step7 = await contentDao.isContentExists({ "type": config.CONSTANT.CONTENT_TYPE.TERMS_AND_CONDITIONS });
			if (!step7) {
				const data = {
					"title": "TERMS_AND_CONDITIONS",
					"description": "",
					"type": config.CONSTANT.CONTENT_TYPE.TERMS_AND_CONDITIONS
				};
				const step8 = contentDao.addContent(data);
			}
			const step9 = await contentDao.isContentExists({ "type": config.CONSTANT.CONTENT_TYPE.ABOUT_US });
			if (!step9) {
				const data = {
					"title": "ABOUT_US",
					"description": "",
					"type": config.CONSTANT.CONTENT_TYPE.ABOUT_US
				};
				const step10 = contentDao.addContent(data);
			}

		} catch (error) {
			return Promise.resolve();
		}
	}

	async generateMemberOfDay() {
		// cronJob.init();
		try {
			let a = 0;
			// if (globalVariable = 1) {
			// 	countMember: a
			// }
			// const criteria = [
			// 	{
			// 		$match: {
			// 			status: config.CONSTANT.STATUS.ACTIVE,
			// 			adminStatus: config.CONSTANT.USER_ADMIN_STATUS.VERIFIED,
			// 			countMember: 0,
			// 		}
			// 	},
			// 	{ $sample: { size: 1 } } // You want to get 5 docs
			// ];
			// const dataToUpdate = {
			// 	countMember: a,
			// 	isMemberOfDay: true,
			// 	memberCreatedAt: Date.now()
			// };

			// const getUsers = await userDao.aggregate('users', criteria, {});

			// if (getUsers && getUsers[0]) {
			// 	const criteria = {
			// 		_id: getUsers[0]._id
			// 	};
			// 	let startDate: any
			// 	let endDate: any
			// 	startDate = new Date();
			// 	startDate.setHours(0, 0, 0, 0);

			// 	endDate = new Date();
			// 	endDate.setHours(23, 59, 59, 999);
			// 	// await userDao.updateMany('users', { memberCreatedAt: { $gte: startDate, $lte: endDate } }, { "$unset": { memberCreatedAt: "" } }, {});
			// 	// await userDao.updateMany('users', { isMemberOfDay: true }, { "$set": { isMemberOfDay: false } }, {});
			// 	// const data = await userDao.findOneAndUpdate('users', criteria, dataToUpdate, {});
			// }

			// if (!getUsers && !getUsers[0]) {


			// }
			const checkMember = await userDao.findOne('users', { isMemberOfDay: true }, {}, {});
			console.log('checkMember', checkMember);

			if (!checkMember) {
				cronJob.createMember()
			}
			// CronUtils.init();
			return;
		} catch (error) {
			return Promise.resolve();
		}
	}
}