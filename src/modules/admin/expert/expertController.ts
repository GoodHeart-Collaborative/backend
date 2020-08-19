"use strict";


import * as _ from "lodash";

import * as config from "@config/index";
import * as expertConstant from "@modules/admin/expert/expertConstant";
import { expertDao } from "@modules/admin/expert/expertDao";
import * as appUtils from "@utils/appUtils";
import * as XLSX from 'xlsx'

class ExpertController {

    getTypeAndDisplayName(findObj, num: number) {
        const obj = findObj;
        const data = Object.values(obj);
        const result = data.filter((x: any) => {
            return x.VALUE === num;
        });
        console.log('resultresultresult', result);
        return result[0];
    }
	/**
	 * @function addExpert
	 * @description admin add experts
	 */
    async addExpert(params: AdminExpertRequest.expertAdd) {
        try {
            params['created'] = new Date().getTime()
            const data = await expertDao.insert("expert", params, {});
            return expertConstant.MESSAGES.SUCCESS.SUCCESSFULLY_ADDED;

        } catch (error) {
            throw error;
        }
    }

	/**
	 * @function getExpert
	 * @description admin get xperts and seacch and filter on the there [] category choose
	 */

    async getExpert(params: AdminExpertRequest.getExpert) {
        try {
            const { categoryId, limit, page, sortOrder, sortBy, fromDate, toDate, searchTerm } = params;
            let aggPipe = [];
            const match: any = {};
            let sort = {};
            match.status = { "$ne": config.CONSTANT.STATUS.DELETED };

            if (sortBy && sortOrder) {
                if (sortBy === "name") {
                    sort = { "name": sortOrder };
                } else {
                    sort = { "created": sortOrder };
                }
            } else {
                sort = { "createdAt": -1 };
            }
            if (searchTerm) {
                match["$or"] = [
                    { "name": { "$regex": searchTerm, "$options": "-i" } },
                    { "email": { "$regex": searchTerm, "$options": "-i" } },
                ];
            }

            aggPipe.push({ "$sort": sort });

            if (categoryId) {
                const Ids = categoryId.split(',');
                const ArrayIds = [];
                Ids.map(data => {
                    ArrayIds.push(appUtils.toObjectId(data));
                })
                match['categoryId'] = {
                    $in: ArrayIds
                }
            }

            if (fromDate && toDate) { match['createdAt'] = { $gte: fromDate, $lte: toDate }; }
            if (fromDate && !toDate) { match['createdAt'] = { $gte: fromDate }; }
            if (!fromDate && toDate) { match['createdAt'] = { $lte: toDate }; }


            aggPipe.push({ $match: match })

            aggPipe.push({
                $lookup: {
                    from: 'categories',
                    let: { 'cId': '$categoryId' },
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
            console.log('>>>>>>>>>>>>>.');

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

	/**
	 * @function updateExpert
	 * @description admin update experts
	 */

    async updateExpert(params: AdminExpertRequest.updateExpert) {
        try {
            const criteria = {
                _id: params.expertId,
            };

            const data = await expertDao.updateOne('expert', criteria, params, {})
            if (!data) {
                return expertConstant.MESSAGES.SUCCESS.SUCCESS_WITH_NO_DATA;
            }
            return expertConstant.MESSAGES.SUCCESS.DEFAULT_WITH_DATA(data);
        } catch (error) {
            throw error;
        }
    }

    /**
     * @function updateStatus
     * @description admin update status active ,block ,delete
     */

    async updateStatus(params: AdminExpertRequest.updateStatus) {
        try {
            const { expertId, status } = params;
            const criteria = {
                _id: expertId
            };
            const datatoUpdate = {
                status: status
            };
            const data = await expertDao.updateOne('expert', criteria, datatoUpdate, {});
            if (data && status == config.CONSTANT.STATUS.DELETED) {
                return expertConstant.MESSAGES.SUCCESS.SUCCESSFULLY_DELETED;
            }
            else if (data && status == config.CONSTANT.STATUS.BLOCKED) {
                return expertConstant.MESSAGES.SUCCESS.SUCCESSFULLY_BLOCKED;
            }
            return expertConstant.MESSAGES.SUCCESS.SUCCESSFULLY_ACTIVE;
        } catch (error) {
            return Promise.reject(error)
        }
    }
}
export const expertController = new ExpertController();