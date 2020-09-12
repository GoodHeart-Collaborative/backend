"use strict";

import * as config from "@config/constant";
import * as contentConstant from "@modules/content/contentConstant";
import { contentDao } from "@modules/content/v1/ContentDao";
import * as configApi from "@config/index";

export class ContentController {

	/**
	 * @function addContent
	 */
	async addContent(params: ContentRequest.Add, tokenData: TokenData) {
		try {
			if (
				tokenData.adminType === config.CONSTANT.ADMIN_TYPE.SUPER_ADMIN ||
				tokenData.permission.indexOf("add_content") !== -1
			) {
				const isExist = await contentDao.isContentExists(params);
				if (isExist) {
					return Promise.reject(contentConstant.MESSAGES.ERROR.CONTENT_ALREADY_EXIST);
				} else {
					const step1 = contentDao.addContent(params);
					return contentConstant.MESSAGES.SUCCESS.ADD_CONTENT;
				}
			} else {
				return Promise.reject(config.CONSTANT.MESSAGES.ERROR.UNAUTHORIZED_ACCESS);
			}
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function contentList
	 */
	async contentList(params: ListingRequest, tokenData: TokenData) {
		try {
			if (
				tokenData.adminType === config.CONSTANT.ADMIN_TYPE.SUPER_ADMIN ||
				tokenData.permission.indexOf("view_content") !== -1
			) {
				const step1 = await contentDao.contentList(params);
				return contentConstant.MESSAGES.SUCCESS.CONTENT_LIST({ "contentList": step1.data, "totalRecord": step1.total });
			} else {
				return Promise.reject(config.CONSTANT.MESSAGES.ERROR.UNAUTHORIZED_ACCESS);
			}
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function deleteContent
	 */
	async deleteContent(params: ContentRequest.Id, tokenData: TokenData) {
		try {
			if (
				tokenData.adminType === config.CONSTANT.ADMIN_TYPE.SUPER_ADMIN ||
				tokenData.permission.indexOf("delete_content") !== -1
			) {
				const step1 = contentDao.deleteContent(params);
				return contentConstant.MESSAGES.SUCCESS.DELETE_CONTENT;
			} else {
				return Promise.reject(config.CONSTANT.MESSAGES.ERROR.UNAUTHORIZED_ACCESS);
			}
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function contentDetails
	 */
	async contentDetails(params: ContentRequest.Id, tokenData: TokenData) {
		try {
			if (
				tokenData.adminType === config.CONSTANT.ADMIN_TYPE.SUPER_ADMIN ||
				tokenData.permission.indexOf("view_content") !== -1
			) {
				const step1 = await contentDao.contentDetails(params);
				return contentConstant.MESSAGES.SUCCESS.CONTENT_DETAILS(step1);
			} else {
				return Promise.reject(config.CONSTANT.MESSAGES.ERROR.UNAUTHORIZED_ACCESS);
			}
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function editContent
	 * @description edit content by super admin and authenticated users
	 */
	async editContent(params: ContentRequest.Edit, tokenData: TokenData) {
		try {
			if (
				tokenData.adminType === config.CONSTANT.ADMIN_TYPE.SUPER_ADMIN ||
				tokenData.permission.indexOf("edit_content") !== -1
			) {
				const step1 = contentDao.editContent(params);
				return contentConstant.MESSAGES.SUCCESS.EDIT_CONTENT;
			} else {
				return Promise.reject(config.CONSTANT.MESSAGES.ERROR.UNAUTHORIZED_ACCESS);
			}
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function viewContent
	 */
	async viewContent(params: ContentRequest.View) {
		try {
			const step1 = await contentDao.isContentExists(params);
			if (!step1) {
				return Promise.reject(contentConstant.MESSAGES.ERROR.CONTENT_NOT_FOUND);
			} else {
				return contentConstant.MESSAGES.SUCCESS.CONTENT_DETAILS(step1);
				// return `${configApi.SERVER.API_BASE_URL}/v1/content/view?type${params.type}`
			}

		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function addFaq
	 */
	async addFaq(params: ContentRequest.AddFaq, tokenData: TokenData) {
		try {
			if (
				tokenData.adminType === config.CONSTANT.ADMIN_TYPE.SUPER_ADMIN ||
				tokenData.permission.indexOf("add_content") !== -1
			) {
				const step1 = contentDao.addFaq(params);
				return contentConstant.MESSAGES.SUCCESS.ADD_CONTENT;
			} else {
				return Promise.reject(config.CONSTANT.MESSAGES.ERROR.UNAUTHORIZED_ACCESS);
			}
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function faqList
	 */
	async faqList(tokenData: TokenData) {
		try {
			if (
				tokenData.adminType === config.CONSTANT.ADMIN_TYPE.SUPER_ADMIN ||
				tokenData.permission.indexOf("view_content") !== -1
			) {
				const step1 = await contentDao.faqList();
				return contentConstant.MESSAGES.SUCCESS.CONTENT_LIST({ "contentList": step1.data, "totalRecord": step1.total });
			} else {
				return Promise.reject(config.CONSTANT.MESSAGES.ERROR.UNAUTHORIZED_ACCESS);
			}
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function editFaq
	 * @description edit content by super admin and authenticated users
	 */
	async editFaq(params: ContentRequest.EditFaq, tokenData: TokenData) {
		try {
			if (
				tokenData.adminType === config.CONSTANT.ADMIN_TYPE.SUPER_ADMIN ||
				tokenData.permission.indexOf("edit_content") !== -1
			) {
				const step1 = contentDao.editFaq(params);
				return contentConstant.MESSAGES.SUCCESS.EDIT_CONTENT;
			} else {
				return Promise.reject(config.CONSTANT.MESSAGES.ERROR.UNAUTHORIZED_ACCESS);
			}
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function deleteFaq
	 */
	async deleteFaq(params: ContentRequest.FaqId, tokenData: TokenData) {
		try {
			if (
				tokenData.adminType === config.CONSTANT.ADMIN_TYPE.SUPER_ADMIN ||
				tokenData.permission.indexOf("delete_content") !== -1
			) {
				const step1 = contentDao.deleteFaq(params);
				return contentConstant.MESSAGES.SUCCESS.DELETE_CONTENT;
			} else {
				return Promise.reject(config.CONSTANT.MESSAGES.ERROR.UNAUTHORIZED_ACCESS);
			}
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function viewFaq
	 */
	async viewFaq() {
		try {
			const step1 = await contentDao.faqList();
			let content = "";
			for (let i = 0; i < step1.data.length; i++) {
				content = content + config.CONSTANT.TEMPLATES.FAQ(step1.data[i].question, step1.data[i].answer);
			}
			return contentConstant.MESSAGES.SUCCESS.CONTENT_DETAILS(content);
		} catch (error) {
			throw error;
		}
	}
}

export const contentController = new ContentController();