import { NextFunction, Request, Response } from "express";

import Task from "../models/taskModel.js";
import AppError from "../utils/appError.js";

// Get all tasks of certain user
export async function getTasks(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const sortQuery = req.query.sort as string;

        const result = await Task.aggregate([
            {
                $match: {
                    user: res.locals.user._id,
                },
            },
            {
                $project: {
                    __v: 0,
                    user: 0,
                },
            },
            {
                $sort: {
                    [sortQuery]: 1,
                },
            },
        ]);

        res.status(200).json(result);
    } catch (err) {
        return next(err);
    }
}

// Create a task for user
export async function postTask(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const body = req.body;
        body.user = res.locals.user._id;

        const task = await Task.create(body);
        const taskObject = task.toObject();
        const { user, __v, ...taskData } = taskObject;

        res.status(201).json({
            status: "success",
            data: {
                data: taskData,
            },
        });
    } catch (err) {
        return next(err);
    }
}

// Get task by id for certain user
export async function getTask(req: Request, res: Response, next: NextFunction) {
    const taskId = req.params.id;
    try {
        const task = await Task.findById(taskId).select("-__v -user");
        if (task && res.locals.user._id.equals(task.user)) {
            const taskObject = task.toObject();
            const { user, ...taskData } = taskObject;

            res.status(200).json({
                status: "success",
                data: {
                    data: taskData,
                },
            });
        } else {
            return next(new AppError(`Task not found with id ${taskId}`, 404));
        }
    } catch (err) {
        return next(
            new AppError(
                `Error retrieving task with id ${taskId}. Invalid id!`,
                400
            )
        );
    }
}

// Get task by id for certain user
export async function updateTask(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const taskId = req.params.id;
    if (!req.body) return next(new AppError("Request body is empty", 400));
    try {
        const task = await Task.findById(taskId);

        if (task && res.locals.user._id.equals(task.user)) {
            const { user, ...data } = req.body;
            const updatedTask = await Task.findByIdAndUpdate(taskId, data, {
                new: true,
            }).select("-__v -user");

            res.status(200).json({
                status: "success",
                data: {
                    data: updatedTask,
                },
            });
        } else {
            next(new AppError(`Task not found with id ${taskId}`, 404));
        }
    } catch (err) {
        next(
            new AppError(
                `Error retrieving task with id ${taskId}. Invalid id!`,
                400
            )
        );
    }
}

// Delete task by id for certain user
export async function deleteTask(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const taskId = req.params.id;
    try {
        const task = await Task.findById(taskId);

        if (task && res.locals.user._id.equals(task.user)) {
            await Task.findByIdAndDelete(taskId).select("-__v -user");

            res.status(200).json({
                status: "success",
                data: {
                    data: task,
                },
            });
        } else {
            next(new AppError(`Task not found with id ${taskId}`, 404));
        }
    } catch (err) {
        next(
            new AppError(
                `Error retrieving task with id ${taskId}. Invalid id!`,
                400
            )
        );
    }
}
