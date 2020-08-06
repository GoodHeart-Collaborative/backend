"use strict";


import * as _ from "lodash";

import * as config from "@config/index";
import * as expertConstant from "@modules/admin/expert/expertConstant";
import { eventDao } from "@modules/event/eventDao";
import * as appUtils from "@utils/appUtils";
import * as XLSX from 'xlsx'

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

async getEvent(params){
    try{
        const { categoryId, limit, page, sortOrder, sortBy, fromDate, toDate, searchTerm } = params;
        let aggPipe = [];
        const match: any = {};
        let sort = {};
        match.userId =appUtils.toObjectId(params.userId);
        match.status = { "$ne": config.CONSTANT.STATUS.DELETED };

        if (sortBy && sortOrder) {
            if (sortBy === "name") {
                sort = { "name": sortOrder };
            } else {
                sort = { "created": sortOrder };
            }
        } else {
            sort = { "created": -1 };
        }
        if (searchTerm) {
            match["$or"] = [
                { "name": { "$regex": searchTerm, "$options": "-i" } },
                { "email": { "$regex": searchTerm, "$options": "-i" } },
            ];
        }
        if (categoryId) {

        match.userId =appUtils.toObjectId(params.categoryId);
        }
        aggPipe.push({ "$sort": sort });

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
                            "$eq": ['$_id', '$$cId'],
                        }
                    }
                }],
                "as": "categoryData"
            }
        })
        console.log('>>>>>>>>>>>>>.');

 

        const data = await eventDao.aggreagtionWithPaginateTotal('event', aggPipe, limit, page, true)
        console.log('datadatadata', data);
        return data;

    }catch(error){
        return Promise.reject(error);
    }

}

    async updateExpert(params: AdminExpertRequest.updateExpert) {
        try {
            const criteria = {
                _id: params.expertId,
            };

            const data = await eventDao.updateOne('expert', criteria, params, {})
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
            const criteria = {
                _id: params.expertId
            };
            const datatoUpdate = {
                status: params.status
            };
            const data = await eventDao.updateOne('expert', criteria, datatoUpdate, {})
            return config.CONSTANT.MESSAGES.SUCCESS.SUCCESSFULLY_UPDATED;
        } catch (error) {
            return Promise.reject(error)
        }
    }
}
export const eventController = new EventController();