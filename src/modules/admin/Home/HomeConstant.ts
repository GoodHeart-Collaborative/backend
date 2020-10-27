"use strict";

import * as config from "@config/index";

export const MESSAGES = {
    ERROR: {
        EMAIL_ALREADY_EXIST: {
            "statusCode": config.CONSTANT.HTTP_STATUS_CODE.BAD_REQUEST,
            "message": "User with this email is already registered.",
            "type": "EMAIL_ALREADY_EXIST"
        },
        THUMBAIL_URL: {
            "statusCode": config.CONSTANT.HTTP_STATUS_CODE.BAD_REQUEST,
            "message": "thumbnailUrl is not allowed",
            "type": "THUMBAIL_URL"
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
        SUCCESSFULLY_ADDED: {
            "statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
            "message": "Successfully added",
            "type": "DEFAULT"
        },
        DAILY_SMILES: {
            "statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
            "message": "Daily smiles added successfully",
            "type": "DEFAULT"
        },
        INSPIRATION_ADDED: {
            "statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
            "message": "Inspiring women added successfully",
            "type": "DEFAULT"
        },
        DAILY_PEP_TALK: {
            "statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
            "message": "Daily pep talk added Successfully",
            "type": "DEFAULT"
        },
        BLOCKED: (data) => {
            return {
                "statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
                "message": `${data} blocked successfully`,
                "type": "DEFAULT"
            }
        },
        DELETED: (data) => {
            return {
                "statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
                "message": `${data} deleted successfully`,
                "type": "DEFAULT"
            }
        },
        ACTIVE: (data) => {
            return {
                "statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
                "message": `${data} active successfully`,
                "type": "DEFAULT"
            }
        },
        UPDATED_SUCCESSFULLY: (data) => {
            return {
                "statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
                "message": `${data} Updated Successfully`,
                "type": "DEFAULT"
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
    },
    OTP_TEXT: (otp) => {
        return `Your App code is " + ${otp} + ". " + "Welcome to the community!`
    },
};

