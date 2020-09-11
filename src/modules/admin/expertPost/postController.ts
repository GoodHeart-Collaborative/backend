"use strict";


import * as _ from "lodash";

import * as config from "@config/index";
import * as expertPostConstant from "@modules/admin/expertPost/expertPostConstant";
import { expertPostDao } from "@modules/admin/expertPost/expertPostDao";
import * as appUtils from "@utils/appUtils";
import { expertDao } from "../expert/expertDao";


class ExpertPostController {

    getTypeAndDisplayName(findObj, num: number) {
        const obj = findObj;
        const data = Object.values(obj);

        const result = data.filter((x: any) => {
            return x.VALUE === num;
        });

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
            params['contentType'] = result['TYPE']
            params['contentDisplayName'] = result['DISPLAY_NAME'];

            params['created'] = new Date().getTime();
            const data = await expertPostDao.insert("expert_post", params, {});

            return expertPostConstant.MESSAGES.SUCCESS.SUCCESSFULLY_ADDED;

        } catch (error) {
            throw error;
        }
    }

    /**
     * @function getPostById
     * @description admin get postDetails
     * /
     **/
    async getPostById(params) {
        try {
            const match: any = {}
            const aggPipe = [];
            match['_id'] = appUtils.toObjectId(params.postId);
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
                                    $eq: ['$_id', '$$cId']
                                },
                                {
                                    $eq: ['$status', config.CONSTANT.STATUS.ACTIVE]
                                }]
                            }
                        }
                    }]
                }
            })
            aggPipe.push({
                $unwind: '$categoryData'
            })
            aggPipe.push({
                $lookup: {
                    from: 'experts',
                    let: { eId: '$expertId' },
                    as: 'expertData',
                    pipeline: [{
                        $match: {
                            $expr: {
                                $and: [{
                                    $eq: ['$_id', '$$eId']
                                },
                                ]
                            }
                        }
                    },
                    {
                        $project: {
                            "profilePicUrl": 1,
                            "name": 1,
                            "email": 1,
                            "profession": 1,
                            "industry": 4,
                            "bio": 1,
                            "experience": 1,
                        }
                    }]
                }
            })
            aggPipe.push({
                $unwind: '$expertData'
            })
            const data = await expertPostDao.aggregate('expert_post', aggPipe, {})
            if (!data) {
                return expertPostConstant.MESSAGES.SUCCESS.SUCCESS_WITH_NO_DATA;
            }
            return expertPostConstant.MESSAGES.SUCCESS.DEFAULT_WITH_DATA(data);
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
            const { expertId, categoryId, limit, contentId, searchTerm, fromDate, toDate, sortBy, sortOrder } = params;
            let sort = {};
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
                    { "topic": { "$regex": searchTerm, "$options": "-i" } },
                ];
            }

            if (fromDate && toDate) { match['createdAt'] = { $gte: fromDate, $lte: toDate }; }
            if (fromDate && !toDate) { match['createdAt'] = { $gte: fromDate }; }
            if (!fromDate && toDate) { match['createdAt'] = { $lte: toDate }; }

            aggPipe.push({ $match: match })

            if (sortBy && sortOrder) {
                if (sortBy === "topic") {
                    sort = { "topic": sortOrder };
                } else {
                    sort = { "createdAt": sortOrder };
                }
            } else {
                sort = { "createdAt": -1 };
            }

            // if (contentId) {
            //     match.contentId = contentId;
            //     // match.status = config.CONSTANT.STATUS.ACTIVE;
            //     // match.expertId = appUtils.toObjectId(expertId)
            // }
            aggPipe.push({ "$sort": sort });


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
                                    ]
                                }
                            }
                        }],
                        as: 'categoryData'
                    }
                })
                // aggPipe.push({ '$unwind': { path: '$categoryData', preserveNullAndEmptyArrays: true } })
            }

            // aggPipe.push({ $match: query })
            aggPipe = [...aggPipe, ...await expertDao.addSkipLimit(limit, pageNo)];
            if (!contentId) {
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
            const { postId, status } = params;
            const criteria = {
                _id: postId
            };

            const datatoUpdate = {
                status: status
            };
            const data = await expertPostDao.updateOne('expert_post', criteria, datatoUpdate, {})
            if (data && status == config.CONSTANT.STATUS.DELETED) {
                return expertPostConstant.MESSAGES.SUCCESS.SUCCESSFULLY_DELETED;
            }
            else if (data && status == config.CONSTANT.STATUS.BLOCKED) {
                return expertPostConstant.MESSAGES.SUCCESS.SUCCESSFULLY_BLOCKED;
            }
            return expertPostConstant.MESSAGES.SUCCESS.SUCCESSFULLY_ACTIVE;

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
            const data = await expertPostDao.findOneAndUpdate('expert_post', criteria, datatoUpdate, { new: true })
            if (data) {
                return expertPostConstant.MESSAGES.SUCCESS.SUCCESSFULLY_UPDATED(data);
            }
            return;
        } catch (error) {
            throw error;
        }
    }
}
export const expertPostController = new ExpertPostController();