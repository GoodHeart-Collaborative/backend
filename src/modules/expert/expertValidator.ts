"use strict";
import * as Joi from "joi";
import * as config from "@config/index";

let validateExperts = Joi.object({
    limit: Joi.number().required(),
    pageNo: Joi.number().required()

}).unknown()


let getCategorList = Joi.object({
    limit: Joi.number(),
    page: Joi.number(),
    searchTerm: Joi.string(),
    screenType: Joi.string().allow(['addPost', 'forum', 'expert', 'event']),
    type: Joi.number().allow([
        config.CONSTANT.CATEGORY_TYPE.EVENT_CAEGORY,
        config.CONSTANT.CATEGORY_TYPE.OTHER_CATEGORY,
    ]).required(),
    longitude: Joi.number().optional(),
    latitude: Joi.number().optional(),
    distance: Joi.number().default(40)
}).unknown();


let categoryRelatedExperts = Joi.object({
    limit: Joi.number(),
    page: Joi.number(),
    searchTerm: Joi.string(),
    categoryId: Joi.string().trim().regex(config.CONSTANT.REGEX.MONGO_ID), //.required(),
    posted: Joi.number().allow([
        config.CONSTANT.DATE_FILTER.LAST_MONTH,
        config.CONSTANT.DATE_FILTER.LAST_WEEK
    ]).description('1-lastWeek, 2-lastMonth'),
    contentType: Joi.string().description('1-image ,2- video ,3- article')
})

let getExpertDetail = Joi.object({
    limit: Joi.number(),
    page: Joi.number(),
    expertId: Joi.string().trim().required().regex(config.CONSTANT.REGEX.MONGO_ID),
    posted: Joi.number().allow([
        config.CONSTANT.DATE_FILTER.LAST_MONTH,
        config.CONSTANT.DATE_FILTER.LAST_WEEK
    ]).description('1-lastWeek, 2-lastMonth'),
    contentType: Joi.string().description('1-image ,2- video ,3- article')
}).unknown();

let expertDetailAndPosts = Joi.object({
    limit: Joi.number(),
    page: Joi.number(),
    expertId: Joi.string().trim().required().regex(config.CONSTANT.REGEX.MONGO_ID),
    posted: Joi.number().allow([
        config.CONSTANT.DATE_FILTER.LAST_MONTH,
        config.CONSTANT.DATE_FILTER.LAST_WEEK
    ]).description('1-lastWeek, 2-lastMonth'),
    contentType: Joi.string().description('1-image ,2- video ,3- article')
})

let postId = Joi.object({
    postId: Joi.string().regex(config.CONSTANT.REGEX.MONGO_ID).required()
});

let expertSearch = Joi.object({
    searchKey: Joi.string(),
    limit: Joi.number(),
    pageNo: Joi.number()
})

export {
    validateExperts,
    getCategorList,
    categoryRelatedExperts,
    expertDetailAndPosts,
    postId,
    expertSearch
};