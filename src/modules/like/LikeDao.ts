"use strict";

import * as promise from "bluebird";

import { BaseDao } from "../base/BaseDao";
import * as config from "../../config/index";

export class LikeDao extends BaseDao {

	/**
	 * @function isContentExists
	 */
    async addLike(params) {
        try {
            return await this.save("likes", params);
        } catch (error) {
            throw error;
        }
    }
    async checkLike(params) {
		try {
			return await this.findOne("likes", params, {}, {}, {});
		} catch (error) {
			throw error;
		}
	}

}

export const likeDao = new LikeDao();