import { Schema, model } from "mongoose";

import { TokenDocument } from "../types/schemaTypes.js";

const tokenSchema = new Schema<TokenDocument>({
    userId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "user",
    },
    token: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        immutable: true,
        select: false,
        expires: +process.env.EXPIRE_TIME!,
    },
});

const Token = model<TokenDocument>("Token", tokenSchema);

export default Token;
