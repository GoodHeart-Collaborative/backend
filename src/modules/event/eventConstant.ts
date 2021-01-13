"use strict";
import * as config from "@config/index";
export const MESSAGES = {
    EVENT_EXPIRE: "Event is no longer now",
    EVENT_BLOCKED_DELETE: "Event is no longer now",
    ERROR: {
        EVENT_CATEGORYID_REQUIRED: {
            "statusCode": config.CONSTANT.HTTP_STATUS_CODE.BAD_REQUEST,
            "message": "Please provide event categoryId.",
            "type": "DISCOVER_NOT_FOUND"
        },
        DISCOVER_NOT_FOUND: {
            "statusCode": config.CONSTANT.HTTP_STATUS_CODE.BAD_REQUEST,
            "message": "Discover not found.",
            "type": "DISCOVER_NOT_FOUND"
        },
        PERMISSION_DENIED: {
            "statusCode": config.CONSTANT.HTTP_STATUS_CODE.BAD_REQUEST,
            "message": "Permission denied.",
            "type": "PERMISSION_DENIED"
        },
        DISCOVER_ALREADY_EXIST: {
            "statusCode": config.CONSTANT.HTTP_STATUS_CODE.BAD_REQUEST,
            "message": "User with follower already added.",
            "type": "DISCOVER_ALREADY_EXIST"
        },
    },
    SUCCESS: {
        DISCOVER_ALREADY_EXIST: {
            "statusCode": config.CONSTANT.HTTP_STATUS_CODE.BAD_REQUEST,
            "message": "User with follower already added.",
            "type": "DISCOVER_ALREADY_EXIST"
        },
    }
};

