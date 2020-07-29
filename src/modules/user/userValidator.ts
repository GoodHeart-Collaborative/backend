"use strict";
import * as Joi from "joi";
import * as config from "@config/index";


let signUp = Joi.object({
    firstName: Joi.string()
        .trim()
        .min(config.CONSTANT.VALIDATION_CRITERIA.FIRST_NAME_MIN_LENGTH)
        .max(config.CONSTANT.VALIDATION_CRITERIA.FIRST_NAME_MAX_LENGTH)
        .required(),
    lastName: Joi.string()
        .trim()
        .min(config.CONSTANT.VALIDATION_CRITERIA.LAST_NAME_MIN_LENGTH)
        .max(config.CONSTANT.VALIDATION_CRITERIA.LAST_NAME_MAX_LENGTH)
        .optional(),
    email: Joi.string()
        .trim()
        .lowercase()
        .email()
        .optional(),
    countryCode: Joi.string()
        .trim()
        .regex(config.CONSTANT.REGEX.COUNTRY_CODE)
        .min(config.CONSTANT.VALIDATION_CRITERIA.COUNTRY_CODE_MIN_LENGTH)
        .max(config.CONSTANT.VALIDATION_CRITERIA.COUNTRY_CODE_MAX_LENGTH)
        .optional(),
    mobileNo: Joi.string()
        .trim()
        .regex(config.CONSTANT.REGEX.MOBILE_NUMBER)
        .optional(),
    password: Joi.string()
        .trim()
        // .regex(config.CONSTANT.REGEX.PASSWORD)
        .min(config.CONSTANT.VALIDATION_CRITERIA.PASSWORD_MIN_LENGTH)
        .max(config.CONSTANT.VALIDATION_CRITERIA.PASSWORD_MAX_LENGTH)
        .default(config.CONSTANT.DEFAULT_PASSWORD)
        .required(),
    // type: Joi.string().allow('mobile', 'email').default('mobile'),
    deviceId: Joi.string().trim().required(),
    deviceToken: Joi.string().trim().required(),
    profilePicUrl: Joi.array().items(Joi.string()),
    gender: Joi.string()
        .trim()
        .optional()
        .valid([
            config.CONSTANT.GENDER.FEMALE,
            config.CONSTANT.GENDER.MALE,
        ]),

}).unknown()

let login = Joi.object({
    email: Joi.string().trim().lowercase().email().optional(),
    countryCode: Joi.string().trim()
        .regex(config.CONSTANT.REGEX.COUNTRY_CODE)
        .min(config.CONSTANT.VALIDATION_CRITERIA.COUNTRY_CODE_MIN_LENGTH)
        .max(config.CONSTANT.VALIDATION_CRITERIA.COUNTRY_CODE_MAX_LENGTH)
        .optional(),
    mobileNo: Joi.string().trim().regex(config.CONSTANT.REGEX.MOBILE_NUMBER).optional(),
    password: Joi.string().trim()
        // .regex(config.CONSTANT.REGEX.PASSWORD)
        // .min(config.CONSTANT.VALIDATION_CRITERIA.PASSWORD_MIN_LENGTH)
        .max(config.CONSTANT.VALIDATION_CRITERIA.PASSWORD_MAX_LENGTH)
        // .default(config.CONSTANT.DEFAULT_PASSWORD)
        .required(),
    deviceId: Joi.string().trim().required(),
    deviceToken: Joi.string().trim().required()
})

let resendOTP = Joi.object({
    countryCode: Joi.string().trim()
        .regex(config.CONSTANT.REGEX.COUNTRY_CODE)
        .min(config.CONSTANT.VALIDATION_CRITERIA.COUNTRY_CODE_MIN_LENGTH)
        .max(config.CONSTANT.VALIDATION_CRITERIA.COUNTRY_CODE_MAX_LENGTH)
        .required(),
    mobileNo: Joi.string().trim().regex(config.CONSTANT.REGEX.MOBILE_NUMBER).required(),
    // email: Joi.string().lowercase().trim(),
});

let verifyForGotOtp = Joi.object({
    mobileNo: Joi.string(),
    countryCode: Joi.string().trim()
        .regex(config.CONSTANT.REGEX.COUNTRY_CODE)
        .min(config.CONSTANT.VALIDATION_CRITERIA.COUNTRY_CODE_MIN_LENGTH)
        .max(config.CONSTANT.VALIDATION_CRITERIA.COUNTRY_CODE_MAX_LENGTH)
        .optional(),
    otp: Joi.string(),
    deviceId: Joi.string()
    // email: Joi.string().lowercase().trim().optional(),
    // type: Joi.string().valid('email', 'mobile').default('mobile'),
})

let socialLogin = Joi.object({
    socialLoginType: Joi.string()
        .trim()
        .lowercase()
        .required()
        .valid([
            config.CONSTANT.SOCIAL_LOGIN_TYPE.FACEBOOK,
            config.CONSTANT.SOCIAL_LOGIN_TYPE.GOOGLE,
            config.CONSTANT.SOCIAL_LOGIN_TYPE.APPLE,
        ]),
    socialId: Joi.string().trim().required(),
    deviceId: Joi.string().trim().required(),
    deviceToken: Joi.string().trim().required()
})


