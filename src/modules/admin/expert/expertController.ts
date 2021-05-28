"use strict";


import * as _ from "lodash";

import * as config from "@config/index";
import * as expertConstant from "@modules/admin/expert/expertConstant";
import { expertDao } from "@modules/admin/expert/expertDao";
import * as appUtils from "@utils/appUtils";
import { expertPostDao } from "../expertPost/expertPostDao";

class ExpertController {

    getTypeAndDisplayName(findObj, num: number) {
        const obj = findObj;
        const data = Object.values(obj);
        const result = data.filter((x: any) => {
            return x.VALUE === num;
        });
        return result[0];
    }
    /**
     * @function addExpert
     * @description admin add experts
     * @param (AdminExpertRequest.expertAdd)
     */
    async addExpert(params: AdminExpertRequest.expertAdd) {
        try {
            params['created'] = new Date().getTime()

            const findEmail = await expertDao.findOne('expert', { email: params.email }, {}, {});
            if (findEmail) {
                return Promise.reject(expertConstant.MESSAGES.ERROR.ALREADY_EXIST);
            }
            const data = await expertDao.insert("expert", params, {});
            return expertConstant.MESSAGES.SUCCESS.SUCCESSFULLY_ADDED;

        } catch (error) {
            throw error;
        }
    }

    /**
     * @function getExpert
     * @description admin get xperts and search and filter on the there [] category choose
     */

    async getExpert(params: AdminExpertRequest.getExpert) {
        try {
            const { categoryId, limit, page, sortOrder, sortBy, fromDate, toDate, searchTerm, status } = params;
            let aggPipe = [];
            const match: any = {};
            let sort = {};

            if (status) {
                match["$and"] = [{ status: status }, { status: { $ne: config.CONSTANT.STATUS.DELETED } }];
            } else {
                match.status = { "$ne": config.CONSTANT.STATUS.DELETED };
            }

            if (sortBy && sortOrder) {
                if (sortBy === "name") {
                    sort = { "name": sortOrder };
                } else {
                    sort = { "createdAt": sortOrder };
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
            aggPipe.push({
                $lookup: {
                    from: 'expert_posts',
                    let: { 'eId': '$_id' },
                    pipeline: [{
                        $match: {
                            $expr: {
                                $and: [{
                                    "$eq": ['$expertId', '$$eId'],
                                },
                                {
                                    $eq: ['$status', config.CONSTANT.STATUS.ACTIVE]
                                }]
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
            aggPipe = [...aggPipe, ...expertDao.addSkipLimit(limit, page)]
            const data = await expertDao.aggreagtionWithPaginateTotal('expert', aggPipe, limit, page, true)
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
            // params['profilePicUrl'] = [params.profilePicUrl]
            const dataToUpdate = {
                ...params
            }
            const data = await expertDao.updateOne('expert', criteria, dataToUpdate, {})

            const updateData = {
                expertName: params.name,
                profilePicUrl: params.profilePicUrl
            }
            const expertPost = expertPostDao.updateMany('expert_post', criteria, updateData, {})

            if (!data) {
                return expertConstant.MESSAGES.SUCCESS.SUCCESS_WITH_NO_DATA;
            }
            return expertConstant.MESSAGES.SUCCESS.SUCCESSFULLY_UPDATED(data);
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

    async getExpertDetail(payload: AdminExpertRequest.expertDetail) {
        try {
            let aggPipe = [];
            const match: any = {};
            match['_id'] = appUtils.toObjectId(payload.expertId);

            aggPipe.push({ $match: match })
            aggPipe.push({
                $lookup: {
                    from: 'categories',
                    let: { cId: '$categoryId' },
                    as: 'categoryData',
                    pipeline: [{
                        $match: {
                            $expr: {
                                $and: [{
                                    $in: ['$_id', '$$cId']
                                },
                                    // {
                                    //     $eq: ['$status', config.CONSTANT.STATUS.ACTIVE]
                                    // }
                                ]
                            }
                        }
                    }]
                },
            });

            const data = await expertDao.aggregate('expert', aggPipe, {});

            return data;
        } catch (error) {
            return Promise.reject(error)
        }
    }
}
export const expertController = new ExpertController();