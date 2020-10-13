"use strict";
import * as Joi from "joi";
import * as config from "@config/index";

let addEventInterest = Joi.object({
    eventId: Joi.string().required(),
    type: Joi.number().allow([
        config.CONSTANT.EVENT_INTEREST.GOING,
        config.CONSTANT.EVENT_INTEREST.INTEREST,
    ]),
}).unknown()

let getUserGoingAndInterest = Joi.object({
    limit: Joi.number(),
    page: Joi.number(),
    eventId: Joi.string().required(),
    type: Joi.number().allow([
        // 'myInterest', 'myEvent',
        config.CONSTANT.EVENT_INTEREST.INTEREST,
        config.CONSTANT.EVENT_INTEREST.GOING,
    ]).description(
        'INTEREST- 2, GOING- 1'
    ),
})

export {
    addEventInterest,
    getUserGoingAndInterest
};