"use strict";

import * as _ from "lodash";
import { categoryDao } from "./CategoryDao";
import * as config from '@config/constant';
import * as  CategoryConstant from '@modules/admin/catgeory/CategoryConstant';
class CategoryController {

	/**
	 * @function createAdmin
	 * @description first checking is admin is created or not,
	 * if not then create admin otherwise gives an error admin
	 * already exist.
	 * @param params { "platform": double, "name": string, "email": string, "password": string }
	 * @returns object
	 * @author Rajat Maheshwari
	 */
    async addCategory(params) {
        try {

            const name = params.title.toLowerCase();
            var result = name.replace(/ /g, "_");
            params['name'] = result;
            const data = await categoryDao.insert('categories', params, {});
            return data;

        } catch (error) {
            throw error;
        }
    }

    async getCategory(params) {
        try {
            const { status, sortBy, sortOrder, limit, page, searchTerm, fromDate, toDate } = params;
            const aggPipe = [];

            const match: any = {};
            // match.adminType = config.CONSTANT.ADMIN_TYPE.SUB_ADMIN;
            if (status) {
                match["$and"] = [{ status: status }, { status: { "$ne": config.CONSTANT.STATUS.DELETED } }];
            } else {
                match.status = { "$ne": config.CONSTANT.STATUS.DELETED };
            }
            if (searchTerm) {
                match["$or"] = [
                    { "title": { "$regex": searchTerm, "$options": "-i" } },
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

            const data = await categoryDao.paginate('categories', aggPipe, limit, page, {}, true);
            return data;
        } catch (error) {
            return Promise.reject(error);
        }
    }

    async updateCategory(params) {
        try {

            const name = params.title.toLowerCase();

            var result = name.replace(/ /g, "_");

            const findData = await categoryDao.findOne('categories', { name: result }, {}, {});
            if (findData) {
                return CategoryConstant.MESSAGES.ERROR.ALRADY_EXIST
            } else {
                params['name'] = result;
                const criteria = {
                    _id: params.categoryId
                };

                const data = await categoryDao.updateOne('categories', criteria, params, {});
                return data;

            }
        } catch (error) {
            return Promise.reject(error);
        }
    }

    async getById(params) {
        try {
            const criteria = {
                _id: params.categoryId,
            }

            const data = await categoryDao.findOne('categories', criteria, {}, {})
            return data;
        } catch (error) {
            return Promise.reject(error);
        }
    }

    async updateStatus(params) {
        try {

            const criteria = {
                _id: params.categoryId,
            };
            const dataToUpdate = {
                status: params.status
            }
            const data = await categoryDao.updateOne('categories', criteria, dataToUpdate, {});

            return data;
        } catch (error) {
            throw error;
        }
    }
}

export const categoryController = new CategoryController();