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
    // createdAt: Date;
    // updatedAt: Date;
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
    imageUrl: { type: String },
    created: { type: Number, default: Date.now() }
    // updatedAt: { type: Date },
    // createdAt: { type: Date }
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