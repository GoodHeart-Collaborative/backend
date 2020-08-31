"use strict";
import * as Joi from "joi";
import * as config from "@config/index";

let addEventInterest = Joi.object({
    eventId: Joi.string().required(),
    type: Joi.number().allow([
        // config.CONSTANT.EVENT_INTEREST.GOING,
        config.CONSTANT.EVENT_INTEREST.INTEREST,
    ]),
}).unknown()

export {
    addEventInterest
};