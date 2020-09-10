"use strict";

import * as _ from "lodash";
import fs = require("fs");
import { reportDao } from "@modules/report/reportDao";
import * as apputils from '@utils/appUtils';
import * as config from "@config/constant";
class ReportController {

    async getReports(params) {
        try {
            const { type, page, limit, postId, searchTerm, fromDate, toDate } = params;
            const paginateOptions = {
                page: page || 1,
                limit: limit || 10
            };
            let aggPipe = [];
            let match: any = {};
            let searchObj: any = {};
            match['type'] = type;
            if (postId) {
                match['postId'] = apputils.toObjectId(postId);
            }

            if (fromDate && toDate) { match['created'] = { $gte: fromDate, $lte: toDate }; }
            if (fromDate && !toDate) { match['created'] = { $gte: fromDate }; }
            if (!fromDate && toDate) { match['created'] = { $lte: toDate }; }


            aggPipe.push({
                $match: match
            });

            aggPipe.push({
                $lookup: {
                    from: 'users',
                    let: { uId: '$userId' },
                    as: 'userData',
                    pipeline: [{
                        $match: {
                            $expr: {
                                $eq: ['$_id', '$$uId']
                            }
                        }
                    },
                    {
                        $project: {
                            firstName: 1,
                            lastName: 1,
                            email: 1,
                            profilePicUrl: 1,
                            status: 1,
                            fullName: {
                                $cond: {
                                    if: {
                                        $eq: ['$lastName', null]
                                    },
                                    then: '$firstName',
                                    else: { $concat: ['$firstName', ' ', '$lastName'] }
                                }
                            }
                        }
                    }
                    ]
                }
            }
            );
            aggPipe.push({
                $unwind: '$userData',
            });

            if (searchTerm) {
                const reg = new RegExp(searchTerm, 'ig');
                aggPipe.push({
                    $match: {
                        ["$or"]: [
                            { 'userData.firstName': reg },
                            { 'userData.lastName': reg },
                            { 'userData.email': reg },
                            { 'userData.fullName': reg }
                        ]
                    }
                });
            }


            let data;
            if (params.type) {
                data = await reportDao.paginate('report', aggPipe, paginateOptions.limit, paginateOptions.page, true);
            }
            // if (params.type = config.CONSTANT.HOME_TYPE) {
            //     data = await reportDao.paginate('report', aggPipe, paginateOptions.limit, paginateOptions.page, true);
            // }
            // if (params.type = config.CONSTANT.HOME_TYPE.FORUM_TOPIC) {
            //     data = await reportDao.paginate('report', aggPipe, paginateOptions.limit, paginateOptions.page, true);
            // }

            return data;
        } catch (error) {
            throw error;
        }
    }

}
export const adminReportController = new ReportController();