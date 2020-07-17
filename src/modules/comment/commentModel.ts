"use strict";
import * as mongoose from "mongoose";
import { Schema, Model, Document } from "mongoose";
import * as config from "../../config/index";
import * as appUtils from "@utils/appUtils";

export interface Icomment extends Document {
    likeCount?: number,
    commentCount?: number,
    comment: string,
    userId: string
    postId: string
    commentId?: string;
    category?: number;
    type: number;
}


const commentSchema = new Schema({
  likeCount: { type: Number, default: 0},
  commentCount: { type: Number, default: 0},
  comment: { type: String, trim: true },
  userId: { type: Schema.Types.ObjectId, required: true},
  postId: { type: Schema.Types.ObjectId, required: true },
  commentId: { type: Schema.Types.ObjectId },
  category: {
    type: Number,
    enum: [
        config.CONSTANT.COMMENT_CATEGORY.POST,
        config.CONSTANT.COMMENT_CATEGORY.COMMENT
    ],
    default: config.CONSTANT.COMMENT_CATEGORY.POST
},
type: {
  type: Number,
  enum: [
      config.CONSTANT.HOME_TYPE.UNICORN,
      config.CONSTANT.HOME_TYPE.INSPIRATION,
      config.CONSTANT.HOME_TYPE.DAILY_ADVICE,
      config.CONSTANT.HOME_TYPE.GENERAL_GRATITUDE,
      config.CONSTANT.HOME_TYPE.MEMBER_OF_DAY
  ],
  default: config.CONSTANT.HOME_TYPE.UNICORN
},
created: { type: Number, default: new Date() }
}, {
    versionKey: false,
    timestamps: true
});

commentSchema.set("toObject", {
    virtuals: true
});



commentSchema.methods.toJSON = function () {
    const object = appUtils.clean(this.toObject());
    return object;
};

export const comments: Model<Icomment> = mongoose.model<Icomment>(config.CONSTANT.DB_MODEL_REF.COMMENT, commentSchema);