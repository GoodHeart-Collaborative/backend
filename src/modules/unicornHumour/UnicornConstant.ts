"use strict";

import * as config from "@config/index";

export const MESSAGES = {
    ERROR: {
        EMAIL_ALREADY_EXIST: {
            "statusCode": config.CONSTANT.HTTP_STATUS_CODE.BAD_REQUEST,
            "message": "User with this email is already registered.",
            "type": "EMAIL_ALREADY_EXIST"
        },
    },
    SUCCESS: {
        DEFAULT: {
            "statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
            "message": "SUCCESS",
            "type": "DEFAULT"
        },
        DEFAULT_WITH_DATA: (data) => {
            return {
                "statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
                "message": "SUCCESS",
                "type": "DEFAULT",
                "data": data
            }
        },

        USER_LIST: (data) => {
            return {
                "statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
                "message": "User list get successfully.",
                "type": "USER_LIST",
                "data": data
            };
        },

        BLOCK_USER: {
            "statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
            "message": "User account successfully blocked.",
            "type": "BLOCK_USER"
        },
    },
};
