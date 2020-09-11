"use strict";

import * as config from "@config/index";

export const MESSAGES = {
    ERROR: {
        // GRATITUDE_JOURNAL_NOT_FOUND: {
        //     "statusCode": config.CONSTANT.HTTP_STATUS_CODE.BAD_REQUEST,
        //     "message": "Gratitude journal not found.",
        //     "type": "GRATITUDE_JOURNAL_NOT_FOUND"
        // },
    },
    SUCCESS: {
        GRATITUDE_JOURNAL_DATA: (data) => {
            return {
                "statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
                "message": "Gratitude journal data are.",
                "type": "GRATITUDE_JOURNAL_DATA",
                "data": data
            };
        },
        GRATITUDE_JOURNAL_DATA_ADDED: (data) => {
            return {
                "statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
                "message": "Gratitude journal data added successfully.",
                "type": "GRATITUDE_JOURNAL_DATA_ADDED",
                "data": data
            };
        },
        GRATITUDE_JOURNAL_DATA_UPDATED: (data) => {
            return {
                "statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
                "message": "Gratitude journal data added successfully.",
                "type": "GRATITUDE_JOURNAL_DATA_UPDATED",
                "data": data
            };
        },
    }
};

