"use strict";

import * as _ from "lodash";
import { categoryDao } from "./CategoryDao";


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

}

export const categoryController = new CategoryController();