"use strict";

import * as promise from "bluebird";

import { BaseDao } from "@modules/base/BaseDao";
import * as config from "@config/index";

export class UnicornDao extends BaseDao {

	/**
	 * @function isContentExists
	 */
    async isContentExists(params) {
        try {
            const query: any = {};
            query.type = params.type;
            query.status = { "$ne": config.CONSTANT.STATUS.DELETED };

            const options = { lean: true };

            return await this.findOne("contents", query, {}, options, {});
        } catch (error) {
            throw error;
        }
    }

}

export const unicornDao = new UnicornDao();