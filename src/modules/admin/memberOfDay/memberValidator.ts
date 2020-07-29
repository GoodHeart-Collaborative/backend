"use strict";
import * as Joi from "joi";
import * as config from "@config/index";
import { join } from "path";

// when mediaType =1 then in mediaUrl key you will give image url

// when mediaType =2 then in mediaUrl you will give video url and in thumbnailUrl you will give video thumbnail image url

let memberById = Joi.object({
    Id: Joi.string().required()
}).unknown()

let membersList = Joi.object({
    limit: Joi.number(),
    page: Joi.number(),
    status: Joi.string().valid([
        config.CONSTANT.STATUS.ACTIVE,
        config.CONSTANT.STATUS.BLOCKED,
        config.CONSTANT.STATUS.DELETED,
    ]),
    fromDate: Joi.date(),
    toDate: Joi.date(),
    searchTerm: Joi.string().trim(),
    sortOrder: config.CONSTANT.ENUM.SORT_TYPE,
    sortBy: Joi.string().valid([
        'name', 'createdAt'
    ]),
}).unknown()

let addMember = Joi.object({
    userId: Joi.string(),
    memberCreatedAt: Joi.date()
}).unknown()


let updateHomeId = Joi.object({
    Id: Joi.string().required()
})

export {
    memberById,
    membersList,
    addMember,
    updateHomeId,

};