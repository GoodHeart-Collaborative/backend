"use strict";
import * as config from "@config/index";
export const MESSAGES = {
    ERROR: {
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
        SUCCESSFULLY_ADDED: (data) => {
            return {
                "statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
                "message": "follow successfully",
                "type": "SUCCESSFULLY_ADDED",
                "data": data
            }
        },
        SUCCESSFULLY_REMOVE: (data) => {
            return {
                "statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
                "message": "unfollow successfully",
                "type": "SUCCESSFULLY_REMOVE",
                "data": data
            }
        },
        DISCOVER_DATA: (data) => {
            return {
                "statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
                "message": "Discover data are.",
                "type": "DISCOVER_DATA",
                "data": data
            };
        },
        DISCOVER_DATA_NO_USER: (data) => {
            return {
                "statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
                "message": "No user found",
                "type": "DISCOVER_DATA",
                "data": data
            };
        },
        DISCOVER_DATA_UPDATED: (data) => {
            return {
                "statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
                "message": "Discover data updated successfully.",
                "type": "DISCOVER_DATA_UPDATED",
                "data": data
            };
        }
    },
};

