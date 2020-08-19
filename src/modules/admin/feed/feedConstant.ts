"use strict";

import * as config from "@config/index";

export const MESSAGES = {
    ERROR: {
        GRATITUDE_JOURNAL_NOT_FOUND: {
            "statusCode": config.CONSTANT.HTTP_STATUS_CODE.BAD_REQUEST,
            "message": "Gratitude journal not found.",
            "type": "GRATITUDE_JOURNAL_NOT_FOUND"
        },
        GRATITUDE_JOURNAL_ALREADY_ADDED: (date) => {
            return {
                "statusCode": config.CONSTANT.HTTP_STATUS_CODE.BAD_REQUEST,
                "message": `Gratitude journal already added on ${date}`,
                "type": "GRATITUDE_JOURNAL_ALREADY_ADDED"
            }
        },
    },
    SUCCESS: {
        FORUM_ADDED: (data) => {
            return {
                "statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
                "message": "Forum added successful.",
                "type": "FORUM_ADDED",
                "data": data
            };
        },
        FORUM_STATUS_UPDATED: (data) => {
            return {
                "statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
                "message": `Forum ${data} successful.`,
                "type": "FORUM_ADDED"
            };
        },
        FORUM_UPDATED: (data) => {
            return {
                "statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
                "message": `Forum updated successful.`,
                "type": "FORUM_ADDED",
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