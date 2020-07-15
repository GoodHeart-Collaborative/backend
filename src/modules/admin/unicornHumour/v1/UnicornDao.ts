"use strict";

import * as promise from "bluebird";

import { BaseDao } from "@modules/base/BaseDao";
import * as config from "@config/index";
import * as moment from 'moment';

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

    async getUnicornHomeData(params, userId) {
        try {
            let {pageNo, limit, endDate } = params
            pageNo = 1
            let match: any = {};
            let aggPipe = [];
            let result:any = {}
            match["postedAt"] = moment(new Date()).format('YYYY-MM-DD')
            match["status"] = config.CONSTANT.STATUS.ACTIVE
            aggPipe.push({ "$sort": { "createdAt": -1 } });
            if(endDate) {
                match["createdAt"] = { $lte: new Date(endDate) };
            }
            aggPipe.push({ "$match": match });
            result = await this.aggregateWithPagination("unicorn", aggPipe, limit, pageNo, true);
            if(result && result.data && result.data.length == 0) {
                delete match.postedAt
                aggPipe.pop()
                result = await this.aggregateWithPagination("unicorn", aggPipe, limit, pageNo, true);
            }
            return result
        } catch (error) {
            throw error;
        }
    }
}

export const unicornDao = new UnicornDao();