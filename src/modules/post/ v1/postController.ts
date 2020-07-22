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
            const data = await postDao.insert("posts", params, {});
            return postConstant.MESSAGES.SUCCESS.DEFAULT;

        } catch (error) {
            throw error;
        }
    }

    async getPostById(params) {
        try {
            const criteria = {
                _id: params.postId,
            };

            const data = await postDao.findOne('posts', criteria, {}, {})
            return data;
        } catch (error) {
            throw error;
        }
    }

    async getPosts(params) {
        const { sortBy, sortOrder, limit, page, searchTerm } = params;
        const aggPipe = [];

        const match: any = {};
        // match.adminType = config.CONSTANT.ADMIN_TYPE.SUB_ADMIN;
        if (status) {
            match["$and"] = [{ status: status }, { status: { $ne: config.CONSTANT.STATUS.DELETED } }];
        } else {
            match.status = { "$ne": config.CONSTANT.STATUS.DELETED };
        }
        if (searchTerm) {
            match["$or"] = [
                { "title": { "$regex": searchTerm, "$options": "-i" } },
            ];
        }

        aggPipe.push({ "$match": match });


        let sort = {};
        if (sortBy && sortOrder) {
            if (sortBy === "name") {
                sort = { "name": sortOrder };
            } else {
                sort = { "created": sortOrder };
            }
        } else {
            sort = { "created": -1 };
        }
        aggPipe.push({ "$sort": sort });

        const data = await postDao.paginate('posts', aggPipe, limit, page, {}, true);
        return data;
    } catch(error) {
        return Promise.reject(error);
    }
}

export const postController = new PostController();