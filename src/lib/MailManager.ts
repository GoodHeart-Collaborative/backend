"use strict";

import * as nodemailer from "nodemailer";
import * as sgTransport from "nodemailer-sendgrid-transport";
import * as ses from "nodemailer-ses-transport";

import * as appUtils from "@utils/appUtils";
import * as config from "@config/index";
import { TemplateUtil } from "@utils/TemplateUtil";

// using sendgrid
const options = {
	auth: {
		api_user: config.SERVER.MAIL.SENDGRID.API_USER,
		api_key: config.SERVER.MAIL.SENDGRID.API_KEY
	}
};
const client = nodemailer.createTransport(sgTransport(options));

// using smtp
/*var transporter = nodemailer.createTransport({
	host: config.SERVER.MAIL.SMTP.HOST,
	port: config.SERVER.MAIL.SMTP.PORT,
	secure: true, // use SSL
	service: "gmail",
	// requireTLS: true,
	auth: {
		user: config.SERVER.MAIL.SMTP.USER,
		pass: config.SERVER.MAIL.SMTP.PASSWORD
	}
});*/

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

// using Amazon SES
const sesTransporter = nodemailer.createTransport(ses({
	accessKeyId: "YOUR_AMAZON_KEY",
	secretAccessKey: "YOUR_AMAZON_SECRET_KEY"
}));

export class MailManager {
	private fromEmail: string = config.CONSTANT.EMAIL_TEMPLATE.FROM_MAIL;

	async sendMailViaSendgrid(params) {
		try {
			const mailOptions = {
				from: `${config.SERVER.APP_NAME} <${this.fromEmail}>`, // sender email
				to: params.email, // list of receivers
				subject: params.subject, // Subject line
				html: params.content,
				bcc: config.CONSTANT.EMAIL_TEMPLATE.BCC_MAIL
			};
			const mailResponse = await client.sendMail(mailOptions);
		} catch (error) {
			console.log(error);
		}
		return {};
	}

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
						resolve();
					} else {
						console.log("Message sent: " + info.response);
						resolve();
					}
				});
			});
		} catch (error) {
			console.log(error);
		}
		return {};
	}

	async sendMailViaAmazonSes(params) {
		try {
			sesTransporter.sendMail({
				from: `${config.SERVER.APP_NAME} <${this.fromEmail}>`,
				to: params.email,
				subject: params.subject,
				text: params.content,
				// cc: 'superganteng@yopmail.com, supertampan@yopmail.com',
				bcc: config.CONSTANT.EMAIL_TEMPLATE.BCC_MAIL,
				// attachments: [{
				// 	filename: 'My Cool Document',
				// 	path: 'https://path/to/cool-document.docx',
				// 	contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
				// }]
			});
		} catch (error) {
			console.log(error);
		}
		return {};
	}

	async sendMail(params) {
		if (config.SERVER.MAIL_TYPE === config.CONSTANT.MAIL_SENDING_TYPE.SENDGRID) {
			return await this.sendMailViaSendgrid(params);
		} else {
			return await this.sendMailViaSmtp(params);
		}
	}

	async forgotPasswordEmailToAdmin(params) {
		const mailContent = await (new TemplateUtil(config.SERVER.TEMPLATE_PATH + "forgot-password.html"))
			.compileFile({
				"url": `${config.SERVER.APP_URL}${config.SERVER.API_BASE_URL}/common/deepLink?fallback=${config.SERVER.ADMIN_URL}` +
					`/forgot-password/${params.accessToken}&token=${params.accessToken}&type=forgot&accountLevel=` +
					`${config.CONSTANT.ACCOUNT_LEVEL.ADMIN}&name=${params.name}`,
				"year": new Date().getFullYear(),
				"name": params.name,
				"validity": appUtils.timeConversion(10 * 60 * 1000) // 10 mins
			});
		await this.sendMail({ "email": params.email, "subject": config.CONSTANT.EMAIL_TEMPLATE.SUBJECT.FORGOT_PWD_EMAIL, "content": mailContent });
	}

	async forgotPasswordEmailToUser(params) {
		const mailContent = await (new TemplateUtil(config.SERVER.TEMPLATE_PATH + "forgot-password.html"))
			.compileFile({
				"url": `${config.SERVER.APP_URL}${config.SERVER.API_BASE_URL}/common/deepLink?android=${config.CONSTANT.DEEPLINK.ANDROID_SCHEME}` +
					`?token=${params.token}&ios=${config.CONSTANT.DEEPLINK.IOS_SCHEME}token@${params.token}&token=${params.token}` +
					`&type=forgot&accountLevel=${config.CONSTANT.ACCOUNT_LEVEL.USER}&name=${params.firstName + " " + params.middleName + " " + params.lastName}`,
				"name": params.firstName + " " + params.middleName + " " + params.lastName,
				"year": new Date().getFullYear(),
				"validity": appUtils.timeConversion(10 * 60 * 1000) // 10 mins
			});
		await this.sendMail({ "email": params.email, "subject": config.CONSTANT.EMAIL_TEMPLATE.SUBJECT.FORGOT_PWD_EMAIL, "content": mailContent });
	}

	async sendPassword(payload) {
		const mailContent = await (new TemplateUtil(config.SERVER.TEMPLATE_PATH + "register-user.html"))
			.compileFile({
				"name": payload.firstName + " " + payload.middleName + " " + payload.lastName,
				"email": payload.email,
				"password": payload.password,
				"url": `${config.SERVER.APP_URL}${config.SERVER.API_BASE_URL}/common/deepLink?fallback=${config.SERVER.ADMIN_URL}/login&android=${config.CONSTANT.DEEPLINK.ANDROID_SCHEME}?type=login&ios=${config.CONSTANT.DEEPLINK.IOS_SCHEME}login@&type=login`,
				"year": new Date().getFullYear()
			});

		await this.sendMail({
			"email": payload.email,
			"subject": config.CONSTANT.EMAIL_TEMPLATE.SUBJECT.WELCOME,
			"content": mailContent
		});
	}

	async sendFailedUserSheetToAdmin(payload) {
		const mailContent = await (new TemplateUtil(config.SERVER.TEMPLATE_PATH + "attachment.html"))
			.compileFile({
				"name": payload.name,
				"year": new Date().getFullYear()
			});

		const attachment = appUtils.mailAttachments(payload);

		await this.sendMail({
			"email": payload.email,
			"subject": config.CONSTANT.EMAIL_TEMPLATE.SUBJECT.IMPORT_SHEET_FAILURE,
			"content": mailContent,
			"attachments": attachment
		});
	}
}

export const mailManager = new MailManager();