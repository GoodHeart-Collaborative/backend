"use strict";

import * as _ from "lodash";

import * as config from "@config/index";

export class AdminMapper {

	dashboardGraphResponseMapping(params, response) {
		try {
			if (params.type === config.CONSTANT.GRAPH_TYPE.DAILY) {
				let isLeap = false;
				if ((params.year % 4 === 0 && params.year % 400 !== 0) || (params.year % 400 === 0)) {
					isLeap = true;
				}
				if (params.month === 2) {
					if (isLeap) {
						config.CONSTANT.MONTHS[params.month - 1].day = 29;
					} else {
						config.CONSTANT.MONTHS[params.month - 1].day = 28;
					}
				}

				let array = [];

				for (let i = 1; i <= config.CONSTANT.MONTHS[params.month - 1].day; i++) {
					let resultFound = false;
					for (let j = 0; j < response.length; j++) {
						if (response[j].day === i) {
							resultFound = true;
							array.push(response[j]);
							break;
						}
					}
					if (!resultFound) {
						array.push({ "day": i, "count": 0 });
					}
				}

				array = _.sortBy(array, "day");

				response = [];
				for (let i = 0; i < array.length; i++) {
					// response.push({ "day": "Day " + array[i].day, "count": array[i].count });
					response.push({ "day": array[i].day, "count": array[i].count });
				}

				let keyArray = [];
				let valueArray = [];

				keyArray = response.map(value => value.day);
				valueArray = response.map(value => value.count);

				response = {};

				response.keyArray = keyArray;
				response.valueArray = valueArray;
			}

			if (params.type === config.CONSTANT.GRAPH_TYPE.WEEKLY) {
				let isLeap = false;
				if ((params.year % 4 === 0 && params.year % 400 !== 0) || (params.year % 400 === 0)) {
					isLeap = true;
				}
				if (params.month === 2) {
					if (isLeap) {
						config.CONSTANT.MONTHS[params.month - 1].week = 5;
					} else {
						config.CONSTANT.MONTHS[params.month - 1].week = 4;
					}
				}

				let array = [];

				for (let i = 1; i <= config.CONSTANT.MONTHS[params.month - 1].week; i++) {
					let resultFound = false;
					for (let j = 0; j < response.length; j++) {
						if (response[j].week === i) {
							resultFound = true;
							array.push(response[j]);
							break;
						}
					}
					if (!resultFound) {
						array.push({ "week": i, "count": 0 });
					}
				}

				array = _.sortBy(array, "week");

				response = [];
				for (let i = 0; i < array.length; i++) {
					response.push({ "week": "Week " + array[i].week, "count": array[i].count });
				}

				let keyArray = [];
				let valueArray = [];

				keyArray = response.map(value => value.week);
				valueArray = response.map(value => value.count);

				response = {};

				response.keyArray = keyArray;
				response.valueArray = valueArray;
			}

			if (params.type === config.CONSTANT.GRAPH_TYPE.MONTHLY) {
				let array = [];

				for (let i = 1; i <= 12; i++) {
					let resultFound = false;
					for (let j = 0; j < response.length; j++) {
						if (response[j].month === i) {
							resultFound = true;
							array.push(response[j]);
							break;
						}
					}
					if (!resultFound) {
						array.push({ "month": i, "count": 0 });
					}
				}

				array = _.sortBy(array, "month");

				response = [];
				for (let i = 0; i < array.length; i++) {
					response.push({ "month": config.CONSTANT.MONTH_NAME[i], "count": array[i].count });
				}

				let keyArray = [];
				let valueArray = [];

				keyArray = response.map(value => value.month);
				valueArray = response.map(value => value.count);

				response = {};

				response.keyArray = keyArray;
				response.valueArray = valueArray;
			}

			if (params.type === config.CONSTANT.GRAPH_TYPE.YEARLY) {
				if (response.length) {
					response = _.sortBy(response, "year");
				} else {
					for (let i = 2019; i <= new Date().getFullYear(); i++) {
						response.push({ "year": i, "count": 0 });
					}
				}

				let keyArray = [];
				let valueArray = [];

				keyArray = response.map(value => value.year);
				valueArray = response.map(value => value.count);

				response = {};

				response.keyArray = keyArray;
				response.valueArray = valueArray;
			}

			return response;
		} catch (error) {
			throw error;
		}
	}

