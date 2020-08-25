"use strict";

import * as config from "@config/index";

export const MESSAGES = {
    ERROR: {
        FORUM_NOT_FOUND: {
            "statusCode": config.CONSTANT.HTTP_STATUS_CODE.BAD_REQUEST,
            "message": "Forum not found.",
            "type": "FORUM_NOT_FOUND"
        }
    },
    SUCCESS: {
        FORUM_ADDED: (data) => {
            return {
                "statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
                "message": "Forum added successfully.",
                "type": "FORUM_ADDED",
                "data": data
            };
        },
        FORUM_UPDATED: (data) => {
            return {
                "statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
                "message": `Forum updated successfully.`,
                "type": "FORUM_UPDATED",
                "data": data
            };
        },
        FORUM_STATUS_UPDATED: (data) => {
            return {
                "statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
                "message": `Forum ${data} successfully.`,
                "type": "FORUM_UPDATED_STATUS",
            };
        },

        DEFAULT_SUCCESS: (data) => {
            return {
                "statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
                "message": "Success",
                "type": "FORUM_LIST",
                "data": data
            };
        },
    }
};