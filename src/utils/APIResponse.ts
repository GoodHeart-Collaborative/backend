"use strict";

import * as config from "@config/constant";

export class APIResponse {

	/**
	 * @description you can un comment time as according to your need
	 * type is also deleted according to the need
	 */
	constructor(result: any) {
		let self: any = {};

		if (typeof result === "object" && result.hasOwnProperty("statusCode") && result.hasOwnProperty("message")) {
			result ? self = result : "";
		} else {
			self = config.CONSTANT.MESSAGES.SUCCESS.DEFAULT;
			result ? self.data = result : "";
		}
		// self.time = new Date().getTime();
		// delete self.type;
		return self;
	}
}