"use strict";
import * as Joi from "joi";
import * as config from "@config/index";


let validaExpertAdd = Joi.object({
    categoryId: Joi.array().items(Joi.string()),
    name: Joi.string().required(),
    email: Joi.string().email().trim().lowercase().required(),
    profession: Joi.string().valid([
        config.PROFESSION_TYPE.CEO,
        config.PROFESSION_TYPE.Founder,
        config.PROFESSION_TYPE.Consultant,
        config.PROFESSION_TYPE.Director,
        config.PROFESSION_TYPE.Executive_Director,
        config.PROFESSION_TYPE.Licensed_Counselor,
        config.PROFESSION_TYPE.Managing_Director,
        config.PROFESSION_TYPE.Professional_Coach,
        config.PROFESSION_TYPE.Professional_Trainer,
        config.PROFESSION_TYPE.Professor
    ]).required(),
    industry: Joi.string().required(),
    //  Joi.number().valid([
    //     config.INDUSTRIES.NONPROFIT,
    //     config.INDUSTRIES.EMERGENCY_SERVICES,
    //     config.INDUSTRIES.SOCIAL_AND_COMMUNITY_SERVICES,
    //     config.INDUSTRIES.LAW_ENFORCEMENT,
    //     config.INDUSTRIES.HEALTHCARE_AND_COMMUNITY_MEDICAL_SERVICES
    // ]).required(),
    bio: Joi.string().required(),
    experience: Joi.string().valid([
        'Junior', 'Mid', 'Senior',
    ]).required(),
    profilePicUrl: Joi.array().items(Joi.string()),
}).unknown()


let validateGetExpert = Joi.object({
    limit: Joi.number(),
    page: Joi.number(),
    searchTerm: Joi.string(),
    fromDate: Joi.date(),
    toDate: Joi.date(),
    sortBy: Joi.string().valid([
        'name', 'createdAt'
    ]),
    sortOrder: Joi.number().valid([
        config.CONSTANT.ENUM.SORT_TYPE
    ]),
    status: Joi.string().valid([
        config.CONSTANT.STATUS.ACTIVE,
        config.CONSTANT.STATUS.BLOCKED,
        config.CONSTANT.STATUS.DELETED,
    ]),
    categoryId: Joi.string().trim()

}).unknown()


let validateExpertId = Joi.object({
    expertId: Joi.string().required()
}).unknown()


let updateExpert = Joi.object({
    categoryId: Joi.array().items(Joi.string()).required(),
    name: Joi.string().required(),
    // email: Joi.string().email().lowercase(),
    // profession: Joi.string().required(),
    profession: Joi.string().valid([
        config.PROFESSION_TYPE.CEO,
        config.PROFESSION_TYPE.Founder,
        config.PROFESSION_TYPE.Consultant,
        config.PROFESSION_TYPE.Director,
        config.PROFESSION_TYPE.Executive_Director,
        config.PROFESSION_TYPE.Licensed_Counselor,
        config.PROFESSION_TYPE.Managing_Director,
        config.PROFESSION_TYPE.Professional_Coach,
        config.PROFESSION_TYPE.Professional_Trainer,
        config.PROFESSION_TYPE.Professor
    ]).required(),
    // industry: Joi.number().valid([
    //     config.INDUSTRIES.NONPROFIT,
    //     config.INDUSTRIES.EMERGENCY_SERVICES,
    //     config.INDUSTRIES.SOCIAL_AND_COMMUNITY_SERVICES,
    //     config.INDUSTRIES.LAW_ENFORCEMENT,
    //     config.INDUSTRIES.HEALTHCARE_AND_COMMUNITY_MEDICAL_SERVICES
    // ]).required(),
    industry: Joi.string().required(),
    bio: Joi.string().required(),
    experience: Joi.string().valid([
        'Junior', 'Mid', 'Senior',
    ]).required(),
    profilePicUrl: Joi.array().items(Joi.string()),
})

let updateStatus = Joi.object({
    expertId: Joi.string().required(),
    status: Joi.string().valid([
        config.CONSTANT.STATUS.ACTIVE,
        config.CONSTANT.STATUS.BLOCKED,
        config.CONSTANT.STATUS.DELETED,
    ]).required()
})

export {
    validaExpertAdd,
    validateGetExpert,
    validateExpertId,
    updateExpert,
    updateStatus
};