"use strict";

import { ServerRoute } from "hapi";

/**
 * v1 routes
 */
// admin routes
import { adminRoute as adminRouteV1 } from "@modules/admin/adminRoute";

// admin notification routes
import { adminNotificationRoute as adminNotificationRouteV1 } from "@modules/adminNotification/v1/adminNotificationRoute";
// user routes
import { commonRoute as commonRouteV1 } from "@modules/common/commonRoute";
// content routes
import { contentRoute as contentRouteV1 } from "@modules/content/v1/contentRoute";
// notification routes
// import { notificationRoute as notificationRouteV1 } from "@modules/notification/v1/notificationRoute";
// user routes
import { userRoute as userRouteV1 } from "@modules/user/userRoute";
import { homeRoute as HomeRoute } from "@modules/home/HomeRoute";

// version routes
import { versionRoute as versionRouteV1 } from "@modules/version/versionRoute";

import { categoryRoute as categoryRouteV1 } from '@modules/admin/catgeory/categoryRoute';
import { postRoute as postRouteV1 } from "@modules/post/ v1/PostRoute";
// import { inspirationRoute as inspirationRouteV1 } from "@modules/admin/dailyInspiration/v1/inspirationRoute";

// import { unicornRoute as unicornRouteV1 } from "@modules/admin/unicornHumour/v1/UnicornRoute";

// import { adviceROute as adviceROuteV1 } from '@modules/admin/dailyAdvice/v1/AdviceRoute';
import { memberRoute as memberRouteV1 } from '@modules/admin/memberOfDay/MemberRoute';

import { likeRoute as likeRouteV1 } from '@modules/like/LikeRoute';
import { commentRoute as commentRouteV1 } from '@modules/comment/CommentRoute';

import { adminUser as adminUserV1 } from '@modules/admin/users/AdminUserRoute'

import { adminHomeRoute as adminHomeRoutev1 } from '@modules/admin/Home/HomeRoute'
import { gratitudeJournalRoute as gratitudeJournalRoutev1 } from '@modules/gratitudeJournal/GratitudeJournalRoute'

import { gratitudeRoute as gratitudeRouteV1 } from '@modules/admin/gratitudeJournal/gratitudeRoute';

// simple routing
import { adminLikeRoute as adminLikeRouteV1 } from '@modules/admin/like/likeRoute';

import { adminCommentRoute as adminCommentRouteV1 } from '@modules/admin/comment/commentRoute';
import { expertRoute as expertRouteV1 } from '@modules/admin/expert/expertRoute';
import { expertPostRoute as expertPostRouteV1 } from '@modules/admin/expertPost/expertPostRoute';

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
	...likeRouteV1,
	...commentRouteV1,
	...HomeRoute,
	...adminRouteV1,
	...gratitudeJournalRoutev1,
	// ...adminNotificationRouteV1,
	...commonRouteV1,
	...contentRouteV1,
	// ...notificationRouteV1,
	...userRouteV1,
	...categoryRouteV1,
	...postRouteV1,
	// ...inspirationRouteV1,
	// ...adviceROuteV1,
	...memberRouteV1,
	...adminUserV1,
	...adminHomeRoutev1,
	...adminLikeRouteV1,
	// ...versionRouteV1,
	...adminCommentRouteV1,
	...gratitudeRouteV1,
	...expertRouteV1,
	...expertPostRouteV1
];