import { model, Schema } from "mongoose";
import validator from "validator";
import bcrypt from "bcrypt";

import AppError from "../utils/appError.js";
import { UserDocument, UserModel } from "../types/schemaTypes.js";

const userSchema = new Schema<UserDocument>({
    email: {
        type: String,
        required: [true, "Email is required!"],
        validate: [validator.isEmail, "Invalid email!"],
    },
    password: {
        type: String,
        required: [true, "Password is required!"],
        maxlength: [20, "Password length have to be less than 20 characters"],
        minlength: [6, "Password length have to be more than 6 characters"],
    },
    role: {
        type: String,
        default: "user",
        immutable: true,
        select: false,
    },
});

userSchema.index({ email: 1 }, { unique: true });

// Check if email unique
userSchema.pre("save", async function (next) {
    const existingUser = await this.model("User").findOne({
        email: this.email,
    });
    if (existingUser) {
        return next(new AppError("Email have to be unique!", 400));
    }
    next();
});

// Hash password
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, process.env.SALT!);
    }
    next();
});

// Login static method
userSchema.statics.login = async function (
    email: string,
    password: string
): Promise<UserDocument | AppError> {
    const user = await this.findOne({ email });
    if (!user) {
        return new AppError("Incorrect email", 400);
    }
    const isEqual: boolean = await bcrypt.compare(password, user.password);
    if (isEqual) {
        return user;
    }
    return new AppError("Incorrect password", 400);
};

const User = model<UserDocument, UserModel>("User", userSchema);

export default User;
