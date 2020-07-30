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
	 * @function addExpertPosts
	 * @description admin add post to the experts
     * /
     **/
    async addExpertPost(params: AdminExpertPostRequest.AddPost) {
        try {
            // params["postedAt"] = moment(para).format('YYYY-MM-DD')
            const result = this.getTypeAndDisplayName(config.CONSTANT.EXPERT_CONTENT_TYPE, params['contentId'])
            console.log('data1data1data1data1data1', result);
            params['contentType'] = result['TYPE']
            params['contentDisplayName'] = result['DISPLAY_NAME'];

            const data = await expertPostDao.insert("expert_post", params, {});

            return expertConstant.MESSAGES.SUCCESS.SUCCESSFULLY_ADDED;

        } catch (error) {
            throw error;
        }
    }

    /**
     * @function getPostById
     * @description admin get postDetails
     * /
     **/
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

    /**
     * @function getExpertPosts
     * @description admin get experts post
     * /
    **/
    async getExpertPosts(params: AdminExpertPostRequest.getExpert) {
        try {
            const pageNo = params.page;
            const { expertId, categoryId, limit, contentId, searchTerm, fromDate, toDate } = params;

            let aggPipe = [];
            const match: any = {};

            if (!contentId) {
                match['status'] = { "$ne": config.CONSTANT.STATUS.DELETED };
                match['_id'] = appUtils.toObjectId(expertId)
            } else {
                match['status'] = { "$ne": config.CONSTANT.STATUS.DELETED };
                match['expertId'] = appUtils.toObjectId(expertId);
                match.contentId = contentId;

            }

            if (searchTerm) {
                match["$or"] = [
                    { "description": { "$regex": searchTerm, "$options": "-i" } },
                ];
            }

            if (fromDate && toDate) { match['createdAt'] = { $gte: fromDate, $lte: toDate }; }
            if (fromDate && !toDate) { match['createdAt'] = { $gte: fromDate }; }
            if (!fromDate && toDate) { match['createdAt'] = { $lte: toDate }; }

            let query;

            // if (contentId) {
            //     match.contentId = contentId;
            //     // match.status = config.CONSTANT.STATUS.ACTIVE;
            //     // match.expertId = appUtils.toObjectId(expertId)
            // }
            aggPipe.push({ $match: match })

            if (!contentId) {
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
            }
            else {
                aggPipe.push({
                    $lookup: {
                        from: 'categories',
                        let: { cId: '$categoryId' },
                        pipeline: [{
                            $match: {
                                $expr: {
                                    $and: [
                                        {
                                            $eq: ['$_id', '$$cId']
                                        },
                                        // {
                                        //     $eq: ['$contentId', contentId]
                                        // },
                                        // {
                                        //     $eq: ['status', config.CONSTANT.STATUS.ACTIVE]
                                        // },
                                        // {
                                        //     $eq: ['expertId', appUtils.toObjectId(expertId)]
                                        // }
                                    ]
                                }
                            }
                        }],
                        as: 'categoryData'
                    }
                })
                // aggPipe.push({ '$unwind': { path: '$categoryData', preserveNullAndEmptyArrays: true } })
            }
            console.log('aggPipeaggPipe', JSON.stringify(aggPipe));

            // aggPipe.push({ $match: query })
            aggPipe = [...aggPipe, ...await expertDao.addSkipLimit(limit, pageNo)];
            if (!contentId) {
                console.log('5f193411e8e62430c62cada55f193411e8e62430c62cada5');

                // aggPipe.push(query)
                return await expertDao.aggregate('expert', aggPipe, {},)
            }
            const result = await expertPostDao.aggreagtionWithPaginateTotal("expert_post", aggPipe, limit, pageNo, true)
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

    async updateStatus(params: AdminExpertPostRequest.updateStatus) {
        try {
            const criteria = {
                _id: params.postId
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

    async updatePost(params: AdminExpertPostRequest.adminUpdateExpertPost) {
        try {
            const criteria = {
                _id: params.postId
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