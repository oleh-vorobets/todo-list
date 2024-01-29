import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { Types, Error as MongooseError } from "mongoose";
import generatorOfPassword from "generate-password-ts";
import crypto from "crypto";
import bcrypt from "bcrypt";

import AppError from "../utils/appError.js";
import User from "../models/userModel.js";
import sendEmail from "../utils/sendMail.js";
import Token from "../models/tokenModel.js";

interface RequestBody {
    email: string;
    password?: string;
    passwordConf?: string;
    newPasswordConf?: string;
    newPassword?: string;
}

interface RequestQuery {
    token?: string;
    id?: string;
}

// Generate password from 8 to 16 symbols
function genPassword() {
    return generatorOfPassword.generate({
        length: Math.floor(Math.random() * (16 - 8 + 1) + 8),
        numbers: true,
    });
}

// Create jwt token
const createToken = (id: Types.ObjectId) => {
    return jwt.sign({ id }, process.env.SECRET_KEY!, {
        expiresIn: process.env.EXPIRE_TIME!,
    });
};

const signup = async (req: Request, res: Response, next: NextFunction) => {
    const { email, password, passwordConf }: RequestBody = req.body;
    try {
        if (password !== passwordConf) {
            return next(
                new AppError(
                    "Password and passoword confirmation are not match",
                    400
                )
            );
        }
        const newUser = await User.create({ email, password });
        const token = createToken(newUser._id);
        const maxAge = +process.env.EXPIRE_TIME! || 3600;

        res.cookie("jwt", token, { httpOnly: true, maxAge });
        res.status(201).json({
            status: "success",
            data: newUser._id,
        });
    } catch (err) {
        if (err instanceof AppError || err instanceof MongooseError) {
            return next(err);
        }
        return next(new AppError("User not created", 400));
    }
};

const login = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password }: RequestBody = req.body;
        if (!email || !password) {
            return next(
                new AppError(
                    `'Email' and 'Password' fields can not be empty!`,
                    404
                )
            );
        }

        const user = await User.login(email, password);
        if (user instanceof Error) {
            return next(user);
        }

        const token = createToken(user._id);
        const maxAge = +process.env.EXPIRE_TIME! || 3600;

        res.cookie("jwt", token, { httpOnly: true, maxAge });
        res.status(200).json({
            status: "success",
            user: user._id,
        });
    } catch (err) {
        return next(err);
    }
};

const logout = async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.cookie("jwt", "", { maxAge: 1 });
        res.status(200).json({ status: "success" });
    } catch (err) {
        return next(err);
    }
};

/*
{
    "email": "email@gmail.com",
}
*/
// Send an email with link to change password
const forgotPassword = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { email }: RequestBody = req.body;
        const currentUser = await User.findOne({ email });
        if (!currentUser) {
            return next(new AppError("User with such email is not found", 404));
        }

        const resetToken = crypto.randomBytes(32).toString("hex");
        const hashedToken = await bcrypt.hash(resetToken, process.env.SALT!);

        const token = await Token.create({
            userId: currentUser._id,
            token: hashedToken,
            createdAt: Date.now(),
        });

        const link = `${req.hostname}/${req.baseUrl}/reset-password?token=${resetToken}&id=${currentUser._id}`;
        const result = await sendEmail(
            email,
            "Reset Password",
            `Hi dude!\n Your requested to reset
                                        password.\n Please click the link below to reset your password.\n ${link}`
        );
        if (result) {
            await token.deleteOne();
            return next(result);
        }
        res.status(200).json({ status: "success" });
    } catch (err) {
        return next(err);
    }
};

// Set random password and send email with it
const resetPassword = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { token, id }: RequestQuery = req.query;
        const passwordResetToken = await Token.findOne({ userId: id });
        if (!passwordResetToken) {
            return next(
                new AppError("Invalid or expired password reset token", 404)
            );
        }
        const isValid = await bcrypt.compare(token!, passwordResetToken.token);
        if (!isValid) {
            return next(
                new AppError("Invalid or expired password reset token", 404)
            );
        }

        const password = genPassword();
        await User.updateOne(
            {
                _id: id,
            },
            {
                $set: { password },
            }
        );

        const user = await User.findById({ _id: id });
        const link = `${req.hostname}/${req.baseUrl}/update-password/${
            user!._id
        }`;
        const result = await sendEmail(
            user!.email,
            "Password Reset Successfully",
            `This is your temporary password ${password}.\n To change it go there ${link}`
        );

        await passwordResetToken.deleteOne();
        if (result) {
            return next(result);
        }

        res.status(200).json({ status: "success" });
    } catch (err) {
        return next(err);
    }
};

/*
{
    "email": "email@gmail.com",
    "password": "test4321"
    "newPassword": "test1234",
    "newPasswordConf": "test1234"
}
*/
// Change password by using previous one
const updatePassword = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { email, password, newPassword, newPasswordConf }: RequestBody =
            req.body;
        if (!email || !password || !newPassword || !newPasswordConf) {
            return next(
                new AppError(
                    "Submit such fields: email, password, newPassword and newPasswordConf",
                    404
                )
            );
        }

        const user = await User.findOne({ email });

        if (!user) {
            return next(
                new AppError("User with such email was not found", 404)
            );
        }
        if (!(await bcrypt.compare(password, user?.password))) {
            return next(new AppError("Invalid password", 404));
        }
        if (newPassword !== newPasswordConf) {
            return next(new AppError("New passwords are not match", 404));
        }

        await User.updateOne(
            {
                _id: user._id,
            },
            {
                $set: {
                    password: newPassword,
                },
            }
        );
        res.status(200).json({ status: "success" });
    } catch (err) {
        return next(err);
    }
};

export { signup, login, logout, forgotPassword, resetPassword, updatePassword };
