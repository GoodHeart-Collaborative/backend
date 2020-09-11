"use strict";

import * as asyncFunction from "async";

import { adminDao } from "@modules/admin/users/AdminDao";
import * as appUtils from "@utils/appUtils";
import { baseDao } from "@modules/base/BaseDao";
import * as config from "@config/index";
import { imageCropUtil } from "@lib/ImageCropUtil";
import { TemplateUtil } from "@utils/TemplateUtil";
import * as tokenManager from "@lib/tokenManager";
import { userDao } from "@modules/user/UserDao";
import { errorReporter } from "@lib/flockErrorReporter";

export class CommonController {

	/**
	 * @function uploadImage
	 */
	async uploadImage(params) {
		try {
			return new Promise(async (resolve, reject) => {
				if (!Array.isArray(params.image))
					params.image = [params.image];
				const save = [];
				asyncFunction.each(
					params.image,
					async (value, callback) => {
						try {
							const temp = await imageCropUtil.uploadImageToS3UsingLambda(value);
							save.push(temp);
							callback();
						} catch (error) {
							reject(error);
						}
					},
					function (error) {
						if (error) {
							reject(error);
						}
						resolve(save);
					}
				);
			});
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function deepLink
	 */
	async deepLink(params: DeeplinkRequest) {
		try {
			if (params.type === "login") {
				const responseHtml = await (new TemplateUtil(config.SERVER.TEMPLATE_PATH + "deeplink.html"))
					.compileFile({
						url: params.android || "", // android scheme,
						iosLink: params.ios || "", // ios scheme
						fallback: params.fallback || config.CONSTANT.DEEPLINK.DEFAULT_FALLBACK_URL,
						title: config.SERVER.APP_NAME,
						android_package_name: config.CONSTANT.DEEPLINK.ANDROID_PACKAGE_NAME,
						ios_store_link: config.CONSTANT.DEEPLINK.IOS_STORE_LINK
					});

				return responseHtml;
			}
			else {
				let step1;
				if (params.accountLevel === config.CONSTANT.ACCOUNT_LEVEL.ADMIN) {
					step1 = await baseDao.findOne("admins", { "forgotToken": params.token }, {}, {}, {});
				} else { // config.CONSTANT.ACCOUNT_LEVEL.NORMAL_USER
					step1 = await baseDao.findOne("users", { "forgotToken": params.token }, {}, {}, {});
				}
				if (!step1) {
					return Promise.reject(config.CONSTANT.MESSAGES.ERROR.INVALID_TOKEN);
				} else {
					const jwtPayload = await tokenManager.decodeToken({ "accessToken": params.token });
					const isExpire = appUtils.isTimeExpired(jwtPayload.payload.exp * 1000);
					if (isExpire) {
						let step2;
						if (params.accountLevel === config.CONSTANT.ACCOUNT_LEVEL.ADMIN) {
							step2 = adminDao.emptyForgotToken({ "token": params.token });
						} else { // config.CONSTANT.ACCOUNT_LEVEL.NORMAL_USER
							step2 = userDao.emptyForgotToken({ "token": params.token });
						}
						return Promise.reject(config.CONSTANT.MESSAGES.ERROR.TOKEN_EXPIRED);
					} else {
						if (params.type === "forgot") {
							const responseHtml = await (new TemplateUtil(config.SERVER.TEMPLATE_PATH + "deeplink.html"))
								.compileFile({
									url: params.android || "", // android scheme,
									iosLink: params.ios || "", // ios scheme
									fallback: params.fallback || config.CONSTANT.DEEPLINK.DEFAULT_FALLBACK_URL,
									title: config.SERVER.APP_NAME,
									android_package_name: config.CONSTANT.DEEPLINK.ANDROID_PACKAGE_NAME,
									ios_store_link: config.CONSTANT.DEEPLINK.IOS_STORE_LINK
								});

							return responseHtml;
						}
					}
				}
			}
		} catch (error) {
			throw error;
		}
	}


	async deepLinkShare(params) {
		try {

			const responseHtml = await (new TemplateUtil(config.SERVER.TEMPLATE_PATH + "deeplink.html"))
				.compileFile({
					url: params.android || "", // android scheme,
					iosLink: params.ios || "", // ios scheme
					fallback: params.fallback || config.CONSTANT.DEEPLINK.DEFAULT_FALLBACK_URL,
					title: config.SERVER.APP_NAME,
					android_package_name: config.CONSTANT.DEEPLINK.ANDROID_PACKAGE_NAME,
					ios_store_link: config.CONSTANT.DEEPLINK.IOS_STORE_LINK
				});
			return responseHtml;

		} catch (error) {
			errorReporter(error);
			return Promise.reject(error);
		}
	}

	async veryEmail(params) {
		try {

			// const jwtPayload = await tokenManager.decodeToken({ "accessToken": params.token });
			// const isExpire = appUtils.isTimeExpired(jwtPayload.payload.exp * 1000);
			// if (isExpire) {
			// 	// let step2;
			// 	// if (params.accountLevel === config.CONSTANT.ACCOUNT_LEVEL.ADMIN) {
			// 	// 	step2 = adminDao.emptyForgotToken({ "token": params.token });
			// 	// } else { // config.CONSTANT.ACCOUNT_LEVEL.NORMAL_USER
			// 	// 	step2 = userDao.emptyForgotToken({ "token": params.token });
			// 	// }
			// 	return Promise.reject(config.CONSTANT.MESSAGES.ERROR.TOKEN_EXPIRED);
			// }
			if (params.type === "verifyEmail") {

				const userData = await baseDao.findOne("users", { _id: params.userId }, {}, {});
				if (!userData) {
					return Promise.reject(config.CONSTANT.MESSAGES.ERROR.TOKEN_EXPIRED);
				}
				if (userData.isEmailVerified) {
					return Promise.reject(config.CONSTANT.MESSAGES.ERROR.TOKEN_EXPIRED);
				}

				if (userData) {
					const findSameEmail = await baseDao.findOne("users", { _id: { $ne: params.userId }, email: userData.email, isEmailVerified: true }, {}, {}, {});
					if (findSameEmail) {
						return Promise.reject(config.CONSTANT.MESSAGES.ERROR.EMAIL_ALREADY_VERIFIED);
					}
				}

				// const step1 = await baseDao.findOne("users", { _id: jwtPayload.payload.userId }, {}, {}, {});
				const step1 = await baseDao.updateOne("users", { _id: params.userId }, { isEmailVerified: true }, {});

				const responseHtml = await (new TemplateUtil(config.SERVER.TEMPLATE_PATH + "deeplink.html"))
					.compileFile({
						url: params.android || "", // android scheme,
						iosLink: params.ios || "", // ios scheme
						fallback: params.fallback || config.CONSTANT.DEEPLINK.DEFAULT_FALLBACK_URL,
						title: config.SERVER.APP_NAME,
						android_package_name: config.CONSTANT.DEEPLINK.ANDROID_PACKAGE_NAME,
						ios_store_link: config.CONSTANT.DEEPLINK.IOS_STORE_LINK
					});

				return responseHtml;
			}


		} catch (error) {
			return Promise.reject(error)
		}
	}
}

export const commonController = new CommonController();