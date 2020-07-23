"use strict";

import { adminDao } from "@modules/admin/users/AdminDao";
import { contentDao } from "@modules/content/v1/ContentDao";
import * as config from "@config/index";
import { CronUtils } from "@lib/CronUtils";
import { Database } from "@utils/Database";
import { elasticSearch, rabbitMQ, redisClient, redisStorage } from "@lib/index";
import * as socket from "@lib/socketManager";
import { userDao } from "@modules/user";

export class BootStrap {

	private dataBaseService = new Database();

	async bootStrap(server) {

		await this.dataBaseService.connectToDb();
		await this.bootstrapSeedData();
		await this.generateMemberOfDay()
		// rabbitMQ.init();

		// If elastic search engine is enabled
		if (config.SERVER.IS_ELASTIC_SEARCH_ENABLE) {
			elasticSearch.init();
		}

		// If redis is enabled
		if (config.SERVER.IS_REDIS_ENABLE) {
			redisClient.init();
			redisStorage.init();
			// socket initializer
			this.initiateSocket(server);
		}

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

			CronUtils.init();
		} catch (error) {
			return Promise.resolve();
		}
	}

	async generateMemberOfDay() {
		try {
			let a = 0;
			// if (globalVariable = 1) {
			// 	countMember: a
			// }
			const criteria = [
				{
					$match: {
						status: config.CONSTANT.STATUS.ACTIVE,
						isAdminVerified: true,
						countMember: 0,
					}
				},
				{ $sample: { size: 1 } } // You want to get 5 docs
			];
			const dataToUpdate = {
				countMember: a,
				memberCreatedAt: Date.now()
			};

			const getUsers = await userDao.aggregate('users', criteria, {});


			if (getUsers && getUsers[0]) {
				const criteria = {
					_id: getUsers[0]._id
				};
				const data = await userDao.findOneAndUpdate('users', criteria, dataToUpdate, {});
			}

			if (!getUsers && !getUsers[0]) {
				++a;

			}
			// CronUtils.init();

		} catch (error) {
			return Promise.resolve();
		}
	}

	async initiateSocket(server) {
		socket.connectSocket(server);
	}
}