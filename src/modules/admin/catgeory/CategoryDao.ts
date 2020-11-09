"use strict";

import * as _ from "lodash";

import { BaseDao } from "@modules/base/BaseDao";
import * as config from "@config/constant";
import * as appUtils from "@utils/appUtils";

export class CategoryDao extends BaseDao {

	/**
	 * @function isEmailExists
	 */
    async isEmailExists(params, tokenData?: TokenData | any) {
        try {

            // return await this.findOne("admins", query, projection, options, {});
        } catch (error) {
            throw error;
        }
    }
    /**
      * @function getCatgeoryPosts
      * @description get category related posts
      * @param { CategoryRequest.IGetCategory  } params
      * @author Shubham
      */

    async getCatgeoryPosts(params: CategoryRequest.IGetCategory) {
        try {
            const { status, sortBy, privacy, sortOrder, limit, page, searchTerm, fromDate, toDate, categoryId, type } = params;
            const aggPipe = [];
            const match: any = {};

            if (type === 2) {
                match['categoryId'] = appUtils.toObjectId(categoryId);
            }
            if (type === 1) {
                match['eventCategoryId'] = appUtils.toObjectId(categoryId);
            }
            if (status) {
                match["$and"] = [{ status: status }, { status: { "$ne": config.CONSTANT.STATUS.DELETED } }];
            } else {
                match.status = { "$ne": config.CONSTANT.STATUS.DELETED };
            }

            if (privacy) {
                match.privacy = privacy;
            }


            aggPipe.push({ "$match": match });
            let sort = {};
            if (sortBy && sortOrder) {
                if (sortBy === "title") {
                    sort = { "title": sortOrder };
                } else {
                    sort = { "created": sortOrder };
                }
            } else {
                sort = { "created": -1 };
            }
            aggPipe.push({ "$sort": sort });

            if (fromDate && toDate) { match['createdAt'] = { $gte: fromDate, $lte: toDate }; }
            if (fromDate && !toDate) { match['createdAt'] = { $gte: fromDate }; }
            if (!fromDate && toDate) { match['createdAt'] = { $lte: toDate }; }

            if (type === 1) {
                aggPipe.push({
                    $addFields: {
                        isExpired: {
                            $cond: {
                                if: {
                                    $gte: ['$endDate', new Date().getTime()]
                                }, then: false,
                                else: true
                            },
                        }
                    }
                })
            }

            if (type === config.CONSTANT.CATEGORY_TYPE.OTHER_CATEGORY) {
                aggPipe.push({
                    '$lookup': {
                        from: 'experts',
                        let: {
                            eId: '$expertId'
                        },
                        pipeline: [{
                            '$match': {
                                '$expr': {
                                    $and: [{
                                        '$eq': ['$_id', '$$eId']
                                    },
                                    {
                                        '$eq': ['$status', config.CONSTANT.STATUS.ACTIVE]
                                    }
                                    ]
                                }
                            },

                        },
                        {
                            $project:
                                { "name": 1, "status": 1, profilePicUrl: 1 }
                        }
                        ],
                        as: 'expertData'
                    }
                });
                aggPipe.push({ '$unwind': { path: '$expertData', preserveNullAndEmptyArrays: true } })
            }

            if (searchTerm && type === config.CONSTANT.CATEGORY_TYPE.OTHER_CATEGORY) {
                match["$or"] = [
                    { "topic": { "$regex": searchTerm, "$options": "-i" } },
                    { "description": { "$regex": searchTerm, "$options": "-i" } },
                    { "expertData.name": { "$regex": searchTerm, "$options": "-i" } }
                ];
            }


            if (type === config.CONSTANT.CATEGORY_TYPE.EVENT_CAEGORY) {
                aggPipe.push({
                    '$lookup': {
                        from: 'users',
                        let: {
                            uId: '$userId'
                        },
                        pipeline: [{
                            '$match': {
                                '$expr': {
                                    $and: [{
                                        '$eq': ['$_id', '$$uId']
                                    },
                                    {
                                        '$eq': ['$status', config.CONSTANT.STATUS.ACTIVE]
                                    }
                                    ]
                                }
                            },

                        },
                        {
                            $project:
                                { "title": 1, "description": 1, price: 1, startDate: 1, endDate: 1, address: 1 }
                        }
                        ],
                        as: 'eventData'
                    }
                });
                aggPipe.push({ '$unwind': { path: '$eventData', preserveNullAndEmptyArrays: true } })
            }

            if (searchTerm && type === config.CONSTANT.CATEGORY_TYPE.EVENT_CAEGORY) {
                match["$or"] = [
                    { "title": { "$regex": searchTerm, "$options": "-i" } },
                    { "eventData.address": { "$regex": searchTerm, "$options": "-i" } }
                ];
            }

            const findCategoryData = await categoryDao.findOne('categories', { _id: appUtils.toObjectId(params.categoryId) }, {}, {})

            let data;
            if (type === config.CONSTANT.CATEGORY_TYPE.OTHER_CATEGORY) {
                data = await categoryDao.paginate('expert_post', aggPipe, limit, page, {}, true);
            }
            if (type === config.CONSTANT.CATEGORY_TYPE.EVENT_CAEGORY) {
                data = await categoryDao.paginate('event', aggPipe, limit, page, {}, true);
                console.log('paramsparamsparamsparams', params);

            }
            data['categoryData'] = findCategoryData;
            return data;

        } catch (error) {
            return Promise.reject(error);
        }
    }
}

export const categoryDao = new CategoryDao();