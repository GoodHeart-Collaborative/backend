"use strict";

import * as _ from "lodash";
import { categoryDao } from "./CategoryDao";
import { eventDao } from "../../event/eventDao";
import * as config from '@config/constant';
import * as  CategoryConstant from '@modules/admin/catgeory/';
import * as apputils from '@utils/appUtils'
class CategoryController {

	/**
	 * @function addCategory
	 * @description admin add category name is unique
	 * @param params { "platform": double, "name": string, "email": string, "password": string }
	 * @returns object
	 * @author Rajat Maheshwari
	 */
    async addCategory(params: CategoryRequest.CategoryAdd) {
        try {

            const name = params.title.toLowerCase();
            var result = name.replace(/ /g, "_");
            const findCategory = await categoryDao.findOne('categories', { name: result, type: params.type }, {}, {});
            if (findCategory) {
                return Promise.reject(CategoryConstant.MESSAGES.ERROR.ALRADY_EXIST);
            }
            params['name'] = result;
            const data = await categoryDao.insert('categories', params, {});
            if (data) {
                return CategoryConstant.MESSAGES.SUCCESS.SUCCESSFULLY_ADDED
            }
            return;
        } catch (error) {
            throw error;
        }
    }

    /**
     * @function getCategory
     * @description admin get category list
     * @param { CategoryRequest.IGetCategory  }
     * @author Shubham
    */
    async getCategory(params: CategoryRequest.IGetCategory) {
        try {
            const { status, sortBy, sortOrder, limit, page, searchTerm, fromDate, toDate, type } = params;
            const aggPipe = [];
            const match: any = {};
            if (status) {
                match["$and"] = [{ status: status }, { status: { "$ne": config.CONSTANT.STATUS.DELETED } }];
            } else {
                match.status = { "$ne": config.CONSTANT.STATUS.DELETED };
            }
            match['type'] = type;
            if (searchTerm) {
                match["$or"] = [
                    { "title": { "$regex": searchTerm, "$options": "-i" } },
                    { "name": { "$regex": searchTerm, "$options": "-i" } },
                ];
            }
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

            if (fromDate && toDate) { match['createdAt'] = { $gte: fromDate, $lte: toDate }; }
            if (fromDate && !toDate) { match['createdAt'] = { $gte: fromDate }; }
            if (!fromDate && toDate) { match['createdAt'] = { $lte: toDate }; }

            if (type === config.CONSTANT.CATEGORY_TYPE.EVENT_CAEGORY) {
                aggPipe.push({
                    '$lookup': {
                        from: 'events',
                        let: {
                            cId: '$_id'
                        },
                        pipeline: [{
                            '$match': {
                                '$expr': {
                                    $and: [{
                                        $eq: ['$eventCategoryId', '$$cId']
                                    },
                                    {
                                        $ne: ['$status', config.CONSTANT.STATUS.DELETED]
                                    }]
                                }
                            }
                        }],
                        as: 'Posts'
                    }
                })
            }

            if (type === config.CONSTANT.CATEGORY_TYPE.OTHER_CATEGORY) {
                aggPipe.push({
                    '$lookup': {
                        from: 'expert_posts',
                        let: {
                            cId: '$_id'
                        },
                        pipeline: [{
                            '$match': {
                                '$expr': {
                                    $and: [{
                                        $eq: ['$categoryId', '$$cId']
                                    },
                                    {
                                        $ne: ['$status', config.CONSTANT.STATUS.DELETED]
                                    }]
                                }
                            }
                        }],
                        as: 'Posts'
                    }
                })
            }



            aggPipe.push({
                '$addFields': {
                    totalPost: {
                        '$size': '$Posts'
                    }
                }
            })

            aggPipe.push({
                '$project': {
                    Posts: 0
                }
            })
            const data = await categoryDao.paginate('categories', aggPipe, limit, page, {}, true);
            return data;
        } catch (error) {
            return Promise.reject(error);
        }
    }
    /**
      * @function updateCategory
      * @description admin update category
      * @param { CategoryRequest.IUpdateCategory  } params
      * @author Shubham
     */

    async updateCategory(params: CategoryRequest.IUpdateCategory) {
        try {
            const name = params.title.toLowerCase();

            var result = name.replace(/ /g, "_");

            const findData = await categoryDao.findOne('categories', { _id: params.categoryId }, {}, {});
            const criteria = {
                _id: params.categoryId
            };

            if (findData.name !== result) {
                const findName = await categoryDao.findOne('categories', { name: result }, {}, {});
                if (findName) {
                    return Promise.reject(CategoryConstant.MESSAGES.ERROR.ALRADY_EXIST)
                }
                params['name'] = result;
                const data = await categoryDao.updateOne('categories', criteria, params, {});
                return CategoryConstant.MESSAGES.SUCCESS.SUCCESSFULLY_UPDATED
            } else {
                const data = await categoryDao.updateOne('categories', criteria, params, {});
                return CategoryConstant.MESSAGES.SUCCESS.SUCCESSFULLY_UPDATED
            }
        } catch (error) {
            return Promise.reject(error);
        }
    }

    /**
     * @function categoryDetail
     * @description admin update category
     * @param { CategoryRequest.IGetCategory  } params
     * @author Shubham
     */

    async getDetails(params: CategoryRequest.IGetCategory) {
        try {
            return await categoryDao.getCatgeoryPosts(params)
        } catch (error) {
            return Promise.reject(error);
        }
    }

    /**
     * @function updateStatus
     * @description admin update category status
     * @param { CategoryRequest.IGetCategory  } params
     * @author Shubham
    */

    async updateStatus(params: CategoryRequest.IUpdateCategoryStatus) {
        try {
            const { status, categoryId } = params;
            const criteria = {
                _id: categoryId,
            };
            const dataToUpdate = {
                status: params.status
            }
            const data = await categoryDao.findOneAndUpdate('categories', criteria, dataToUpdate, { new: true });
            if (status === config.CONSTANT.STATUS.BLOCKED || status === config.CONSTANT.STATUS.DELETED) {
                const updateEventCategory = await eventDao.updateMany('event', { eventCategoryId: apputils.toObjectId(categoryId) }, { eventCategoryName: "", status: config.CONSTANT.STATUS.BLOCKED }, {})
            }
            if (status === config.CONSTANT.STATUS.ACTIVE) {
                const updateEventCategory = await eventDao.updateMany('event', { eventCategoryId: apputils.toObjectId(categoryId) }, { eventCategoryName: data.title, status: config.CONSTANT.STATUS.ACTIVE }, {})
            }


            if (data && status == config.CONSTANT.STATUS.DELETED) {
                return CategoryConstant.MESSAGES.SUCCESS.SUCCESSFULLY_DELETED
            }
            if (data && status == config.CONSTANT.STATUS.BLOCKED) {
                return CategoryConstant.MESSAGES.SUCCESS.SUCCESSFULLY_BLOCKED
            }
            return CategoryConstant.MESSAGES.SUCCESS.SUCCESSFULLY_ACTIVE
        } catch (error) {
            throw error;
        }
    }
    /**
     * @function getCategoryDetailById
     * @description admin getCategoryDetailById
     * @param { CategoryRequest.IGetCategory  } params
     * @author Shubham
     */

    async getCategoryDetailById(params: CategoryRequest.ICategoryById) {
        try {
            const criteria = {
                _id: params.categoryId
            }
            const data = await categoryDao.findOne('categories', criteria, {}, {});
            return data;
        } catch (error) {
            return Promise.reject(error);
        }
    }
}

export const categoryController = new CategoryController();