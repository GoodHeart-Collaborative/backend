"use strict";

import * as config from "@config/index";

export const MESSAGES = {
    ERROR: {
        ALREADY_LIKE: {
            "statusCode": config.CONSTANT.HTTP_STATUS_CODE.BAD_REQUEST,
            "message": "Already like.",
            "type": "ALREADY_LIKE"
        },
        // FEATURE_NOT_ENABLE: {
        //     "statusCode": config.CONSTANT.HTTP_STATUS_CODE.BAD_REQUEST,
        //     "message": "Feature not enable.",
        //     "type": "FEATURE_NOT_ENABLE"
        // },
        // POST_NOT_FOUND: {
        //     "statusCode": config.CONSTANT.HTTP_STATUS_CODE.BAD_REQUEST,
        //     "message": "Post not found.",
        //     "type": "POST_NOT_FOUND"
        // },
        // COMMENT_NOT_FOUND: {
        //     "statusCode": config.CONSTANT.HTTP_STATUS_CODE.BAD_REQUEST,
        //     "message": "Comment not found.",
        //     "type": "COMMENT_NOT_FOUND"
        // },
        // POST_BLOCK: {
        //     "statusCode": config.CONSTANT.HTTP_STATUS_CODE.BAD_REQUEST,
        //     "message": "Post is block by admin.",
        //     "type": "POST_BLOCK"
        // },
        // POST_DELETED: {
        //     "statusCode": config.CONSTANT.HTTP_STATUS_CODE.BAD_REQUEST,
        //     "message": "Post is deleted by admin.",
        //     "type": "POST_DELETED"
        // },

    },
    SUCCESS: {
        // DEFAULT: {
        //     "statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
        //     "message": "SUCCESS",
        //     "type": "DEFAULT"
        // },
        COMMENT_LIST: (data) => {
            return {
                "statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
                "message": "Comment data are.",
                "type": "COMMENT_LIST",
                "data": data
            }
        },
        SUCCESSFULLY_ADDED: (data) => {
            return {
                "statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
                "message": "successfully added",
                "data": data,
                "type": "DEFAULT"
            }
        },

        SUBSCRIPTION_NONE: (data) => {
            return {
                "statusCode": config.CONSTANT.HTTP_STATUS_CODE.SUBSCRIPTION_EXPIRE_ERROR_CODE,
                "message": "please purchase subscription",
                "type": "SUBSCRIPTION_NONE",
                data: data
            }
        },
    },
};