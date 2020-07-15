"use strict";
import * as config from "@config/index";

export const MESSAGES = {
    ERROR: {
        ALREADY_LIKE: {
            "statusCode": config.CONSTANT.HTTP_STATUS_CODE.BAD_REQUEST,
            "message": "Already like.",
            "type": "ALREADY_LIKE"
        },
    },
    SUCCESS: {
        // DEFAULT: {
        //     "statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
        //     "message": "SUCCESS",
        //     "type": "DEFAULT"
        // },
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

