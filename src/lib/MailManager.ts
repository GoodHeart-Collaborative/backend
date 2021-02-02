"use strict";

import * as nodemailer from "nodemailer";

import * as appUtils from "@utils/appUtils";
import * as config from "@config/index";
import { TemplateUtil } from "@utils/TemplateUtil";

// using smtp
const transporter = nodemailer.createTransport({
	host: config.SERVER.MAIL.SMTP.HOST,
	port: config.SERVER.MAIL.SMTP.PORT,
	secure: false, // use SSL
	requireTLS: true,
	auth: {
		user: config.SERVER.MAIL.SMTP.USER,
		pass: config.SERVER.MAIL.SMTP.PASSWORD
	}
});

export class MailManager {
	private fromEmail: string = config.CONSTANT.EMAIL_TEMPLATE.FROM_MAIL;

	async sendMailViaSmtp(params) {
		try {
			const mailOptions = {
				from: `${config.SERVER.APP_NAME} <${this.fromEmail}>`,
				to: params.email,
				subject: params.subject,
				html: params.content,
				bcc: config.CONSTANT.EMAIL_TEMPLATE.BCC_MAIL
			};
			return new Promise(function (resolve, reject) {
				transporter.sendMail(mailOptions, function (error, info) {
					if (error) {
						console.log(error);
						resolve(error);
					} else {
						console.log("Message sent: " + info.response);
						resolve(info);
					}
				});
			});
		} catch (error) {
			console.log(error);
		}
		return {};
	}

	async sendMail(params) {
		return await this.sendMailViaSmtp(params);
	}

	// async forgotPasswordEmailToAdmin(params) {
	// 		`/forgot-password/${params.accessToken}&token=${params.accessToken}&type=forgot&accountLevel=` +
	// 		`${config.CONSTANT.ACCOUNT_LEVEL.ADMIN}&name=${params.name}`);

	// 	const mailContent = await (new TemplateUtil(config.SERVER.TEMPLATE_PATH + "forgot-password.html"))
	// 		.compileFile({
	// 			"url": `${config.SERVER.APP_URL}${config.SERVER.API_BASE_URL}/common/deepLink?fallback=${config.SERVER.ADMIN_URL}` +
	// 				`/forgot-password/${params.accessToken}&token=${params.accessToken}&type=forgot&accountLevel=` +
	// 				`${config.CONSTANT.ACCOUNT_LEVEL.ADMIN}&name=${params.name}`,
	// 			"year": new Date().getFullYear(),
	// 			"name": params.name,
	// 			"validity": appUtils.timeConversion(10 * 60 * 1000) // 10 mins
	// 		});
	// 	await this.sendMail({ "email": params.email, "subject": config.CONSTANT.EMAIL_TEMPLATE.SUBJECT.FORGOT_PWD_EMAIL, "content": mailContent });
	// }

	async forgotPasswordEmailToAdmin(params) {
		const mailContent = await (new TemplateUtil(config.SERVER.TEMPLATE_PATH + "forgot-password.html"))
			.compileFile({
				"url": `${config.SERVER.API_URL}/v1/admin/verifyLink/${params.accessToken}`,
				"year": new Date().getFullYear(),
				"name": params.name,
				"validity": appUtils.timeConversion(10 * 60 * 1000) // 10 mins
			});
		await this.sendMail({ "email": params.email, "subject": config.CONSTANT.EMAIL_TEMPLATE.SUBJECT.FORGOT_PWD_EMAIL, "content": mailContent });
	}

	async forgotPasswordEmailToUser(params) {
		const getLastName = (params && params.lastName) ? params.lastName : ''
		const mailContent = await (new TemplateUtil(config.SERVER.TEMPLATE_PATH + "forgot-password.html"))
			.compileFile({
				"url": `${config.SERVER.APP_URL}${config.SERVER.API_BASE_URL}/v1/common/deepLink?ios=${config.CONSTANT.DEEPLINK.IOS_SCHEME}?token=${params.token}` +
					`&android=${config.CONSTANT.DEEPLINK.ANDROID_SCHEME}?token=${params.token}` +
					`&type=forgot&token=${params.token}&accountLevel=${config.CONSTANT.ACCOUNT_LEVEL.USER}&name=${params.firstName + " " + params.lastName}`,
				"name": params.firstName + " " + getLastName,
				"year": new Date().getFullYear(),
				"validity": appUtils.timeConversion(10 * 60 * 1000), // 10 mins
				"logoUrl": config.SERVER.UPLOAD_IMAGE_DIR + "womenLogo.png",
			});
		await this.sendMail({ "email": params.email, "subject": config.CONSTANT.EMAIL_TEMPLATE.SUBJECT.FORGOT_PWD_EMAIL, "content": mailContent });
	}

	async sendRegisterMailToUser(params) {
		const lastName = (params && params.lastName) ? params.lastName : ''

		const mailContent = await (new TemplateUtil(config.SERVER.TEMPLATE_PATH + "verifyEmail.html"))
			.compileFile({
				"url": `${config.SERVER.APP_URL}${config.SERVER.API_BASE_URL}/v1/verifyEmail/deepLink?ios=${config.CONSTANT.DEEPLINK.IOS_SCHEME}?userId=${params.userId}` +
					`&android=${config.CONSTANT.DEEPLINK.ANDROID_SCHEME}?` +
					`&type=verifyEmail&accountLevel=${config.CONSTANT.ACCOUNT_LEVEL.USER}&name=${params.firstName + " " + params.lastName}` +
					`&userId=${params.userId}`,
				"name": params.firstName + " " + lastName,
				"year": new Date().getFullYear(),
				"userId": params.userId
				// "validity": appUtils.timeConversion(10 * 60 * 1000) // 10 mins
			});
		await this.sendMail({ "email": params.email, "subject": config.CONSTANT.EMAIL_TEMPLATE.SUBJECT.VERIFY_EMAIL, "content": mailContent });
	}
}

export const mailManager = new MailManager();