"use strict";

const AWS = require("aws-sdk"),
	fs = require("fs");

import * as appUtils from "@utils/appUtils";
import * as config from "@config/environment";

export class ImageCropUtil {

	constructor() {
		AWS.config.update({
			accessKeyId: config.SERVER.AWS_CONSOLE.ACCESS_KEY,
			secretAccessKey: config.SERVER.AWS_CONSOLE.SECRET_KEY
		});
	}

	private imageFilter(fileName: string) {
		// accept image only
		if (!fileName.toLowerCase().match(/\.(jpg|jpeg|png|gif)$/)) {
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
				const s3 = new AWS.S3({ params: { Bucket: config.SERVER.AWS_CONSOLE.BUCKET_NAME } });
				s3.putObject({
					Key: fileName,
					Body: fileBuffer,
					ContentType: contentType, // type.mime,
					ACL: config.SERVER.S3.ACL
				}, (error, data) => {
					if (data) {
						console.log(data);
						resolve(data);
					} else {
						console.log("Upload failed: ", error);
						reject(error);
					}
				});
			});
		} catch (error) {
			throw error;
		}
	}

	/**
     * @function uploadImageToS3UsingLambda
     * @returns links for small,medium and large image
     */
	async uploadImageToS3UsingLambda(file) {
		return new Promise(async (resolve, reject) => {
			if (this.imageFilter(file.filename)) {
				const fileName = appUtils.getDynamicName(file);
				fs.readFile(file.path, async (error, fileBuffer) => {
					if (error) {
						reject(error);
					}

					this._uploadToS3("reduced/" + fileName, fileBuffer, file.headers["content-type"])
						.then((data: any) => {
							if (data) {
								resolve({
									large: `${config.SERVER.S3.AWS_BASEPATH}${config.SERVER.AWS_CONSOLE.LARGE_BUUCKET}${fileName}`,
									small: `${config.SERVER.S3.AWS_BASEPATH}${config.SERVER.AWS_CONSOLE.SMALL_BUCKET}${fileName}`,
									medium: `${config.SERVER.S3.AWS_BASEPATH}${config.SERVER.AWS_CONSOLE.MEDIUM_BUCKET}${fileName}`
								});
							}
						})
						.catch((error) => {
							reject(error);
						});
				});
			} else {
				reject(new Error("Invalid File Type"));
			}
		});
	}
}

export const imageCropUtil = new ImageCropUtil();