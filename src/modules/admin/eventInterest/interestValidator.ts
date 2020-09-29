"use strict";
import * as Joi from "joi";
import * as config from "../../../config/index";


let GetInterestUser = Joi.object({
    limit: Joi.number(),
    page: Joi.number(),
    eventId: Joi.string().required(),
    type: Joi.number().required().allow([
        config.CONSTANT.EVENT_INTEREST.GOING,
        config.CONSTANT.EVENT_INTEREST.INTEREST
    ]),
}).unknown();

export {
    GetInterestUser,
};