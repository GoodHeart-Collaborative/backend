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
        SUCCESS_WITH_NO_DATA: {
            "statusCode": config.CONSTANT.HTTP_STATUS_CODE.NO_CONTENT,
            "message": "SUCCESS",
            "type": "DEFAULT"
        },
        SUCCESSFULLY_ADDED: {
            "statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
            "message": "User has been added successFully",
            "type": "DEFAULT"
        },
        SUCCESSFULLY_DELETED: {
            "statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
            "message": "User has been deleted successFully",
            "type": "DEFAULT"
        },
        SUCCESSFULLY_BLOCKED: {
            "statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
            "message": "User has been blocked successFully",
            "type": "DEFAULT"
        },
        SUCCESSFULLY_ACTIVE: {
            "statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
            "message": "User has been active successFully",
            "type": "DEFAULT"
        },
        SUCCESSFULLY_UPDATED: {
            "statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
            "message": "post has been updated successfully",
            "type": "DEFAULT"
        },

        SUCCESSFULLY_PENDING: {
            "statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
            "message": "User account has been pending successFully",
            "type": "DEFAULT"
        },
        SUCCESSFULLY_REJECTED: {
            "statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
            "message": "User account has been rejected successFully",
            "type": "DEFAULT"
        },
        SUCCESSFULLY_VERIFIED: {
            "statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
            "message": "User account has been verified successFully",
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
    }
};

