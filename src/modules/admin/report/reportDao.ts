"use strict";

import { BaseDao } from "@modules/base/BaseDao";

export class EventDao extends BaseDao {

    async getGratitudeJournalData(params) {
        try {
        } catch (error) {
            return Promise.reject(error);
        }
    }

}

export const eventDao = new EventDao();