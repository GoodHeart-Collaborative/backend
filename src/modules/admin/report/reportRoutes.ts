"use strict";

import { ServerRoute, Request, ResponseToolkit } from "hapi";
import { adminReportController } from "@modules/admin/report/reportController";
import * as appUtils from "@utils/appUtils";
import * as validator from "@utils/validator";
import * as config from "@config/index";
import { responseHandler } from "@utils/ResponseHandler";
import * as adminReportValidator from './reportValidator';

export const AdminReportRoutes: ServerRoute[] = [
    {
        method: "GET",
        path: `${config.SERVER.API_BASE_URL}/v1/admin/report`,
        handler: async (request: Request, h: ResponseToolkit) => {
            const payload = request.query;
            try {
                appUtils.consolelog("This request is on", `${request.path}with parameters ${JSON.stringify(payload)}`, true);
                const result = await adminReportController.getReports(payload);
                return responseHandler.sendSuccess(h, result);
            } catch (error) {
                return responseHandler.sendError(error);
            }
        },
        config: {
            tags: ["api", "reports"],
            description: "GET Reports",
            auth: {
                strategies: ["AdminAuth"]
            },
            validate: {
                headers: validator.adminAuthorizationHeaderObj,
                query: adminReportValidator.getReports,
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