let socialSignUp = Joi.object({
    socialLoginType: Joi.string()
        .trim()
        .lowercase()
        .required()
        .valid([
            config.CONSTANT.SOCIAL_LOGIN_TYPE.FACEBOOK,
            config.CONSTANT.SOCIAL_LOGIN_TYPE.GOOGLE,
            config.CONSTANT.SOCIAL_LOGIN_TYPE.APPLE,
        ]),
    socialId: Joi.string().trim().required(),
    firstName: Joi.string()
        .trim()
        .min(config.CONSTANT.VALIDATION_CRITERIA.FIRST_NAME_MIN_LENGTH)
        .max(config.CONSTANT.VALIDATION_CRITERIA.FIRST_NAME_MAX_LENGTH)
        .required(),
    lastName: Joi.string()
        .trim()
        .min(config.CONSTANT.VALIDATION_CRITERIA.LAST_NAME_MIN_LENGTH)
        .max(config.CONSTANT.VALIDATION_CRITERIA.LAST_NAME_MAX_LENGTH)
        .optional(),
    email: Joi.string()
        .trim()
        .lowercase({ force: true })
        .email({ minDomainAtoms: 2 })
        .regex(config.CONSTANT.REGEX.EMAIL)
        .optional(),
    countryCode: Joi.string()
        .trim()
        .regex(config.CONSTANT.REGEX.COUNTRY_CODE)
        .min(config.CONSTANT.VALIDATION_CRITERIA.COUNTRY_CODE_MIN_LENGTH)
        .max(config.CONSTANT.VALIDATION_CRITERIA.COUNTRY_CODE_MAX_LENGTH)
        .optional(),
    mobileNo: Joi.string()
        .trim()
        .regex(config.CONSTANT.REGEX.MOBILE_NUMBER)
        .optional(),
    // dob: Joi.number().optional(),
    gender: Joi.string()
        .trim()
        .optional()
        .valid([
            config.CONSTANT.GENDER.FEMALE,
            config.CONSTANT.GENDER.MALE,
        ]),
    isEmailVerified: Joi.boolean().default(true),
    profilePicUrl: Joi.array().items(Joi.string()),
    deviceId: Joi.string().trim().required(),
    deviceToken: Joi.string().trim().required()
})

let verifyOtp = Joi.object({
    otp: Joi.string().required(),
    type: Joi.string().valid('email', 'mobile').default('mobile'),
})


let forGotPassword = Joi.object({
    email: Joi.string()
        .trim()
        .lowercase()
        .email()
        .optional(),
    countryCode: Joi.string()
        .trim()
        .regex(config.CONSTANT.REGEX.COUNTRY_CODE)
        .min(config.CONSTANT.VALIDATION_CRITERIA.COUNTRY_CODE_MIN_LENGTH)
        .max(config.CONSTANT.VALIDATION_CRITERIA.COUNTRY_CODE_MAX_LENGTH)
        .optional(),
    mobileNo: Joi.string()
        .trim()
        .regex(config.CONSTANT.REGEX.MOBILE_NUMBER)
        .optional(),
})

let resetPassword = Joi.object({
    token: Joi.string().required(),
    password: Joi.string()
        .trim()
        // .regex(config.CONSTANT.REGEX.PASSWORD)
        .min(config.CONSTANT.VALIDATION_CRITERIA.PASSWORD_MIN_LENGTH)
        .max(config.CONSTANT.VALIDATION_CRITERIA.PASSWORD_MAX_LENGTH)
        .default(config.CONSTANT.DEFAULT_PASSWORD)
        .required(),
    // countryCode: Joi.string(),
    // mobileNo: Joi.string(),
    type: Joi.string().valid(['mobile', 'email']).required()
    // deviceId: Joi.string(),
    // deviceToken: Joi.string()
})

let updateProfile = Joi.object({
    dob: Joi.string(),
    profession: Joi.string().valid([
        config.CONSTANT.PROFESSION_TYPE.CEO,
        config.CONSTANT.PROFESSION_TYPE.Executive_Director,
        config.CONSTANT.PROFESSION_TYPE.Founder,
        config.CONSTANT.PROFESSION_TYPE.Managing_Director,
    ]),
    // userName: Joi.string(),
    industryType: Joi.string().valid([
        config.INDUSTRIES.Emergency_Services,
        config.INDUSTRIES.Healthcare_And_Community_Medical_Services,
        config.INDUSTRIES.Law_Enforcement,
        config.INDUSTRIES.Nonprofit,
        config.INDUSTRIES.Social_And_Community_Services
        // config.INDUSTRIES.Compassion_Fatigue,
        // config.INDUSTRIES.Experts_in_Executive_Burnout,
        // config.INDUSTRIES.Licensed_Therapists_specializing_in_Vicarious_and_Secondary_Trauma,
        // config.INDUSTRIES.Nonprofit_Resiliency_Coaches,
        // config.INDUSTRIES.Wellness_Coaches,
    ]),
    experience: Joi.string().valid([
        'Junior', 'Mid', 'Senior',
    ]),
    about: Joi.string().allow('')
})
let validateProfileHome = Joi.object({
    type: Joi.number().valid([
        config.CONSTANT.USER_PROFILE_TYPE.GRATITUDE_JOURNAL,
        config.CONSTANT.USER_PROFILE_TYPE.POST,
        config.CONSTANT.USER_PROFILE_TYPE.DISCOVER
    ]).description("1-gratitude,  2-post, 3-discover").default(config.CONSTANT.USER_PROFILE_TYPE.GRATITUDE_JOURNAL),
    page: Joi.number().required(),
    limit: Joi.number().required()
})

let validateUserIdParams = Joi.object({
    userId: Joi.string().trim().regex(config.CONSTANT.REGEX.MONGO_ID).required(),
}).unknown()
export {
    signUp,
    login,
    resendOTP,
    verifyForGotOtp,
    socialLogin,
    socialSignUp,
    verifyOtp,
    forGotPassword,
    resetPassword,
    updateProfile,
    validateUserIdParams,
    validateProfileHome
};