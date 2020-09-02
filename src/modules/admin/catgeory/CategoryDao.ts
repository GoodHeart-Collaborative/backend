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
            const { status, sortBy, sortOrder, limit, page, searchTerm, fromDate, toDate, categoryId } = params;
            const aggPipe = [];
            const match: any = {};

            match['categoryId'] = await appUtils.toObjectId(categoryId);
            if (status) {
                match["$and"] = [{ status: status }, { status: { "$ne": config.CONSTANT.STATUS.DELETED } }];
            } else {
                match.status = { "$ne": config.CONSTANT.STATUS.DELETED };
            }

            if (searchTerm) {
                match["$or"] = [
                    { "topic": { "$regex": searchTerm, "$options": "-i" } },
                    { "description": { "$regex": searchTerm, "$options": "-i" } },
                ];
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
            })

            aggPipe.push({ '$unwind': { path: '$expertData', preserveNullAndEmptyArrays: true } })

            const data = await categoryDao.paginate('expert_post', aggPipe, limit, page, {}, true);
            return data;

        } catch (error) {
            return Promise.reject(error);
        }
    }
}

export const categoryDao = new CategoryDao();