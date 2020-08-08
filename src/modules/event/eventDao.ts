"use strict";

import { BaseDao } from "@modules/base/BaseDao";
import * as config from "@config/index";
import * as appUtils from '@utils/appUtils'
import { DataSync } from "aws-sdk";
import { categoryDao } from "@modules/admin/catgeory";
import { expert } from "@modules/admin/expert/expertModel";
import { expertPostDao } from "@modules/admin/expertPost/expertPostDao";

export class EventDao extends BaseDao {

    async getGratitudeJournalData(params) {
        try {
        } catch (error) {
            return Promise.reject(error);
        }
    }
}

export const eventDao = new EventDao();