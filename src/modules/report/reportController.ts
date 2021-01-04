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
import { errorReporter } from "@lib/flockErrorReporter";
class ReportController {
    /**
     * @description user report the  forum, expertPost, otheruser
     * @param params (UserReportRequest.Addreport)
     */
    async addReport(params: UserReportRequest.Addreport) {
        try {
            const criteria = {
                _id: params.postId
            };
            const dataToSave = {
                ...params
            };


            if (params.type === config.CONSTANT.HOME_TYPE.USER) {
                const findAlreadyReported = await reportDao.findOne('report', { postId: params.postId, userId: params.userId }, {}, {});
                if (findAlreadyReported) {
                    return Promise.reject(reportConstant.MESSAGES.ERROR.ALREADY_REPORTED);
                }
            }
            const data = await reportDao.save('report', dataToSave);
            const inc = 1;
            const updateOne = {
                $inc: { reportCount: inc }
            };

            if (params.type === config.CONSTANT.HOME_TYPE.FORUM_TOPIC) {
                const updateCount = await forumtopicDao.updateOne('forum', criteria, updateOne, {})
                return reportConstant.MESSAGES.SUCCESS.POST_REPORTED(data);

            }
            else if (params.type === config.CONSTANT.HOME_TYPE.EXPERTS_POST) {
                const updateCount = await expertPostDao.updateOne('expert_post', criteria, updateOne, {})
                return reportConstant.MESSAGES.SUCCESS.POST_REPORTED(data);

            }
            else if (params.type === config.CONSTANT.HOME_TYPE.USER) {
                const updateCount = await userDao.updateOne('users', criteria, updateOne, {})
                return reportConstant.MESSAGES.SUCCESS.USER_REPORTED(data);
            }
            else if (params.type === config.CONSTANT.HOME_TYPE.UNICORN || params.type === config.CONSTANT.HOME_TYPE.INSPIRATION || params.type === config.CONSTANT.HOME_TYPE.DAILY_ADVICE) {
                const updateCount = await userDao.updateOne('home', criteria, updateOne, {})
                return reportConstant.MESSAGES.SUCCESS.POST_REPORTED(data);
            }
            else if (params.type === config.CONSTANT.HOME_TYPE.GENERAL_GRATITUDE) {
                const updateCount = await userDao.updateOne('gratitude_journals', criteria, updateOne, {})
                return reportConstant.MESSAGES.SUCCESS.POST_REPORTED(data);
            }

            return reportConstant.MESSAGES.SUCCESS.POST_REPORTED(data);

        } catch (error) {
            errorReporter(error);
            throw error;
        }
    }

}
export const reportController = new ReportController();