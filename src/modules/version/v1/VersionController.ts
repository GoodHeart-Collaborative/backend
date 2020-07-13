"use strict";

import * as config from "@config/constant";
import * as versionConstant from "@modules/version/versionConstant";
import { versionDao } from "@modules/version/v1/VersionDao";

export class VersionController {

	/**
	 * @function addVersion
	 */
	async addVersion(params: VersionRequest.Add, tokenData: TokenData) {
		try {
			if (
				tokenData.adminType === config.CONSTANT.ADMIN_TYPE.SUPER_ADMIN ||
				tokenData.permission.indexOf("add_version") !== -1
			) {
				const step1 = versionDao.addVersion(params);
				return versionConstant.MESSAGES.SUCCESS.ADD_VERSION;
			} else {
				return Promise.reject(config.CONSTANT.MESSAGES.ERROR.UNAUTHORIZED_ACCESS);
			}
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function versionList
	 */
	async versionList(params: ListingRequest, tokenData: TokenData) {
		try {
			if (
				tokenData.adminType === config.CONSTANT.ADMIN_TYPE.SUPER_ADMIN ||
				tokenData.permission.indexOf("view_version") !== -1
			) {
				const step1 = await versionDao.versionList(params);
				return versionConstant.MESSAGES.SUCCESS.VERSION_LIST({ "versionList": step1.data, "totalRecord": step1.total });
			} else {
				return Promise.reject(config.CONSTANT.MESSAGES.ERROR.UNAUTHORIZED_ACCESS);
			}
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function deleteVersion
	 */
	async deleteVersion(params: VersionRequest.Id, tokenData: TokenData) {
		try {
			if (
				tokenData.adminType === config.CONSTANT.ADMIN_TYPE.SUPER_ADMIN ||
				tokenData.permission.indexOf("delete_version") !== -1
			) {
				const step1 = versionDao.deleteVersion(params);
				return versionConstant.MESSAGES.SUCCESS.DELETE_VERSION;
			} else {
				return Promise.reject(config.CONSTANT.MESSAGES.ERROR.UNAUTHORIZED_ACCESS);
			}
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function versionDetails
	 */
	async versionDetails(params: VersionRequest.Id, tokenData: TokenData) {
		try {
			if (
				tokenData.adminType === config.CONSTANT.ADMIN_TYPE.SUPER_ADMIN ||
				tokenData.permission.indexOf("view_version") !== -1
			) {
				const step1 = await versionDao.versionDetails(params);
				return versionConstant.MESSAGES.SUCCESS.VERSION_DETAILS(step1);
			} else {
				return Promise.reject(config.CONSTANT.MESSAGES.ERROR.UNAUTHORIZED_ACCESS);
			}
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function editVersion
	 */
	async editVersion(params: VersionRequest.Edit, tokenData: TokenData) {
		try {
			if (
				tokenData.adminType === config.CONSTANT.ADMIN_TYPE.SUPER_ADMIN ||
				tokenData.permission.indexOf("edit_version") !== -1
			) {
				const step1 = versionDao.editVersion(params);
				return versionConstant.MESSAGES.SUCCESS.EDIT_VERSION;
			} else {
				return Promise.reject(config.CONSTANT.MESSAGES.ERROR.UNAUTHORIZED_ACCESS);
			}
		} catch (error) {
			throw error;
		}
	}
}

export const versionController = new VersionController();