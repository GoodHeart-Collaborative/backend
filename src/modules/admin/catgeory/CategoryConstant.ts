"use strict";

import * as config from "@config/constant";

export const MESSAGES = {
    ERROR: {
        EMAIL_ALREADY_EXIST: {
            "statusCode": config.CONSTANT.HTTP_STATUS_CODE.BAD_REQUEST,
            "message": "Email already exists.",
            "type": "EMAIL_ALREADY_EXIST"
        },
        ALRADY_EXIST: {
            "statusCode": config.CONSTANT.HTTP_STATUS_CODE.BAD_REQUEST,
            "message": "Category already exists.",
            "type": "EMAIL_ALREADY_EXIST"
        },
    },
};