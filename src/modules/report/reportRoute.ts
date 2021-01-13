"use strict";

import { ServerRoute, Request, ResponseToolkit } from "hapi";

import { reportController } from "./reportController";
import * as appUtils from "@utils/appUtils";
import * as validator from "@utils/validator";
import * as reportValidator from "./reportValidator";
import * as config from "@config/index";
import { responseHandler } from "@utils/ResponseHandler";

export const ReportRoute: ServerRoute[] = [
    {
        method: "POST",
        path: `${config.SERVER.API_BASE_URL}/v1/users/report`,
        handler: async (request: Request, h: ResponseToolkit) => {
            const tokenData: TokenData = request.auth && request.auth.credentials && request.auth.credentials.tokenData.userData;
            const payload: UserReportRequest.Addreport = request.payload;
            try {
                const result = await reportController.addReport({ ...payload, ...{ userId: tokenData.userId } });
                return responseHandler.sendSuccess(h, result);
            } catch (error) {
                return responseHandler.sendError(error);
            }
        },
        config: {
            tags: ["api", "report"],
            description: "add like",
            auth: {
                strategies: ["UserAuth"]
            },
            validate: {
                headers: validator.userAuthorizationHeaderObj,
                payload: reportValidator.addReport,
                failAction: appUtils.failActionFunction
            },
            plugins: {
                "hapi-swagger": {
                    responseMessages: config.CONSTANT.SWAGGER_DEFAULT_RESPONSE_MESSAGES
                }
            }
        }
    },

];