"use strict";
import * as config from "@config/index";
export const MESSAGES = {
    ERROR: {
    },
    SUCCESS: {
        SUCCESSFULLY_ADDED:(data)=> {
            return {
                "statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
                "message": "Shoutout added successfully",
                "type": "SUCCESSFULLY_ADDED",
                "data" : data
            }
        },
        SHOUTOUT_DATA: (data) => {
            return {
                "statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
                "message": "Shoutout data are.",
                "type": "SHOUTOUT_DATA",
                "data": data
            };
        }
    },
};

