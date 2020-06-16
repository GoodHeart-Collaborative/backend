"use strict";

import * as fs from "fs";
import * as XLSX from "xlsx";

import * as appUtils from "@utils/appUtils";
import * as config from "@config/environment";

export const readAndParseXLSX = function (file) {
	return new Promise(function (resolve, reject) {
		if (appUtils.excelFilter(file.hapi.filename)) {
			const fileName = appUtils.getDynamicName(file);
			const filePath = `${config.SERVER.UPLOAD_DIR}${fileName}`;
			const r = file.pipe(fs.createWriteStream(filePath));
			r.on("close", function () {
				const workbook = XLSX.readFile(filePath);
				const sheet_name_list = workbook.SheetNames;
				const xlData = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]], {});
				appUtils.deleteFiles(filePath);
				resolve(xlData);
			});
		} else {
			reject(new Error("Invalid file type!"));
		}
	});
};