"use strict";

import * as config from "@config/index";

export const MESSAGES = {
    ERROR: {
        EMAIL_ALREADY_EXIST: {
            "statusCode": config.CONSTANT.HTTP_STATUS_CODE.BAD_REQUEST,
            "message": "Expert with this email is already registered.",
            "type": "EMAIL_ALREADY_EXIST"
        },
        ALREADY_EXIST: {
            "statusCode": config.CONSTANT.HTTP_STATUS_CODE.BAD_REQUEST,
            "message": "Expert with this email already registered",
            "type": "DEFAULT"
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
        ALREADY_EXIST: {
            "statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
            "message": "Expert with this email already registered",
            "type": "DEFAULT"
        },
        SUCCESSFULLY_ADDED: {
            "statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
            "message": "Expert has been added successfully",
            "type": "DEFAULT"
        },
        SUCCESSFULLY_DELETED: {
            "statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
            "message": "Expert has been deleted successfully",
            "type": "DEFAULT"
        },
        SUCCESSFULLY_BLOCKED: {
            "statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
            "message": "Expert has been blocked successfully",
            "type": "DEFAULT"
        },
        SUCCESSFULLY_ACTIVE: {
            "statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
            "message": "Expert has been active successfully",
            "type": "DEFAULT"
        },
        SUCCESSFULLY_UPDATED: (data) => {
            return {
                "statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
                "message": "Expert has been updated successfully",
                "type": "DEFAULT",
                data: data
            }
        },
        DEFAULT_WITH_DATA: (data) => {
            return {
                "statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
                "message": "Expert has been updated succesfully",
                "type": "DEFAULT",
                "data": data
            }
        },

        LOGOUT: {
            "statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
            "message": "Logout successfully.",
            "type": "LOGOUT"
        },
    }
};

