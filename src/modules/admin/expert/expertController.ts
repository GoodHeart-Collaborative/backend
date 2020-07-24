"use strict";


import * as _ from "lodash";

import * as config from "@config/index";
import * as expertConstant from "@modules/admin/expert/expertConstant";
import { expertDao } from "@modules/admin/expert/expertDao";
import * as appUtils from "@utils/appUtils";


class ExpertController {

    getTypeAndDisplayName(findObj, num: number) {
        const obj = findObj;
        const data = Object.values(obj);
        console.log('datadatadatadatadatadatadatadata', data);

        const result = data.filter((x: any) => {
            return x.VALUE === num;
        });
        console.log('resultresultresult', result);

        return result[0];
    }
	/**
	 * @function addExpert
	 * @description if IS_REDIS_ENABLE set to true,
	 * than redisClient.storeList() function saves value in redis.
	 */
    async addExpert(params) {
        try {
            // params["postedAt"] = moment(para).format('YYYY-MM-DD')
            const result = this.getTypeAndDisplayName(config.CONSTANT.EXPERT_CONTENT_TYPE, params['contentId'])
            console.log('data1data1data1data1data1', result);
            params['contentType'] = result['TYPE']
            params['contentDisplayName'] = result['DISPLAY_NAME'];

            console.log('paramsparamsparamsparams', params);

            const data = await expertDao.insert("expert", params, {});
            console.log('datadatadatadatadata', data);

            return expertConstant.MESSAGES.SUCCESS.SUCCESSFULLY_ADDED;

        } catch (error) {
            throw error;
        }
    }


    async getExpert(params) {
        try {

            const { expertId, categoryId, limit, page } = params;
            let aggPipe = [];
            const match: any = {};

            match.status = { "$ne": config.CONSTANT.STATUS.DELETED };
            aggPipe.push({ $match: match })

            aggPipe.push({
                $lookup: {
                    from: 'categories',
                    let: { 'cId': '$catgeoryId' },
                    pipeline: [{
                        $match: {
                            $expr: {
                                "$in": ['$_id', '$$cId'],
                            }
                        }
                    }],
                    "as": "categoryData"
                }
            })

            aggPipe.push({
                $lookup: {
                    from: 'expert_posts',
                    let: { 'eId': '$_id' },
                    pipeline: [{
                        $match: {
                            $expr: {
                                "$eq": ['$expertId', '$$eId'],
                            }
                        }
                    }],
                    "as": "postData"
                },
            },
            )
            aggPipe.push({
                $addFields: {
                    totalPost: {
                        $size: '$postData'
                    }
                }
            })
            aggPipe.push({ $project: { postData: 0 } })

            const data = await expertDao.aggreagtionWithPaginateTotal('expert', aggPipe, limit, page, true)
            console.log('datadatadata', data);
            return data;

        } catch (error) {
            return Promise.reject(error);
        }
    }

    async updateExpert(params) {
        try {
            const criteria = {
                _id: params.expertId,
            };

            const data = await expertDao.updateOne('expert', criteria, params, {})
            if (!data) {
                return expertConstant.MESSAGES.SUCCESS.SUCCESS_WITH_NO_DATA;
            }
            return expertConstant.MESSAGES.SUCCESS.DEFAULT_WITH_DATA(data);

            // return data;
        } catch (error) {
            throw error;
        }
    }

    async getPosts(params: InspirationRequest.IGetInspirations) {
        try {
            const { status, sortBy, sortOrder, limit, page, searchTerm, fromDate, toDate, } = params;
            const aggPipe = [];

            const match: any = {};

            if (status) {
                match["$and"] = [{ status: status }, { status: { $ne: config.CONSTANT.STATUS.DELETED } }];
            } else {
                match.status = { "$ne": config.CONSTANT.STATUS.DELETED };
            }
            if (searchTerm) {
                match["$or"] = [
                    { "title": { "$regex": searchTerm, "$options": "-i" } },
                ];
            }

            if (fromDate && toDate) { match['createdAt'] = { $gte: fromDate, $lte: toDate }; }
            if (fromDate && !toDate) { match['createdAt'] = { $gte: fromDate }; }
            if (!fromDate && toDate) { match['createdAt'] = { $lte: toDate }; }

            aggPipe.push({ "$match": match });

            let sort = {};
            if (sortBy && sortOrder) {
                if (sortBy === "title") {
                    sort = { "title": sortOrder };
                } else {
                    sort = { "createdAt": sortOrder };
                }
            } else {
                sort = { "createdAt": -1 };
            }
            aggPipe.push({ "$sort": sort });

            const data = await expertDao.paginate('gratitude_journals', aggPipe, limit, page, {}, true);
            return data;
        } catch (error) {
            return Promise.reject(error);
        }
    }

    async updateStatus(params: InspirationRequest.IUpdateStatus) {
        try {
            const criteria = {
                _id: params.Id
            };

            const datatoUpdate = {
                status: params.status
            };
            const data = await expertDao.updateOne('gratitude_journals', criteria, datatoUpdate, {})
            return config.CONSTANT.MESSAGES.SUCCESS.SUCCESSFULLY_UPDATED;

        } catch (error) {
            return Promise.reject(error)
        }
    }

    async updatePost(params: InspirationRequest.IUpdateInpiration) {
        try {
            const criteria = {
                _id: params.Id
            };
            const datatoUpdate = {
                ...params
            };
            const data = await expertDao.updateOne('gratitude_journals', criteria, datatoUpdate, {})
            if (data) {
                return config.CONSTANT.MESSAGES.SUCCESS.SUCCESSFULLY_UPDATED;
            }
        } catch (error) {
            throw error;
        }
    }
}
export const expertController = new ExpertController();