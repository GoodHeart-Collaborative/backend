"use strict";
import * as Joi from "joi";
import * as config from "@config/index";


let validateUserHome = Joi.object({
    endDate: Joi.string().allow("").optional(),
    // postAt: Joi.string().allow("").optional(),
    type: Joi.number().valid([
        config.CONSTANT.HOME_TYPE.UNICORN,
        config.CONSTANT.HOME_TYPE.INSPIRATION,
        config.CONSTANT.HOME_TYPE.DAILY_ADVICE,
        config.CONSTANT.HOME_TYPE.GENERAL_GRATITUDE
    ]).description("1-unicorn, 2-inspiration, 3-daily advice, 4-general gratitude").optional()
}).unknown()

export {
    validateUserHome
};