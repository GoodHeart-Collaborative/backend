"use strict";
import { BaseDao } from "../../base/BaseDao";
import * as appUtils from '../../../utils/appUtils'


export class AdminCommentDao extends BaseDao {

    // /**
    //  * @function isContentExists
    //  */
    async addComments(params) {
        try {
            params["created"] = new Date().getTime()
            return await this.save("comments", params);
        } catch (error) {
            throw error;
        }
    }

}

export const commentDao = new AdminCommentDao();