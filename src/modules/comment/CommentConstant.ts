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
        COMMENT_LIST:(data) => {
            return {
                "statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
                "message": "Comment data are.",
                "type": "COMMENT_LIST",
                "data": data
            }
        },
        SUCCESSFULLY_ADDED: {
            "statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
            "message": "successfully added",
            "type": "DEFAULT"
        },
        // SUCCESS_WITH_NO_DATA: {
        //     "statusCode": config.CONSTANT.HTTP_STATUS_CODE.NO_CONTENT,
        //     "message": "SUCCESS",
        //     "type": "DEFAULT"
        // },

        // DEFAULT_WITH_DATA: (data) => {
        //     return {
        //         "statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
        //         "message": "SUCCESS",
        //         "type": "DEFAULT",
        //         "data": data
        //     }
        // },

        // LOGOUT: {
        //     "statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
        //     "message": "Logout successfully.",
        //     "type": "LOGOUT"
        // },
        // HOME_DATA: (data) => {
        //     return {
        //         "statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
        //         "message": "Home data are.",
        //         "type": "HOME_DATA",
        //         "data": data
        //     };
        // },

        // BLOCK_USER: {
        //     "statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
        //     "message": "User account successfully blocked.",
        //     "type": "BLOCK_USER"
        // },
    },
    // OTP_TEXT: (otp) => {
    //     return `Your App code is " + ${otp} + ". " + "Welcome to the community!`
    // },
};

