"use strict";

import * as promise from "bluebird";

import { BaseDao } from "@modules/base/BaseDao";
import * as config from "@config/index";
import * as moment from 'moment';

export class HomeDao extends BaseDao {

    async getHomeData(params, userId) {
        try {
            let {pageNo, limit, endDate } = params
            let match: any = {};
            let aggPipe = [];
            let result:any = {}
            match["postedAt"] = moment(new Date()).format('YYYY-MM-DD')
            match["status"] = config.CONSTANT.STATUS.ACTIVE
            aggPipe.push({ "$sort": { "createdAt": -1 } });
            if(endDate) {
                match["createdAt"] = { $lt: new Date(endDate) };
            }
            aggPipe.push({ "$match": match });
            result = await this.aggregateWithPagination("home", aggPipe, limit, pageNo, true)
            if(result && result.list && result.list.length == 0) {
                delete match.postedAt
                aggPipe.pop()
                result = await this.aggregateWithPagination("home", aggPipe, limit, pageNo, true)
                // result = result
            }
            return result
        } catch (error) {
            throw error;
        }
    }

}

export const homeDao = new HomeDao();