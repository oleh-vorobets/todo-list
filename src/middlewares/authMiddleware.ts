import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

import AppError from "../utils/appError.js";
import User from "../models/userModel.js";

// Checks whether the user is logged into the account
const requireAuth = (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.headers.cookie
            ?.split(";")
            .find((el) => el.startsWith("jwt="))
            ?.replace("jwt=", "");
        if (!token) {
            return next(new AppError("You are unauthorized", 401));
        }
        jwt.verify(
            token,
            process.env.SECRET_KEY!,
            async (err, decodedToken) => {
                res.locals.user = null;
                if (err) {
                    return next(new AppError("Invalid token", 406));
                }
                if (typeof decodedToken === "string" || !decodedToken) {
                    return next(new AppError("Invalid token structure", 406));
                }

                const id = decodedToken.id;
                const user = await User.findById(id);
                if (!user) {
                    return next(new AppError("No such user found", 404));
                }
                res.locals.user = user;
                return next();
            }
        );
    } catch (err) {
        return next(err);
    }
};

const adminAuth = async (req: Request, res: Response, next: NextFunction) => {
    if (res.locals.user.role !== "admin") {
        return next(new AppError("You are not an admin", 401));
    }
    next();
};

export { requireAuth, adminAuth };
