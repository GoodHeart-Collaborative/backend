"use strict";

import * as _ from "lodash";
import fs = require("fs");
import { commentDao } from "./commentDao";
import * as config from "@config/index";
import { CONSTANT } from "@config/index";
import * as appUtils from '../../../utils/appUtils'


class AdminCommentController {

    async getComments(params: CommentRequest.getComments) {
        try {
            let { pageNo, limit, commentId, postId } = params
            let match: any = {};
            let aggPipe = [];
            let result: any = {}

            match["postId"] = appUtils.toObjectId(postId)
            if (commentId) {
                match["commentId"] = appUtils.toObjectId(commentId)
                match["category"] = CONSTANT.COMMENT_CATEGORY.COMMENT
            } else {
                match["category"] = CONSTANT.COMMENT_CATEGORY.POST
            }
            aggPipe.push({ "$match": match });
            aggPipe.push({ "$sort": { "createdAt": -1 } });
            aggPipe.push({
                $lookup: {
                    from: 'users',
                    let: { uId: '$userId' },
                    pipeline: [{
                        $match: {
                            $expr: {
                                $eq: ['$_id', '$$uId'],
                            }
                        }
                    },
                    {
                        $project: {
                            email: 1,
                            firstName: 1,
                            lastName: 1,
                            status: 1,
                            profilePicUrl: 1
                        },
                    },
                    ],
                    as: 'users',
                },
            },
                {
                    $unwind: {
                        path: '$users',
                        preserveNullAndEmptyArrays: true,
                    },
                },
            )

            result = await commentDao.aggreagtionWithPaginateTotal("comments", aggPipe, limit, pageNo, true)
            return result
        } catch (error) {
            throw error;
        }
    }
}
export const commentController = new AdminCommentController();