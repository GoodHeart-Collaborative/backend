"use strict";

import * as promise from "bluebird";

import { BaseDao } from "@modules/base/BaseDao";
import * as config from "@config/index";
import * as moment from 'moment';


export class AdviceDao extends BaseDao {

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

    async getAdviceHomeData(params, userId) {
        try {
            let query:any = {}
            query["postedAt"] = moment(new Date()).format('YYYY-MM-DD')
             let result =  await this.find("advice", query, {}, {}, {}, {pageNo: 1, limit:2}, {});
             if(result && result.length == 0) {
                 query = {}
                 result =  await this.findOneWithSort("advice", query, {}, {}, {}, {"createdAt": -1});
                 result = [result]
             }
             return result
        } catch (error) {
            throw error;
        }
    }

}

export const adviceDao = new AdviceDao();