"use strict";

import { BaseDao } from "@modules/base/BaseDao";

export class AdminEventInterest extends BaseDao {

    async getGratitudeJournalData(params) {
        try {
        } catch (error) {
            return Promise.reject(error);
        }
    }
}

export const adminEventInterestDao = new AdminEventInterest();