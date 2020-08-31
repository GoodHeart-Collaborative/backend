"use strict";

import * as _ from "lodash";
import fs = require("fs");


import { reportDao } from "@modules/report/reportDao";
import { expert } from "@modules/admin/expert/expertModel";
import { forumtopicDao } from "@modules/forum/forumDao";
import * as config from "@config/constant";

class ReportController {

    async addReport(params) {
        try {
            console.log('paramsparamsparamsparams', params);

            const criteria = {
                _id: params.postId
            };
            const dataToSave = {
                ...params
            };
            const data = await reportDao.save('report', dataToSave)
            console.log('datadatadatadatadata', data);

            const inc = 1;
            const updateOne = {
                reportCount: inc
            };
            console.log('updateOneupdateOne', updateOne);

            if (params.type === config.CONSTANT.HOME_TYPE.FORUM_TOPIC) {
                const updateCount = await forumtopicDao.updateOne('forum', criteria, updateOne, {})
                console.log('updateCountupdateCount', updateCount);
            }
            return data;

        } catch (error) {
            throw error;
        }
    }

}
export const reportController = new ReportController();