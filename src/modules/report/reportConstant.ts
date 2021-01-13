"use strict";
import * as config from "@config/index";

export const MESSAGES = {
    ERROR: {
        ALREADY_LIKE: {
            "statusCode": config.CONSTANT.HTTP_STATUS_CODE.BAD_REQUEST,
            "message": "Already like.",
            "type": "ALREADY_LIKE"
        },
        ALREADY_REPORTED: {
            "statusCode": config.CONSTANT.HTTP_STATUS_CODE.BAD_REQUEST,
            "message": "Already Reported",
            "type": "ALREADY_REPORTED"
        }
    },
    SUCCESS: {
        // DEFAULT: {
        //     "statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
        //     "message": "SUCCESS",
        //     "type": "DEFAULT"
        // },
        POST_REPORTED: (data) => {
            return {
                "statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
                "message": "Post reported successfully",
                "type": "DEFAULT",
                data: data
            }
        },
        USER_REPORTED: (data) => {
            return {
                "statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
                "message": "User reported successfully",
                "type": "DEFAULT",
                data: data
            }
        },
    }
};

