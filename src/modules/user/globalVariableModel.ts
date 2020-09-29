"use strict";

import * as mongoose from "mongoose";
import { Schema, Model, Document } from "mongoose";

import * as config from "@config/index";


export interface IGlobal extends Document {
    memberOfDayCount: number;
}

const globalVariableSchema = new Schema({
    memberOfDayCount: { type: Number, default: 0 },
})


export const global_var: Model<IGlobal> = mongoose.model<IGlobal>(config.CONSTANT.DB_MODEL_REF.GLOBAL_VARIABLE, globalVariableSchema);