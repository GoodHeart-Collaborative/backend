"use strict";

import * as _ from "lodash";
import fs = require("fs");
import * as promise from "bluebird";

import * as config from "@config/index";
import * as inspirationConstant from "@modules/admin/dailyInspiration/inspirationConstant";
import { inspirationDao } from "@modules/admin/dailyInspiration/inspirationDao";
import { userDao } from "@modules/user";


class MemberController {

	/**
	 * @function signup
	 * @description if IS_REDIS_ENABLE set to true,
	 * than redisClient.storeList() function saves value in redis.
	 */
    async saveMembers(params: MemberRequest.addMember) {
        try {

            if (!params['memberCreatedAt']) {
                params['memberCreatedAt'] = new Date();
            }
            const criteria = {
                _id: params.userId
            }
            const data = await userDao.updateOne('users', criteria, params, {})
            return data;
            // return inspirationConstant.MESSAGES.SUCCESS.SUCCESSFULLY_ADDED;

        } catch (error) {
            throw error;
        }
    }
    /**
     * 
     * @param function getMemberstById 
     * @description member detail
     */

    async getMemberstById(params: MemberRequest.memberDetail) {
        try {
            const criteria = {
                _id: params.Id,
            };

            const data = await inspirationDao.findOne('users', criteria, {}, {})
            if (!data) {
                return inspirationConstant.MESSAGES.SUCCESS.SUCCESS_WITH_NO_DATA;
            }
            return inspirationConstant.MESSAGES.SUCCESS.DEFAULT_WITH_DATA(data);

            // return data;
        } catch (error) {
            throw error;
        }
    }
    /**
     * 
     * @param function getMembers
     * @description getmembers list
     */
    async getMembers(params: MemberRequest.getMembers) {
        try {
            const { status, sortBy, sortOrder, limit, page, searchTerm, fromDate, toDate } = params;

            const aggPipe = [];
            let sort = {};

            const match: any = {};
            match.memberCreatedAt = { $exists: true };
            if (status) {
                match["$and"] = [{ status: status }, { status: { $ne: config.CONSTANT.STATUS.DELETED } }];
            } else {
                match.status = { "$ne": config.CONSTANT.STATUS.DELETED };
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
                    }
                }
            });

            if (searchTerm) {
                const reg = new RegExp(searchTerm, 'ig');
                match["$or"] = [
                    { firstName: reg },
                    { lastName: reg },
                    { email: reg },
                    { fullName: reg }
                ];
            }

            if (fromDate && toDate) { match['createdAt'] = { $gte: fromDate, $lte: toDate }; }
            if (fromDate && !toDate) { match['createdAt'] = { $gte: fromDate }; }
            if (!fromDate && toDate) { match['createdAt'] = { $lte: toDate }; }

            aggPipe.push({ "$match": match });

            if (sortBy && sortOrder) {
                if (sortBy === "name") {
                    sort = { "name": sortOrder };
                }
                if (sortBy === 'createdAt') {
                    sort = { "createdAt": sortOrder };
                }
                else {
                    sort = { "memberCreatedAt": sortOrder };
                }
            } else {
                sort = { "memberCreatedAt": -1 };
            }
            aggPipe.push({ "$sort": sort });

            const data = await inspirationDao.paginate('users', aggPipe, limit, page, {}, true);
            return data;
        } catch (error) {
            return Promise.reject(error);
        }
    }

}
export const memberController = new MemberController();