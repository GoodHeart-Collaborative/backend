"use strict";

console.log("");
console.log("//************************* RCC 1.0 **************************//");
console.log("");

console.log("env : ", process.env.NODE_ENV.trim());

// Internal Dependencies
import * as fs from "fs";
require("module-alias/register");
import * as Inert from "inert";
import { Server } from "hapi";

// import * as appUtils from "@utils/appUtils";
import * as config from "@config/index";
// create folder for upload if not exist
if (!fs.existsSync(config.SERVER.UPLOAD_DIR)) fs.mkdirSync(config.SERVER.UPLOAD_DIR);
// create folder for logs if not exist
if (!fs.existsSync("./logs")) fs.mkdirSync("./logs");

import { logger } from "@lib/index";
import { plugins } from "@plugins/index";
import { routes } from "@routes/index";
import * as BootStrap from "@utils/BootStrap";

const originArray: string[] = [
	"http://localhost:4200",
	"http://localhost:4201",
	"http://localhost",
	"http://10.10.6.249:4200",
	"http://localhost:4200",
	"http://10.10.7.255:4200",
	"http://10.10.8.213:4200"
];

const server = new Server({
	// host: "localhost",
	port: config.SERVER.PORT,
	routes: {
		cors: {
			origin: ["*"],
			// origin: originArray,
			headers: ["Accept", "api_key", "authorization", "Content-Type", "If-None-Match", "platform", "timezone"],
			additionalHeaders: ["Accept", "api_key", "authorization", "Content-Type", "If-None-Match", "platform"], // sometime required
			// maxAge: 60,
			// credentials: true,
			// exposedHeaders: ["Accept"],
		}
	}
});

const start = async () => {
	await server.register(require("vision"));
	server.views({
		engines: {
			html: require("handlebars")
		},
		path: "src/views",
		// isCached: config.SERVER.ENVIRONMENT === "production"
	});

	// serving static files
	await server.register(Inert);
	server.route({
		method: "GET",
		path: "/images/{path*}",
		options: {
			handler: {
				directory: {
					path: process.cwd() + "/src/views/images/",
					listing: false
				}
			}
		}
	});
};
start();

const init = async () => {
	await server.register(plugins);
	// await server.register({plugin: YourPlugin}, {routes:{prefix: '/api'}});

	const a = server.route(routes);
	console.log('aaaa', a);

	await server.start();
	const boot = new BootStrap.BootStrap();
	await boot.bootStrap(server);
	console.log('{}}}}}}}}}}}}}}}}}}}}}');

};
init().then(_ => {
	// console.log(server.info.uri);
	console.log(`Hapi server listening on ${config.SERVER.IP}:${config.SERVER.PORT}, in ${config.SERVER.TAG} mode`)
	logger.info(`Hapi server listening on ${config.SERVER.IP}:${config.SERVER.PORT}, in ${config.SERVER.TAG} mode`);
}).catch((error) => {
	console.warn("Error while loading plugins : ");
	console.error(error);
	process.exit(0);
});