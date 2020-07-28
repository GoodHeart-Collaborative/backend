"use strict";
import * as Joi from "joi";
import * as config from "@config/index";


let validaExpertAdd = Joi.object({
    categoryId: Joi.array().items(Joi.string()),
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    profession: Joi.string().required(),
    industry: Joi.string().valid([
        config.INDUSTRIES.Compassion_Fatigue,
        config.INDUSTRIES.Experts_in_Executive_Burnout,
        config.INDUSTRIES.Licensed_Therapists_specializing_in_Vicarious_and_Secondary_Trauma,
        config.INDUSTRIES.Nonprofit_Resiliency_Coaches,
        config.INDUSTRIES.Wellness_Coaches,
    ]).required(),
    bio: Joi.string().required(),
    experience: Joi.string().valid([
        'Junior', 'Mid', 'Senior',
    ]).required(),
    profilePicUrl: Joi.array().items(Joi.string()),
}).unknown()


let validategetGratituById = Joi.object({
    Id: Joi.string().required(), // 
}).unknown()


let GetGratitude = Joi.object({
    limit: Joi.number(),
    page: Joi.number(),
    status: Joi.string().valid([
        config.CONSTANT.STATUS.ACTIVE,
        config.CONSTANT.STATUS.BLOCKED,
        config.CONSTANT.STATUS.DELETED,
    ]),
    sortOrder: config.CONSTANT.ENUM.SORT_TYPE,
    sortBy: Joi.string().valid([
        'createdAt', 'title'
    ]),
    userId: Joi.string().required(),
    fromDate: Joi.date(),
    toDate: Joi.date(),
    searchTerm: Joi.string(),
}).unknown()


let gratitudestatus = Joi.object({
    Id: Joi.string().required(),
    status: Joi.string().valid([
        config.CONSTANT.STATUS.ACTIVE,
        config.CONSTANT.STATUS.DELETED,
        config.CONSTANT.STATUS.BLOCKED
    ])
}).unknown()

let updateGratitude = Joi.object({
    status: Joi.string().valid([
        config.CONSTANT.STATUS.ACTIVE,
        config.CONSTANT.STATUS.DELETED,
        // config.CONSTANT.STATUS.BLOCKED
    ]),
    title: Joi.string().required(),
    description: Joi.string().required(),
    imageUrl: Joi.string(),
    isPostLater: Joi.boolean().default(false),
    postedAt: Joi.date(),
}).unknown()

export {
    validaExpertAdd,
    validategetGratituById,
    GetGratitude,
    gratitudestatus,
    updateGratitude
};