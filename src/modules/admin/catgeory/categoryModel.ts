"use strict";

// import * as bcrypt from "bcrypt";
import * as mongoose from "mongoose";
import { Schema, Model, Document } from "mongoose";

import * as appUtils from "@utils/appUtils";
import * as config from "@config/index";

export interface ICategory extends Document {
    // subCategoryId: string;
    title: string;
    name: string;
    imageUrl: string;
    created: number;
    type: number;
}

const categorySchema = new Schema({
    _id: { type: Schema.Types.ObjectId, required: true, auto: true },
    // subCategoryId: { type: Schema.Types.ObjectId },
    name: { type: String },
    title: { type: String },
    status: {
        type: String, enum: [
            config.CONSTANT.STATUS.ACTIVE,
            config.CONSTANT.STATUS.BLOCKED,
            config.CONSTANT.STATUS.DELETED
        ], default: config.CONSTANT.STATUS.ACTIVE,
    },
    type: {
        type: Number,
        enum: [
            config.CONSTANT.CATEGORY_TYPE.EVENT_CAEGORY,
            config.CONSTANT.CATEGORY_TYPE.OTHER_CATEGORY
        ]
    },
    imageUrl: { type: String },
    created: { type: Number, default: Date.now() }

}, {
    versionKey: false,
    // collection: config.CONSTANT.DB_MODEL_REF.CATEGORY,
    timestamps: true,
});

categorySchema.set("toObject", {
    virtuals: true
});
// categorySchema.methods.toJSON = function () {
//     const object = appUtils.clean(this.toObject());
//     return object;
// };

// to set findAndModify false
// mongoose.set("useFindAndModify", false);

// Export admin
export const categories: Model<ICategory> = mongoose.model<ICategory>(config.CONSTANT.DB_MODEL_REF.CATEGORY, categorySchema);
// export const admins: Model<IAdmin> = mongoose.model<IAdmin>(config.CONSTANT.DB_MODEL_REF.ADMIN, adminSchema);