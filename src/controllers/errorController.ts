import { Request, Response } from 'express';
import { Error as MongooseError } from 'mongoose';

import AppError from '../utils/appError.js';

const globalErrorHandler = (err: MongooseError.ValidationError | AppError | MongooseError.CastError, req: Request, res: Response): void => {
    if(process.env.NODE_ENV === 'development') {
        const statusCode: number = 'statusCode' in err ? err.statusCode : 500;
        res.status(statusCode).json({
            message: err.message,
            stack: err.stack
        });
    } else {
        console.log(err);
        if(err instanceof AppError) {
            res.status(err.statusCode).json({
                message: err.message,
                status: "fail",
            });
        } else if(err.name === 'ValidationError') {
            res.status(404).json({
                message: Object.values(err.errors).map(val => val.message).join('   '),
                status: "error"
            });
        } else if(err.name === 'CastError') {
            res.status(404).json({
                message: `Invalid ${err.kind} id: ${err.value}`,
                status: "error"
            });
        } else {
            res.status(500).json({
                message: "Something went wrong!",
                status: "error"
            });
        } 
    }
};

export default globalErrorHandler;