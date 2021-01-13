"use strict";

import * as promise from "bluebird";

import { BaseDao } from "@modules/base/BaseDao";
import * as config from "@config/index";
import * as moment from 'moment';


export class ExpertPostDao extends BaseDao {

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

    async checkExpertPost(params) {
        try {
            return await this.findOne('expert_post', params, {}, {});
        } catch (error) {
            return Promise.reject(error)
        }
    }

    async updateLikeAndCommentCount(query, update) {
        try {
            return await this.updateOne('expert_post', query, update, {});
        } catch (error) {
            throw error;
        }
    }
}

export const expertPostDao = new ExpertPostDao();