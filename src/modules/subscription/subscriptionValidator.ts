"use strict";
import * as Joi from "joi";
import * as config from "@config/index";

let addSubscription = Joi.object({
    receiptToken: Joi.string().trim().required(),
    subscriptionType: Joi.number().required(),
    deviceId: Joi.string().trim().required()
}).unknown();

export {
    addSubscription,
};