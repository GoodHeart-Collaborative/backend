"use strict";

import * as _ from "lodash";
import { categoryDao } from "./CategoryDao";
import * as config from '@config/constant';
import * as  CategoryConstant from '@modules/catgeory/CategoryConstant';
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
            console.log('namenamename', name);

            var result = name.replace(/ /g, "_");
            console.log('resultresultresult', result);

            params['name'] = result;
            console.log('paramsparamsparamsparams', params);
            const data = await categoryDao.insert('categories', params, {});
            console.log('datadatadatadata', data);
            return data;

        } catch (error) {
            throw error;
        }
    }

    async getCategory(params) {
        try {
            console.log('paramsparamsparamsparams', params);
            const { status, sortBy, sortOrder, limit, page, searchTerm } = params;
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
            console.log('aggPipeaggPipeaggPipeaggPipe111111111', aggPipe);

            aggPipe.push({ "$match": match });

            console.log('aggPipeaggPipeaggPipeaggPipe3333333333333333', aggPipe);

            // const project = { _id: 1, name: 1, email: 1, created: 1, status: 1 };
            // aggPipe.push({ "$project": project });

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

            console.log('aggPipeaggPipeaggPipeaggPipe', aggPipe);


            const data = await categoryDao.paginate('categories', aggPipe, limit, page, {}, true);
            console.log('datadatadata', data);
            return data;
        } catch (error) {
            return Promise.reject(error);
        }
    }

    async updateCategory(params) {
        try {

            const name = params.title.toLowerCase();
            console.log('namenamename', name);

            var result = name.replace(/ /g, "_");
            console.log('resultresultresult', result);

            const findData = await categoryDao.findOne('categories', { name: result }, {}, {});
            if (findData) {
                return CategoryConstant.MESSAGES.ERROR.ALRADY_EXIST
            } else {
                params['name'] = result;
                console.log('paramsparamsparamsparams', params);
                const criteria = {
                    _id: params.categoryId
                };

                const data = await categoryDao.updateOne('categories', criteria, params, {});
                console.log('datadatadatadata', data);
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
            console.log('datadatadata', data);
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
            // if (data['nModified'] == 0){

            // }

            return data;
        } catch (error) {
            throw error;
        }
    }
}

export const categoryController = new CategoryController();