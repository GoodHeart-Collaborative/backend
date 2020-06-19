"use strict";

import * as appUtils from "@utils/appUtils";
import * as config from "@config/index";
import * as userConstant from "@modules/user/userConstant";

export class UserMapper {

	async userListResponseMapping(userList, exportData) {
		try {
			const array1 = [];
			for (let i = 0; i < userList.hits.hits.length; i++) {
				let object = {};
				object["_id"] = userList.hits.hits[i]._id;
				object = { ...object, ...userList.hits.hits[i]._source };
				array1.push(object);
			}
			const array2 = [];
			for (let i = 0; i < exportData.hits.hits.length; i++) {
				let object = {};
				object["_id"] = exportData.hits.hits[i]._id;
				object = { ...object, ...exportData.hits.hits[i]._source };
				array2.push(object);
			}

			return { ...userConstant.MESSAGES.SUCCESS.USER_LIST, ...{ "data": { "userList": array1, "exportData": array2, "totalRecord": array2.length } } };
		} catch (error) {
			throw error;
		}
	}

	async exportUserResponseMapping(data: any) {
		try {
			const exportedData = [];
			let obj: any;
			let i = 0;
			data.forEach(element => {
				obj = {
					"S No.": ++i,
					"First Name": element.firstName,
					"Middle Name": element.middleName ? element.middleName : "",
					"Last Name": element.lastName ? element.lastName : "",
					"DOB": element.dob ? appUtils.convertTimestampToUnixDate(element.dob) : "",
					"Gender": element.gender ? ((element.gender === "male") ? "Male" : (element.gender === "female") ? "Female" : (element.gender === "other") ? "Other" : "") : "",
					"Email": element.email ? element.email : "",
					"Country Code": element.countryCode ? element.countryCode : "",
					"Moblile Number": element.mobileNo ? element.mobileNo : "",
					"Registration Date": appUtils.convertTimestampToUnixDate(element.created),
					"Status": (element.status === config.CONSTANT.STATUS.BLOCKED) ? "Blocked" : (element.status === config.CONSTANT.STATUS.ACTIVE) ? "Active" : ""
				};
				exportedData.push(obj);
			});
			return exportedData;
		} catch (error) {
			throw error;
		}
	}
}

export const userMapper = new UserMapper();