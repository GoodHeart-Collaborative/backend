"use strict";

import { ServerRoute, Request, ResponseToolkit } from "hapi";
import * as Joi from "joi";

import { gratitudeJournalController } from "./GratitudeJournalController";
import * as appUtils from "@utils/appUtils";
import * as validator from "@utils/validator";
import * as gratitudeJournal from "./GratitudeJournalValidator";
import * as config from "@config/index";
import { responseHandler } from "@utils/ResponseHandler";

export const gratitudeJournalRoute: ServerRoute[] = [
    {
        method: "POST",
        path: `${config.SERVER.API_BASE_URL}/v1/users/gratitude-journal`,
        handler: async (request: Request, h: ResponseToolkit) => {
            const tokenData: TokenData = request.auth && request.auth.credentials && request.auth.credentials.tokenData;
            const payload: GratitudeJournalRequest.AddGratitudeJournalRequest = request.payload;
            try {
                payload["userId"] = tokenData.userId
                const result = await gratitudeJournalController.addGratitudeJournalData(payload);
                return responseHandler.sendSuccess(h, result);
            } catch (error) {
                return responseHandler.sendError(error);
            }
        },
        config: {
            tags: ["api", "gratitude"],
            description: "Add gratitude journal",
            auth: {
                strategies: ["UserAuth"]
            },
            validate: {
                headers: validator.userAuthorizationHeaderObj,
                payload: gratitudeJournal.validateAddGratitudeJournal,
                failAction: appUtils.failActionFunction
            },
            plugins: {
                "hapi-swagger": {
                    responseMessages: config.CONSTANT.SWAGGER_DEFAULT_RESPONSE_MESSAGES
                }
            }
        }
    },
    {
        method: "PUT",
        path: `${config.SERVER.API_BASE_URL}/v1/users/gratitude-journal/{Id}`,
        handler: async (request: Request, h: ResponseToolkit) => {
            const tokenData: TokenData = request.auth && request.auth.credentials && request.auth.credentials.tokenData;
            const Id: TokenData = request.params.Id;
            const payload: GratitudeJournalRequest.EditGratitudeJournalRequest = request.payload;
            try {
                payload["userId"] = tokenData.userId
                const result = await gratitudeJournalController.editGratitudeJournalData(payload, Id);
                return responseHandler.sendSuccess(h, result);
            } catch (error) {
                return responseHandler.sendError(error);
            }
        },
        config: {
            tags: ["api", "gratitude"],
            description: "Edit gratitude journal",
            auth: {
                strategies: ["UserAuth"]
            },
            validate: {
                headers: validator.userAuthorizationHeaderObj,
                params: {
                    Id: Joi.string().trim().regex(config.CONSTANT.REGEX.MONGO_ID).required()
                },
                payload: gratitudeJournal.validateEditGratitudeJournal,
                failAction: appUtils.failActionFunction
            },
            plugins: {
                "hapi-swagger": {
                    responseMessages: config.CONSTANT.SWAGGER_DEFAULT_RESPONSE_MESSAGES
                }
            }
        }
    },
    {
        method: "GET",
        path: `${config.SERVER.API_BASE_URL}/v1/users/gratitude-journal`,
        handler: async (request: Request, h: ResponseToolkit) => {
            const tokenData: TokenData = request.auth && request.auth.credentials && request.auth.credentials.tokenData.userData;
            const query: GratitudeJournalRequest.GetGratitudeJournalRequest = request.query;
            try {
                const result = await gratitudeJournalController.getGratitudeJournalData({ ...query }, { tokenData });
                return responseHandler.sendSuccess(h, result);
            } catch (error) {
                return responseHandler.sendError(error);
            }
        },
        config: {
            tags: ["api", "gratitude"],
            description: "get gratitude journal list",
            auth: {
                strategies: ["UserAuth"]
            },
            validate: {
                headers: validator.userAuthorizationHeaderObj,
                query: gratitudeJournal.validateUserGratitudeJournal,
                failAction: appUtils.failActionFunction
            },
            plugins: {
                "hapi-swagger": {
                    // payloadType: 'form',
                    responseMessages: config.CONSTANT.SWAGGER_DEFAULT_RESPONSE_MESSAGES
                }
            }
        }
    }
];