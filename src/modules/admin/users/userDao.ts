"use strict";

import * as _ from "lodash";

import { BaseDao } from "@modules/base/BaseDao";
import * as config from "@config/constant";
import { userDao } from '@modules/user/UserDao';

export class AdminUserDao extends BaseDao {


    async getUsers(params) {
        try {
            const { sortBy, sortOrder, limit, page, searchTerm, status, fromDate, toDate, adminStatus, subscriptionType } = params;
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
            if (subscriptionType) {
                match.subscriptionType = parseInt(subscriptionType)
            }


            aggPipe.push({
                "$project": {
                    isAppleLogin: 1,
                    isAppleVerified: 1,
                    isMobileVerified: 1,
                    isEmailVerified: 1,
                    isFacebookLogin: 1,
                    isGoogleLogin: 1,
                    firstName: 1,
                    lastName: 1,
                    email: 1,
                    countryCode: 1,
                    mobileNo: 1,
                    fullMobileNo: 1,
                    gender: 1,
                    dob: 1,
                    reportCount: 1,
                    profilePicUrl: 1,
                    address: 1,
                    status: 1,
                    preference: 1,
                    industryType: 1,
                    experience: 1,
                    about: 1,
                    createdAt: 1,
                    countMember: 1,
                    memberCreatedAt: 1,
                    isMemberOfDay: 1,
                    likeCount: 1,
                    commentCount: 1,
                    adminStatus: 1,
                    fullName: {
                        $cond: {
                            if: {
                                $eq: ['$lastName', null]
                            },
                            then: '$firstName',
                            else: { $concat: ['$firstName', ' ', '$lastName'] }
                        }
                    },
                    subscriptionType: 1,
                    subscriptionEndDate: 1,
                }
            });

            if (searchTerm) {
                const reg = new RegExp(searchTerm, 'ig');
                match['$or'] = [
                    { email: reg },
                    { firstName: reg },
                    { lastName: reg },
                    { fullName: reg }
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

            const totalVerified = userDao.count('users', { adminStatus: config.CONSTANT.USER_ADMIN_STATUS.VERIFIED, status: { "$ne": config.CONSTANT.STATUS.DELETED } });
            const totalPending = userDao.count('users', { adminStatus: config.CONSTANT.USER_ADMIN_STATUS.PENDING, status: { "$ne": config.CONSTANT.STATUS.DELETED } });
            const totalRejected = userDao.count('users', { adminStatus: config.CONSTANT.USER_ADMIN_STATUS.REJECTED, status: { "$ne": config.CONSTANT.STATUS.DELETED } });

            const [verifiedCount, pendingCount, rejectedCount] = await Promise.all([totalVerified, totalPending, totalRejected])

            const data: any = await userDao.paginate('users', aggPipe, limit, page, { salt: 0, hash: 0 }, true);
            // return verifiedCount,
            // pendingCount,
            // rejectedCount,
            return { verifiedCount, pendingCount, rejectedCount, data }
            // return data;
        } catch (error) {
            return Promise.reject(error);
        }
    }
}

export const AdminuserDao = new AdminUserDao();
