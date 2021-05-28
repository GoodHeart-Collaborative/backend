"use strict";

import * as nodemailer from "nodemailer";

import * as appUtils from "@utils/appUtils";
import * as config from "@config/index";
import { TemplateUtil } from "@utils/TemplateUtil";
import * as ses from "nodemailer-ses-transport";

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

// const options = {
// 	auth: {
// 		api_user: config.SERVER.MAIL.SENDGRID.API_USER,
// 		api_key: config.SERVER.MAIL.SENDGRID.API_KEY
// 	}
// };
// const client = nodemailer.createTransport(sgTransport(options));

// using Amazon SES
let sesTransporter = nodemailer.createTransport(ses({
	accessKeyId: "AKIA6DQMUBGGZLL3VB6F", // config.SERVER.AWS_IAM_USER.ACCESS_KEY_ID,
	secretAccessKey: "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", //config.SERVER.AWS_IAM_USER.SECRET_ACCESS_KEY,
	region: "us-east-1 ues kr lena"
	// Port: 587,
	// TLS: Yes

}));


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

	// async sendMailViaSmtp(params) {
	// 	try {
	// 		// let mailOptions = {
	// 		// 	from: `${config.SERVER.APP_NAME} <${this.fromEmail}>`,
	// 		// 	to: params.email,
	// 		// 	subject: params.subject,
	// 		// 	html: params.content
	// 		// };
	// 		// if (params.bcc) mailOptions["bcc"] = params["bcc"];
	// 		// if (params.attachments) {
	// 		// 	mailOptions["attachments"] = [{
	// 		// 		filename: "My Cool Document",
	// 		// 		content: params.base64,
	// 		// 		encoding: "base64"
	// 		// 	}];
	// 		// }

	// 		// return new Promise((resolve, reject) => {
	// 		// 	sesTransporter.sendMail(mailOptions, function (error, info) {
	// 		// 		if (error) {
	// 		// 			console.log(error);
	// 		// 			resolve(false);
	// 		// 		} else {
	// 		// 			console.log("Message sent: " + info.response);
	// 		// 			resolve(true);
	// 		// 		}
	// 		// 	});
	// 		// })
	// 		console.log('vvv', this.fromEmail);

	// 		let mailOptions: Object = {
	// 			from: `good heart <${this.fromEmail}>`,
	// 			to: params.email,
	// 			subject: params.subject,
	// 			html: params.content,
	// 		}
	// 		if (params.bcc) mailOptions["bcc"] = params.bcc;
	// 		if (params.attachments) mailOptions['attachments'] = params.attachments;
	// 		// sesTransporter.sendMail(mailOptions);
	// 		return new Promise(function (resolve, reject) {
	// 			sesTransporter.sendMail(mailOptions, function (error, info) {
	// 				if (error) {
	// 					console.log(error);
	// 					resolve(error);
	// 				} else {
	// 					console.log("Message sent: " + info.response);
	// 					resolve(info);
	// 				}
	// 			});
	// 		});
	// 	} catch (error) {
	// 		console.error(error);
	// 	}
	// }

	// async sendMail(params) {
	// 	return await this.sendMailViaSmtp(params);
	// }
	async sendMail(params) {
		// if (config.SERVER.MAIL_TYPE === config.CONSTANT.MAIL_SENDING_TYPE.SENDGRID) {
		// return await this.sendMailViaSendgrid(params);
		// } else {
		// if (config.SERVER.ENVIRONMENT === "production" || config.SERVER.ENVIRONMENT === "preproduction")
		// return await this.sendMailViaAmazonSes(params);
		// else
		return await this.sendMailViaSmtp(params);
		// }
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