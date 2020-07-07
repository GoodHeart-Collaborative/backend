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
    createdAt: string;
    updatedAt: string;
}

const categorySchema = new Schema({
    _id: { type: Schema.Types.ObjectId, required: true, auto: true },
    // subCategoryId: { type: Schema.Types.ObjectId },
    name: { type: String },
    title: { type: String },

    updatedAt: { type: Number },

    created: { type: Number }
}, {
    versionKey: false,
    // collection: config.CONSTANT.DB_MODEL_REF.CATEGORY,
    // timestamps: true,
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