import * as _ from "lodash";

const bunyan = require("bunyan");
import * as config from "@config/environment";

let logger: any,
	streams;

const initialize = _.once(function () {
	const bunyanDebugStream = require("bunyan-debug-stream");
	if (config.SERVER.ENVIRONMENT && config.SERVER.ENVIRONMENT === "production") {
		streams = [{
			level: "error",
			type: "raw",
			stream: bunyanDebugStream({
				basepath: __dirname + "/.." // this should be the root folder of your project.
			})
		}, {
			level: "warn",
			type: "raw",
			stream: bunyanDebugStream({
				basepath: __dirname + "/.." // this should be the root folder of your project.
			})
		}];
	} else {
		const RotatingFileStream = require("bunyan-rotating-file-stream");
		streams = [
			{
				name: "info",
				level: "info",
				stream: new RotatingFileStream({
					path: "logs/info.%d-%b-%y.log",
					period: "1d", // daily rotation
					totalFiles: 10, // keep 10 back copies
					rotateExisting: true, // Give ourselves a clean file when we start up, based on period
					threshold: "10m", // Rotate log files larger than 10 megabytes
					totalSize: "20m", // Don't keep more than 20mb of archived log files
					gzip: true // Compress the archive log files to save space
				})
			},
			{
				name: "error",
				level: "error",
				stream: new RotatingFileStream({
					path: "logs/error.%d-%b-%y.log",
					period: "1d", // daily rotation
					totalFiles: 10, // keep 10 back copies
					rotateExisting: true, // Give ourselves a clean file when we start up, based on period
					threshold: "10m", // Rotate log files larger than 10 megabytes
					totalSize: "20m", // Don't keep more than 20mb of archived log files
					gzip: true // Compress the archive log files to save space
				})
			},
			{
				name: "error",
				level: "error", // loging level
				stream: bunyanDebugStream({
					basepath: __dirname + "/.." // this should be the root folder of your project.
				})
			},
			// 	{
			// 	level: "error", // loging level
			// 	path: "logs/app.log",
			// 	period: "1d",   // daily rotation
			// 	count: 3,        // keep 3 back copies
			// 	stream: bunyanDebugStream({
			// 		basepath: __dirname + "/.." // this should be the root folder of your project.
			// 	})
			// },
			// {
			// 	level: "info", // loging level
			// 	type: "rotating-file",
			// 	path: "logs/app.log",
			// 	period: "1d",   // daily rotation
			// 	count: 3,        // keep 3 back copies
			// },
			// {
			// 	level: "warn",
			// 	path: "app.log"
			// },
			// {
			// 	level: "debug",
			// 	path: "app.log"
			// }
		];
	}

	logger = bunyan.createLogger({
		name: "GOOD HEARTLog",
		streams: streams,
		serializers: {
			req: bunyan.stdSerializers.req,
			res: bunyan.stdSerializers.res,
			err: bunyan.stdSerializers.err
		},
		src: true
	});
});
initialize();

// ========================== Export Module Start ==========================
export {
	logger
};
// ========================== Export Module End ============================