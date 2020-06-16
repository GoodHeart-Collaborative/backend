"use strict";

// Register request plugin
export const plugin = {
	name: "request-plugin",
	register: async function (server, options) {
		// it works as amiddleware with every request
		server.ext("onRequest", (request, h) => {
			// do something
			return h.continue;
		});

		// it works as amiddleware with every post request
		server.ext("onPostAuth", (request, h) => {
			console.log("--------------------------------REQUEST STARTS----------------------------------------");
			console.log(request.info.remoteAddress + ": " + request.method.toUpperCase() + " " + request.path);
			console.log("Request Type=======>", request.method.toUpperCase());
			console.log("Request Path=======>", request.path);
			console.log("Request Body=======>", request.payload);
			console.log("Request Params=====>", request.params);
			console.log("Request Query======>", request.query);
			console.log("Authorization======>", request.headers.authorization);
			console.log("api_key============>", request.headers.api_key);
			console.log("platform===========>", request.headers.platform);
			console.log("--------------------------------REQUEST ENDS------------------------------------------");
			return h.continue;
		});

		// routing using plugin
		/*server.route({
			method: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
			path: '/{path*}',
			handler: function(request, h){
				return {'message':"Hello from rajat"};
			}
		});*/
	}
};