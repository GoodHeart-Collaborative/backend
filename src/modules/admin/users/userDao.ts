"use strict";

import * as _ from "lodash";

import { BaseDao } from "@modules/base/BaseDao";
import * as config from "@config/constant";
import { ElasticSearch } from "@lib/ElasticSearch";
import * as appUtils from '@utils/appUtils'
import { userDao } from '@modules/user/UserDao';

const elasticSearch = new ElasticSearch();

export class AdminUserDao extends BaseDao {


    async getUsers(params) {
        try {
            const { sortBy, sortOrder, limit, page, searchTerm, status, fromDate, toDate, adminStatus } = params;
            const aggPipe = [];


            const match: any = {};
            // match['dob'] = { $exists: true };
            // match['experience'] = { $exists: true };
            // match['profession'] = { $exists: true };
            if (status) {
                match["$and"] = [{ status: status }, { status: { $ne: config.CONSTANT.STATUS.DELETED } }];
            } else {
                match.status = { "$ne": config.CONSTANT.STATUS.DELETED };
            }
            if (searchTerm) {
                match['$or'] = [
                    { email: new RegExp('.*' + searchTerm + '.*', 'i') },
                    { firstName: new RegExp('.*' + searchTerm + '.*', 'i') },
                    { lastName: new RegExp('.*' + searchTerm + '.*', 'i') },
                ]
            }

            if (params.adminStatus) {
                match.adminStatus = adminStatus;
            }

            if (fromDate && toDate) { match['createdAt'] = { $gte: fromDate, $lte: toDate }; }
            if (fromDate && !toDate) { match['createdAt'] = { $gte: fromDate }; }
            if (!fromDate && toDate) { match['createdAt'] = { $lte: toDate }; }
            aggPipe.push({ "$match": match });
            let sort = {};
            if (sortBy && sortOrder) {
                if (sortBy === "name") {
                    sort = { "firstName": sortOrder };
                } else {
                    sort = { "createdAt": sortOrder };
                }
            } else {
                sort = { "createdAt": -1 };
            }
            aggPipe.push({ "$sort": sort });

            const data = await userDao.paginate('users', aggPipe, limit, page, {}, true);
            return data;

        } catch (error) {
            return Promise.reject(error);
        }
    }
}

export const AdminuserDao = new AdminUserDao();
