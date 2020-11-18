"use strict";

const AWS = require("aws-sdk"),
	fs = require("fs");

import * as appUtils from "@utils/appUtils";
import * as config from "@config/environment";

export class ImageUtil {

	constructor() {
		AWS.config.update({
			accessKeyId: config.SERVER.AWS_IAM_USER.ACCESS_KEY_ID,
			secretAccessKey: config.SERVER.AWS_IAM_USER.SECRET_ACCESS_KEY
		});
	}

	private imageFilter(fileName: string) {
		// accept image only
		if (!fileName.toLowerCase().match(/\.(jpg|jpeg|png|gif)$/)) {
			return false;
		}
		return true;
	}

	private videoFilter(fileName: string) {
		// accept video only
		if (!fileName.toLowerCase().match(/\.(mp4|flv|mov|avi|wmv)$/)) {
			return false;
		}
		return true;
	}

	private audioFilter(fileName: string) {
		// accept video only
		if (!fileName.toLowerCase().match(/\.(mp3|aac|aiff|m4a|ogg)$/)) {
			return false;
		}
		return true;
	}

	/**
	 * @function uploadImage This Function is used to uploading image to S3 Server
	*/
	private _uploadToS3(fileName, fileBuffer, contentType) {
		try {
			return new Promise((resolve, reject) => {
				const s3 = new AWS.S3({ params: { Bucket: config.SERVER.S3.BUCKET_NAME } });
				s3.upload({
					Key: String(fileName),
					Body: fileBuffer,
					ContentType: contentType,
					Bucket: config.SERVER.S3.BUCKET_NAME,
					ACL: config.SERVER.S3.ACL
				}, (error, data) => {
					if (error) {
						console.log("Upload failed: ", error);
						reject(error);
					} else
						resolve(data);
				});
			});
		} catch (error) {
			throw error;
		}
	}

	deleteFromS3(filename) {
		filename = filename.split("/").slice(-1)[0];
		const s3 = new AWS.S3({ params: { Bucket: config.SERVER.S3.BUCKET_NAME } });
		return new Promise(function (resolve, reject) {
			const params = {
				Bucket: config.SERVER.S3.BUCKET_NAME,
				Key: filename
			};

			s3.deleteObject(params, function (error, data) {
				console.log(error, data);
				if (error) {
					reject(error);
				} else {
					resolve(data);
				}
			});
		});
	}
}

export const imageUtil = new ImageUtil();