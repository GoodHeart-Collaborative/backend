"use strict";
import * as Joi from "joi";
import * as config from "@config/index";

let addSubscription = Joi.object({
    receiptToken: Joi.string().trim().required(),
    deviceType: Joi.number().valid(config.CONSTANT.DEVICE_TYPE.ANDROID, config.CONSTANT.DEVICE_TYPE.IOS).required(),
    subscriptionType: Joi.number().required(),
    planName: Joi.string().required(),
    deviceId: Joi.string().trim().required()

}).unknown();

export {
    addSubscription,
};