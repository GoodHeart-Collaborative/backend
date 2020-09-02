"use strict";

import * as _ from "lodash";
import fs = require("fs");


import { reportDao } from "@modules/report/reportDao";
import { expert } from "@modules/admin/expert/expertModel";
import { forumtopicDao } from "@modules/forum/forumDao";
import * as config from "@config/constant";
import * as reportConstant from '@modules/report/reportConstant';
import { expertPostDao } from "@modules/admin/expertPost/expertPostDao";
import { userDao } from "@modules/user";
class ReportController {
    /**
     * @description user repost forum , expert post, and gratitude not shown to user again 
     * @param params 
     */
    async addReport(params) {
        try {
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
                $inc: { reportCount: inc }
            };

            if (params.type === config.CONSTANT.HOME_TYPE.FORUM_TOPIC) {
                const updateCount = await forumtopicDao.updateOne('forum', criteria, updateOne, {})
                console.log('updateCountupdateCount', updateCount);
            }
            if (params.type === config.CONSTANT.HOME_TYPE.EXPERTS_POST) {
                const updateCount = await expertPostDao.updateOne('expert_post', criteria, updateOne, {})
                console.log('updateCountupdateCount', updateCount);
            }
            if (params.type === config.CONSTANT.HOME_TYPE.USER) {
                const updateCount = await userDao.updateOne('users', criteria, updateOne, {})
                console.log('updateCountupdateCount', updateCount);
            }
            return reportConstant.MESSAGES.SUCCESS.POST_REPORTED(data);

        } catch (error) {
            throw error;
        }
    }

}
export const reportController = new ReportController();