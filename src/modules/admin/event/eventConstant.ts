"use strict";

import * as config from "@config/index";

export const MESSAGES = {


    EVENT_ACTIVE: 0,
    EVENT_EXPIRED: 1,
    EVENT_BLOCKED: 2,

    // EVENT_DELETE_MESSAGE: "This event has been blocked/deleted",
    EVENT_BLOCKED_DELETE: "This event has been blocked/deleted",
    EVENT_EXPIRED_MESSAGE: "This event has been expired",

    ERROR: {
        EMAIL_ALREADY_EXIST: {
            "statusCode": config.CONSTANT.HTTP_STATUS_CODE.BAD_REQUEST,
            "message": "User with this email is already registered.",
            "type": "EMAIL_ALREADY_EXIST"
        },
        EVENT_NOT_FOUND: {
            "statusCode": config.CONSTANT.HTTP_STATUS_CODE.BAD_REQUEST,
            "message": "Event Not fount",
            "type": "EMAIL_ALREADY_EXIST"
        },
        EVENT_EXPIRE: (data) => {
            return {
                eventStatus: `${data.Code}`,
                eventStatusMessage: `${data.message}`
            }
        }
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
        SUCCESSFULLY_ADDED: (data) => {
            return {
                "statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
                "message": "Event added successfully",
                "type": "DEFAULT",
                data: data,
            }
        },
        SUCCESSFULLY_BLOCKED: {
            "statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
            "message": "Event has been blocked successfully",
            "type": "DEFAULT"
        },
        SUCCESSFULLY_DELETED: {
            "statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
            "message": "Event has been deletd successfully",
            "type": "DEFAULT"
        },
        SUCCESSFULLY_ACTIVE: {
            "statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
            "message": "Event has been active successfully",
            "type": "DEFAULT"
        },
        SUCCESSFULLY_UPDATE: (data) => {
            return {
                "statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
                "message": "Event has been updated successfully",
                "type": "DEFAULT",
                data: data
            }
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

