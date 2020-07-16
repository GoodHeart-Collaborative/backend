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
    otp: Joi.number().min(1000).max(9999).required(),
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

export {
    signUp,
    login,
    resendOTP,
    verifyForGotOtp,
    socialLogin,
    socialSignUp
};