"use strict";
import * as Joi from "joi";
import * as config from "@config/index";


let validateUserHome = Joi.object({
    endDate: Joi.string().allow("").optional(),
    // postAt: Joi.string().allow("").optional(),
    type: Joi.number().valid([
        config.CONSTANT.HOME_TYPE.GENERAL_GRATITUDE
    ]).description("4-general gratitude").optional()
}).unknown()

export {
    validateUserHome
};