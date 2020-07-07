"use strict";

import * as _ from "lodash";

import { BaseDao } from "@modules/base/BaseDao";
import * as config from "@config/constant";

export class CategoryDao extends BaseDao {

	/**
	 * @function isEmailExists
	 */
    async isEmailExists(params, tokenData?: TokenData | any) {
        try {

            // return await this.findOne("admins", query, projection, options, {});
        } catch (error) {
            throw error;
        }
    }


}

export const categoryDao = new CategoryDao();