"use strict";

import * as csvtojson from "csvtojson";
import * as fs from "fs";

import * as appUtils from "@utils/appUtils";
import * as config from "@config/environment";

export const readAndParseCSV = function (file) {
	return new Promise(function (resolve, reject) {
		if (appUtils.excelFilter(file.hapi.filename)) {
			const fileName = appUtils.getDynamicName(file);
			const filePath = `${config.SERVER.UPLOAD_DIR}${fileName}`;
			const r = file.pipe(fs.createWriteStream(filePath));
			r.on("close", function () {
				csvtojson()
					.fromFile(filePath)
					.then((jsonObject) => {
						appUtils.deleteFiles(filePath);
						resolve(jsonObject);
					});
			});
		} else {
			reject(new Error("Invalid file type!"));
		}
	});
};