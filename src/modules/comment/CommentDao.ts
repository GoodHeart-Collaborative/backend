"use strict";
import { BaseDao } from "../base/BaseDao";

import * as config from "../../config/index";

export class CommentDao extends BaseDao {

	// /**
	//  * @function isContentExists
	//  */
    async addComments(params) {
        try {
            return await this.save("comments", params);
        } catch (error) {
            throw error;
        }
    }
    async checkPost(params, model) {
        try {
            return await this.findOne(model, params, {}, {});
        } catch (error) {
            throw error;
        }
    }
    async checkComment(params) {
		try {
			return await this.findOne("comments", params, {}, {}, {});
		} catch (error) {
			throw error;
		}
	}

}

export const commentDao = new CommentDao();