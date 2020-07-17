"use strict";
import * as mongoose from "mongoose";
import { Schema, Model, Document } from "mongoose";
import * as config from "../../config/index";
import * as appUtils from "@utils/appUtils";

export interface Ilike extends Document {
    userId: string
    postId: string
    commentId?: string;
    category?: number;
    type: number;
}

const likeSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'users' },
  postId: { type: Schema.Types.ObjectId, trim: true, required: true },
  commentId: { type: Schema.Types.ObjectId, trim: true},
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
}
}, {
    versionKey: false,
    timestamps: true
});

likeSchema.set("toObject", {
    virtuals: true
});



likeSchema.methods.toJSON = function () {
    const object = appUtils.clean(this.toObject());
    return object;
};

export const likes: Model<Ilike> = mongoose.model<Ilike>(config.CONSTANT.DB_MODEL_REF.LIKE, likeSchema);
