"use strict";

import { BaseDao } from "@modules/base/BaseDao";
import * as config from "@config/index";
import * as appUtils from '@utils/appUtils'
import { DataSync } from "aws-sdk";
import { categoryDao } from "@modules/admin/catgeory";
import { expert } from "@modules/admin/expert/expertModel";

export class ExpertDao extends BaseDao {

    async getGratitudeJournalData(params) {
        try {
            let { pageNo, limit } = params
            let match: any = {};
            let aggPipe = [];
            let result: any = {}
            match["status"] = config.CONSTANT.STATUS.ACTIVE
            aggPipe.push({ "$sort": { "createdAt": -1 } });
        } catch (error) {
            return Promise.reject(error);
        }
    }

    async getExperts(payload) {
        try {
            const { searchTerm, } = payload;
            let { limit, page } = payload
            let searchCriteria: any = {};
            const criteria = {
                status: config.CONSTANT.STATUS.ACTIVE,
            }
            const paginateOptions = {
                limit: limit || 10,
                pageNo: page || 1,
            };
            console.log('paginateOptions', paginateOptions);

            const getCatgeory = await categoryDao.find('categories', criteria, {}, {}, { _id: -1 }, paginateOptions, {})

            console.log('getCatgeporygetCatgepory', getCatgeory);


            if (searchTerm) {
                searchCriteria = {
                    $or: [
                        { title: { $regex: searchTerm, $options: 'i' } },
                        { description: { $regex: searchTerm, $options: 'i' } },
                    ],
                };
            }
            else {
                searchCriteria = {
                };
            }

            // const pipeline =

            // const getExperts =


            return {
                getCatgeory
            };


        } catch (error) {
            return Promise.reject(error)
        }
    }
}

export const expertDao = new ExpertDao();