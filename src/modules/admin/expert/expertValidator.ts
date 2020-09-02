"use strict";
import * as Joi from "joi";
import * as config from "@config/index";


let validaExpertAdd = Joi.object({
    categoryId: Joi.array().items(Joi.string()),
    name: Joi.string().required(),
    email: Joi.string().email().trim().lowercase().required(),
    profession: Joi.string().required(),
    industry: Joi.number().valid([
        // config.INDUSTRIES.Compassion_Fatigue,
        // config.INDUSTRIES.Experts_in_Executive_Burnout,
        // config.INDUSTRIES.Licensed_Therapists_specializing_in_Vicarious_and_Secondary_Trauma,
        // config.INDUSTRIES.Nonprofit_Resiliency_Coaches,
        // config.INDUSTRIES.Wellness_Coaches,
        // config.INDUSTRIES.Emergency_Services,
        // config.INDUSTRIES.Healthcare_And_Community_Medical_Services,
        // config.INDUSTRIES.Law_Enforcement,
        // config.INDUSTRIES.Nonprofit,
        // config.INDUSTRIES.Social_And_Community_Services,
        config.INDUSTRIES.NONPROFIT,
        config.INDUSTRIES.EMERGENCY_SERVICES,
        config.INDUSTRIES.SOCIAL_AND_COMMUNITY_SERVICES,
        config.INDUSTRIES.LAW_ENFORCEMENT,
        config.INDUSTRIES.HEALTHCARE_AND_COMMUNITY_MEDICAL_SERVICES
    ]).required(),
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
    email: Joi.string().email(),
    profession: Joi.string().required(),
    industry: Joi.number().valid([
        // config.INDUSTRIES.Compassion_Fatigue,
        // config.INDUSTRIES.Experts_in_Executive_Burnout,
        // config.INDUSTRIES.Licensed_Therapists_specializing_in_Vicarious_and_Secondary_Trauma,
        // config.INDUSTRIES.Nonprofit_Resiliency_Coaches,
        // config.INDUSTRIES.Wellness_Coaches,
        // config.INDUSTRIES.Emergency_Services,
        // config.INDUSTRIES.Healthcare_And_Community_Medical_Services,
        // config.INDUSTRIES.Law_Enforcement,
        // config.INDUSTRIES.Nonprofit,
        // config.INDUSTRIES.Social_And_Community_Services,
        config.INDUSTRIES.NONPROFIT,
        config.INDUSTRIES.EMERGENCY_SERVICES,
        config.INDUSTRIES.SOCIAL_AND_COMMUNITY_SERVICES,
        config.INDUSTRIES.LAW_ENFORCEMENT,
        config.INDUSTRIES.HEALTHCARE_AND_COMMUNITY_MEDICAL_SERVICES
    ]).required(),
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