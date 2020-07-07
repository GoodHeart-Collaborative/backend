"use strict";

import * as _ from "lodash";
import fs = require("fs");
import * as promise from "bluebird";

import * as appUtils from "@utils/appUtils";
import * as config from "@config/index";
// import * as sns from "@lib/pushNotification/sns";
import * as postConstant from "@modules/post/PostConstant";
import { postDao } from "@modules/post/index";


class PostController {

	/**
	 * @function signup
	 * @description if IS_REDIS_ENABLE set to true,
	 * than redisClient.storeList() function saves value in redis.
	 */
    async addPost(params) {
        try {
            console.log('paramsparamsparamsparams', params);
            // const dataToInsert =

            const data = await postDao.insert("posts", params, {});
            console.log('dataaaaaaaaaaaaa', data);
            return postConstant.MESSAGES.SUCCESS.DEFAULT;

        } catch (error) {
            throw error;
        }
    }
}

export const postController = new PostController();