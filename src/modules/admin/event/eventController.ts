"use strict";


import * as _ from "lodash";

import * as config from "@config/index";
import * as eventConstant from "@modules/admin/event/eventConstant";
import { eventDao } from "@modules/event/eventDao";
import * as appUtils from "@utils/appUtils";
import * as XLSX from 'xlsx'
import { categoryDao } from "../catgeory";

class EventController {

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
    async addEvent(params) {
        try {
            const categoryData = await categoryDao.findOne('categories', { _id: params.eventCategoryId }, {}, {})
            // const result = this.getTypeAndDisplayName(config.CONSTANT.EVENT_CATEGORY, params['eventCategoryId'])
            // console.log('data1data1data1data1data1', result);
            console.log('categoryDatacategoryData', categoryData);

            params.eventCategoryType = categoryData['name'];
            params.eventCategoryDisplayName = categoryData['title'];
            params.created = new Date().getTime();

            const data = await eventDao.insert("event", params, {});
            return eventConstant.MESSAGES.SUCCESS.SUCCESSFULLY_ADDED(data);

        } catch (error) {
            throw error;
        }
    }


    async getEvent(params) {
        try {
            const { categoryId, limit, page, sortOrder, sortBy, fromDate, toDate, searchTerm, userId, status } = params;
            let aggPipe = [];
            const match: any = {};
            let sort = {};
            const paginateOptions = {
                page: page || 1,
                limit: limit || 10,
            };

            if (userId) {
                match.userId = appUtils.toObjectId(params.userId);
            }
            if (status) {
                match["$and"] = [{ status: status }, { status: { $ne: config.CONSTANT.STATUS.DELETED } }];
            } else {
                match.status = { "$ne": config.CONSTANT.STATUS.DELETED };
            }

            if (sortBy && sortOrder) {
                if (sortBy === "title") {
                    sort = { "name": sortOrder };
                }
                else if (sortBy === "startDate") {
                    sort = { "startDate": sortOrder };
                }
                else if (sortBy === "endDate") {
                    sort = { "endDate": sortOrder };
                }
                else {
                    sort = { "created": sortOrder };
                }
            } else {
                sort = { _id: -1 };
            }
            if (searchTerm) {
                match["$or"] = [
                    { "title": { "$regex": searchTerm, "$options": "-i" } },
                    { "description": { "$regex": searchTerm, "$options": "-i" } },
                ];
            }
            if (categoryId) {

                match.userId = appUtils.toObjectId(params.categoryId);
            }
            aggPipe.push({ "$sort": sort });

            if (fromDate && toDate) { match['createdAt'] = { $gte: fromDate, $lte: toDate }; }
            if (fromDate && !toDate) { match['createdAt'] = { $gte: fromDate }; }
            if (!fromDate && toDate) { match['createdAt'] = { $lte: toDate }; }


            aggPipe.push({ $match: match })
            aggPipe.push({ $sort: { _id: -1 } });
            // aggPipe.push({
            //     $lookup: {
            //         from: 'categories',
            //         let: { 'cId': '$categoryId' },
            //         pipeline: [{
            //             $match: {
            //                 $expr: {
            //                     "$eq": ['$_id', '$$cId'],
            //                 }
            //             }
            //         }],
            //         "as": "categoryData"
            //     }
            // })

            aggPipe = [...aggPipe, ...eventDao.addSkipLimit(paginateOptions.limit, paginateOptions.page)];
            const data = await eventDao.aggreagtionWithPaginateTotal('event', aggPipe, paginateOptions.limit, paginateOptions.page, true)
            return data;

        } catch (error) {
            return Promise.reject(error);
        }

    }

    // async updateExpert(params: AdminExpertRequest.updateExpert) {
    //     try {
    //         const criteria = {
    //             _id: params.expertId,
    //         };

    //         const data = await eventDao.updateOne('expert', criteria, params, {})
    //         if (!data) {
    //             return expertConstant.MESSAGES.SUCCESS.SUCCESS_WITH_NO_DATA;
    //         }
    //         return expertConstant.MESSAGES.SUCCESS.DEFAULT_WITH_DATA(data);
    //     } catch (error) {
    //         throw error;
    //     }
    // }

    /**
     * @function updateStatus
     * @description admin update status active ,block ,delete
     */

    async updateStatus(params) {
        try {
            const { Id, status } = params;
            const criteria = {
                _id: Id
            };
            const datatoUpdate = {
                status: status
            };
            const data = await eventDao.updateOne('event', criteria, datatoUpdate, {})
            if (data && status == config.CONSTANT.STATUS.DELETED) {
                return eventConstant.MESSAGES.SUCCESS.SUCCESSFULLY_DELETED;
            }
            else if (data && status == config.CONSTANT.STATUS.BLOCKED) {
                return eventConstant.MESSAGES.SUCCESS.SUCCESSFULLY_BLOCKED;
            }
            return eventConstant.MESSAGES.SUCCESS.SUCCESSFULLY_ACTIVE;
        } catch (error) {
            return Promise.reject(error)
        }
    }

    /**
     * @description admin get event detail
     */
    async getDetails(params) {
        try {
            const criteria = {
                _id: params.eventId
            }
            return await eventDao.findOne('event', criteria, {}, {})
        } catch (error) {
            return Promise.reject(error)
        }
    }

    async updateEvent(params) {
        try {
            const criteria = {
                _id: params.eventId
            }

            const result = await categoryDao.findOne('categories', { _id: params.eventCategoryId }, {}, {})

            // const result = this.getTypeAndDisplayName(config.CONSTANT.EVENT_CATEGORY, params['eventCategoryId'])
            console.log('data1data1data1data1data1', result);
            params['eventCategoryType'] = result['name'];
            params['eventCategoryDisplayName'] = result['title'];
            params['created'] = new Date().getTime();


            const dataToUpdate = {
                ...params
            }
            const data = await eventDao.updateOne('event', criteria, dataToUpdate, {})
            return eventConstant.MESSAGES.SUCCESS.SUCCESSFULLY_UPDATE;
        } catch (error) {
            return Promise.reject(error)
        }
    }
}
export const eventController = new EventController();