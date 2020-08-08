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
    SUCCESS: {
        SUCCESSFULLY_UPDATED: {
            "statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
            "message": "Category has been updated successfully.",
            "type": "SUCCESSFULLY_UPDATED"
        },
        SUCCESSFULLY_DELETED: {
            "statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
            "message": "Category been been deleted successfully.",
            "type": "SUCCESSFULLY_DELETED"
        },
        SUCCESSFULLY_BLOCKED: {
            "statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
            "message": "Category has been blocked successfully.",
            "type": "SUCCESSFULLY_BLOCKED"
        },
        SUCCESSFULLY_ACTIVE: {
            "statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
            "message": "Category has been active successfully.",
            "type": "SUCCESSFULLY_ACTIVE"
        },
        SUCCESSFULLY_ADDED: {
            "statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
            "message": "Category successfully added.",
            "type": "SUCCESSFULLY_ADDED"
        }
    }
};