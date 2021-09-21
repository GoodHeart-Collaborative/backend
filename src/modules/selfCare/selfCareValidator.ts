"use strict";
import * as Joi from "joi";
import * as config from "@config/index";

let validateAddSelfCare = Joi.object({

    // userId: Joi.string().trim().regex(config.CONSTANT.REGEX.MONGO_ID).required(),
    reminderTime: Joi.number().required(),
    isDaily: Joi.boolean().required(),
    affirmationText: Joi.string().required(),
    category: Joi.object().keys({
        // type: Joi.string().required().valid(["Point"]),
        // coordinates: Joi.array().items(Joi.number())

        _id: Joi.string().trim().regex(config.CONSTANT.REGEX.MONGO_ID),
        name: Joi.string(),
        imageUrl: Joi.string(),
    }),
    isNotificationAllow: Joi.boolean()

}).unknown()

let selfCareList = Joi.object({
    pageNo: Joi.number().required(),
    limit: Joi.number().required(),
    categoryId: Joi.string()
}).unknown()

export {
    validateAddSelfCare,
    selfCareList
};