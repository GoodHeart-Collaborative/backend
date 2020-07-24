"use strict";


import * as _ from "lodash";

import * as config from "@config/index";
import * as expertConstant from "@modules/admin/expert/expertConstant";
import { expertPostDao } from "@modules/admin/expertPost/expertPostDao";
import * as appUtils from "@utils/appUtils";
import { expertDao } from "../expert/expertDao";


class ExpertPostController {

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
    async addExpertPost(params) {
        try {
            // params["postedAt"] = moment(para).format('YYYY-MM-DD')
            const result = this.getTypeAndDisplayName(config.CONSTANT.EXPERT_CONTENT_TYPE, params['contentId'])
            console.log('data1data1data1data1data1', result);
            params['contentType'] = result['TYPE']
            params['contentDisplayName'] = result['DISPLAY_NAME'];

            console.log('paramsparamsparamsparams', params);

            const data = await expertPostDao.insert("expert_post", params, {});
            console.log('datadatadatadatadata', data);

            return expertConstant.MESSAGES.SUCCESS.SUCCESSFULLY_ADDED;

        } catch (error) {
            throw error;
        }
    }

    async getPostById(params: InspirationRequest.IGetInspirationById) {
        try {
            const criteria = {
                _id: params.Id,
            };

            const data = await expertPostDao.findOne('expert_post', criteria, {}, {})
            if (!data) {
                return expertConstant.MESSAGES.SUCCESS.SUCCESS_WITH_NO_DATA;
            }
            return expertConstant.MESSAGES.SUCCESS.DEFAULT_WITH_DATA(data);

            // return data;
        } catch (error) {
            throw error;
        }
    }


    async getExpertPosts(params) {
        try {
            const { expertId, categoryId, limit, pageNo, contentId } = params;
            console.log('contentIdcontentIdcontentId', contentId);

            let aggPipe = [];
            const match: any = {};

            if (!contentId) {
                match.status = { "$ne": config.CONSTANT.STATUS.DELETED };
                match._id = appUtils.toObjectId(expertId)
            }
            const query = {
                $lookup: {
                    from: 'categories',
                    let: { cId: '$categoryId' },
                    pipeline: [{
                        $match: {
                            $expr: {
                                $in: ['$_id', '$$cId']
                            }
                        }
                    }],
                    as: 'categoryData;'
                }
            }
            if (contentId) {
                match.contentId = contentId;
                match.status = config.CONSTANT.STATUS.ACTIVE;
                match.expertId = appUtils.toObjectId(expertId)
            }
            aggPipe.push({ $match: match })

            aggPipe = [...aggPipe, ...await expertDao.addSkipLimit(limit, pageNo)];
            if (!contentId) {
                aggPipe.push(query)
                return await expertDao.aggregate('expert', aggPipe, {},)
            }
            const result = await expertDao.aggreagtionWithPaginateTotal("expert_post", aggPipe, limit, pageNo, true)
            return result;
        } catch (error) {
            return Promise.reject(error)
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

            const data = await expertPostDao.paginate('expert_post', aggPipe, limit, page, {}, true);
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
            const data = await expertPostDao.updateOne('expert_post', criteria, datatoUpdate, {})
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
            const data = await expertPostDao.updateOne('expert_post', criteria, datatoUpdate, {})
            if (data) {
                return config.CONSTANT.MESSAGES.SUCCESS.SUCCESSFULLY_UPDATED;
            }
        } catch (error) {
            throw error;
        }
    }
}
export const expertPostController = new ExpertPostController();