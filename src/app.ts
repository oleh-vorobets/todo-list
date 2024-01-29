import dotenv from "dotenv";
import express, { Request, Response, NextFunction } from "express";
import morgan from "morgan";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import mongoSanitize from "express-mongo-sanitize";

import globalErrorHandler from "./controllers/errorController.js";
import todoRouter from "./routes/todoRouter.js";
import AppError from "./utils/appError.js";
import authRouter from "./routes/authRoutes.js";
import { requireAuth } from "./middlewares/authMiddleware.js";

dotenv.config();

const app = express();

//MIDDLEWARES
if (process.env.NODE_ENV === "development") {
    app.use(morgan("dev"));
} else {
    app.use(morgan("short"));
}
app.use(express.json({ limit: "10kb" }));
app.use(cors());
app.use(helmet());
app.use(
    rateLimit({
        max: 100,
        windowMs: 60 * 60 * 1000,
        message: "Too many requests from this IP, please try again in an hour!",
    })
);
app.use(mongoSanitize());

//ROUTES
app.use("/api/v1/to-do", requireAuth, todoRouter);
app.use("/api/v1", authRouter);

app.use("*", (req: Request, res: Response, next: NextFunction) => {
    next(new AppError(`Can not find ${req.originalUrl}`, 404));
});

//ERROR HANDLERS
app.use(globalErrorHandler);

export default app;
