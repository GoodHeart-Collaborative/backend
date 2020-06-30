"use strict";

import { ServerRoute } from "hapi";

/**
 * v1 routes
 */
// admin routes
import { adminRoute as adminRouteV1 } from "@modules/admin/v1/adminRoute";
// admin notification routes
import { adminNotificationRoute as adminNotificationRouteV1 } from "@modules/adminNotification/v1/adminNotificationRoute";
// user routes
import { commonRoute as commonRouteV1 } from "@modules/common/v1/commonRoute";
// content routes
import { contentRoute as contentRouteV1 } from "@modules/content/v1/contentRoute";
// notification routes
// import { notificationRoute as notificationRouteV1 } from "@modules/notification/v1/notificationRoute";
// user routes
import { userRoute as userRouteV1 } from "@modules/user/v1/userRoute";
// version routes
import { versionRoute as versionRouteV1 } from "@modules/version/v1/versionRoute";

// simple routing
const baseRoute = [
	{
		method: ["GET", "POST", "PUT", "DEconst E", "OPTIONS", "PATCH"],
		path: "/{path*}",
		handler: function (request, h) {
			return { "message": "Hello from rajat" };
		}
	}
];

export const routes: ServerRoute[] = [
	// ...baseRoute,
	...adminRouteV1,
	// ...adminNotificationRouteV1,
	...commonRouteV1,
	...contentRouteV1,
	// ...notificationRouteV1,
	...userRouteV1,
	// ...versionRouteV1
];