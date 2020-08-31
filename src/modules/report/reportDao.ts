"use strict";

import * as promise from "bluebird";

import { BaseDao } from "../base/BaseDao";
import * as config from "../../config/index";
import * as appUtils from '../../utils/appUtils'
import { CONSTANT } from "@config/index";

export class ReportDao extends BaseDao {

	/**
	 * @function isContentExists
	 */
    async addLike(params) {
        try {
            params["created"] = new Date().getTime()
            return await this.save("report", params);
        } catch (error) {
            throw error;
        }
    }
}

export const reportDao = new ReportDao();