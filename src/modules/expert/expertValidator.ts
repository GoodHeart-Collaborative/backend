"use strict";
import * as Joi from "joi";
import * as config from "@config/index";

let validateExperts = Joi.object({
    limit: Joi.number().required(),
    pageNo: Joi.number().required()

}).unknown()

export {
    validateExperts
};