	userReportGraphResponseMapping(params, response) {
		try {
			if (params.type === config.CONSTANT.GRAPH_TYPE.DAILY) {
				let isLeap = false;
				if ((params.year % 4 === 0 && params.year % 400 !== 0) || (params.year % 400 === 0)) {
					isLeap = true;
				}
				if (params.month === 2) {
					if (isLeap) {
						config.CONSTANT.MONTHS[params.month - 1].day = 29;
					} else {
						config.CONSTANT.MONTHS[params.month - 1].day = 28;
					}
				}

				let array = [];

				for (let i = 1; i <= config.CONSTANT.MONTHS[params.month - 1].day; i++) {
					let resultFound = false;
					for (let j = 0; j < response.length; j++) {
						if (response[j].day === i) {
							resultFound = true;
							array.push(response[j]);
							break;
						}
					}
					if (!resultFound) {
						array.push({ "day": i, "iosUsersCount": 0, "androidUsersCount": 0, "webUsersCount": 0 });
					}
				}

				array = _.sortBy(array, "day");

				response = [];
				for (let i = 0; i < array.length; i++) {
					// response.push({ "day": "Day " + array[i].day, "count": array[i].count });
					response.push({ "day": array[i].day, "iosUsersCount": array[i].iosUsersCount, "androidUsersCount": array[i].androidUsersCount, "webUsersCount": array[i].webUsersCount });
				}

				let keyArray, iosUsersArray, androidUsersArray, webUsersArray = [];

				keyArray = response.map(value => value.day);
				iosUsersArray = response.map(value => value.iosUsersCount);
				androidUsersArray = response.map(value => value.androidUsersCount);
				webUsersArray = response.map(value => value.webUsersCount);

				response = {};

				response.keyArray = keyArray;
				if (params.platform === config.CONSTANT.DEVICE_TYPE.IOS) {
					response.iosUsersArray = iosUsersArray;
				} else if (params.platform === config.CONSTANT.DEVICE_TYPE.ANDROID) {
					response.androidUsersArray = androidUsersArray;
				} else if (params.platform === config.CONSTANT.DEVICE_TYPE.WEB) {
					response.webUsersArray = webUsersArray;
				} else {
					response.iosUsersArray = iosUsersArray;
					response.androidUsersArray = androidUsersArray;
					response.webUsersArray = webUsersArray;
				}
			}

			if (params.type === config.CONSTANT.GRAPH_TYPE.WEEKLY) {
				let isLeap = false;
				if ((params.year % 4 === 0 && params.year % 400 !== 0) || (params.year % 400 === 0)) {
					isLeap = true;
				}
				if (params.month === 2) {
					if (isLeap) {
						config.CONSTANT.MONTHS[params.month - 1].week = 5;
					} else {
						config.CONSTANT.MONTHS[params.month - 1].week = 4;
					}
				}

				let array = [];

				for (let i = 1; i <= config.CONSTANT.MONTHS[params.month - 1].week; i++) {
					let resultFound = false;
					for (let j = 0; j < response.length; j++) {
						if (response[j].week === i) {
							resultFound = true;
							array.push(response[j]);
							break;
						}
					}
					if (!resultFound) {
						array.push({ "week": i, "iosUsersCount": 0, "androidUsersCount": 0, "webUsersCount": 0 });
					}
				}

				array = _.sortBy(array, "week");

				response = [];
				for (let i = 0; i < array.length; i++) {
					response.push({ "week": "Week " + array[i].week, "iosUsersCount": array[i].iosUsersCount, "androidUsersCount": array[i].androidUsersCount, "webUsersCount": array[i].webUsersCount });
				}

				let keyArray, iosUsersArray, androidUsersArray, webUsersArray = [];

				keyArray = response.map(value => value.week);
				iosUsersArray = response.map(value => value.iosUsersCount);
				androidUsersArray = response.map(value => value.androidUsersCount);
				webUsersArray = response.map(value => value.webUsersCount);

				response = {};

				response.keyArray = keyArray;
				if (params.platform === config.CONSTANT.DEVICE_TYPE.IOS) {
					response.iosUsersArray = iosUsersArray;
				} else if (params.platform === config.CONSTANT.DEVICE_TYPE.ANDROID) {
					response.androidUsersArray = androidUsersArray;
				} else if (params.platform === config.CONSTANT.DEVICE_TYPE.WEB) {
					response.webUsersArray = webUsersArray;
				} else {
					response.iosUsersArray = iosUsersArray;
					response.androidUsersArray = androidUsersArray;
					response.webUsersArray = webUsersArray;
				}
			}

			if (params.type === config.CONSTANT.GRAPH_TYPE.MONTHLY) {
				let array = [];

				for (let i = 1; i <= 12; i++) {
					let resultFound = false;
					for (let j = 0; j < response.length; j++) {
						if (response[j].month === i) {
							resultFound = true;
							array.push(response[j]);
							break;
						}
					}
					if (!resultFound) {
						array.push({ "month": i, "iosUsersCount": 0, "androidUsersCount": 0, "webUsersCount": 0 });
					}
				}

				array = _.sortBy(array, "month");

				response = [];
				for (let i = 0; i < array.length; i++) {
					response.push({ "month": config.CONSTANT.MONTH_NAME[i], "iosUsersCount": array[i].iosUsersCount, "androidUsersCount": array[i].androidUsersCount, "webUsersCount": array[i].webUsersCount });
				}

				let keyArray, iosUsersArray, androidUsersArray, webUsersArray = [];

				keyArray = response.map(value => value.month);
				iosUsersArray = response.map(value => value.iosUsersCount);
				androidUsersArray = response.map(value => value.androidUsersCount);
				webUsersArray = response.map(value => value.webUsersCount);

				response = {};

				response.keyArray = keyArray;
				if (params.platform === config.CONSTANT.DEVICE_TYPE.IOS) {
					response.iosUsersArray = iosUsersArray;
				} else if (params.platform === config.CONSTANT.DEVICE_TYPE.ANDROID) {
					response.androidUsersArray = androidUsersArray;
				} else if (params.platform === config.CONSTANT.DEVICE_TYPE.WEB) {
					response.webUsersArray = webUsersArray;
				} else {
					response.iosUsersArray = iosUsersArray;
					response.androidUsersArray = androidUsersArray;
					response.webUsersArray = webUsersArray;
				}
			}

			if (params.type === config.CONSTANT.GRAPH_TYPE.YEARLY) {
				if (response.length) {
					response = _.sortBy(response, "year");
				} else {
					for (let i = 2019; i <= new Date().getFullYear(); i++) {
						response.push({ "year": i, "iosUsersCount": 0, "androidUsersCount": 0, "webUsersCount": 0 });
					}
				}

				let keyArray, iosUsersArray, androidUsersArray, webUsersArray = [];

				keyArray = response.map(value => value.year);
				iosUsersArray = response.map(value => value.iosUsersCount);
				androidUsersArray = response.map(value => value.androidUsersCount);
				webUsersArray = response.map(value => value.webUsersCount);

				response = {};

				response.keyArray = keyArray;
				if (params.platform === config.CONSTANT.DEVICE_TYPE.IOS) {
					response.iosUsersArray = iosUsersArray;
				} else if (params.platform === config.CONSTANT.DEVICE_TYPE.ANDROID) {
					response.androidUsersArray = androidUsersArray;
				} else if (params.platform === config.CONSTANT.DEVICE_TYPE.WEB) {
					response.webUsersArray = webUsersArray;
				} else {
					response.iosUsersArray = iosUsersArray;
					response.androidUsersArray = androidUsersArray;
					response.webUsersArray = webUsersArray;
				}
			}

			return response;
		} catch (error) {
			throw error;
		}
	}
}

export const adminMapper = new AdminMapper();