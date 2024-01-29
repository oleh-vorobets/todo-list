import { Schema, model } from "mongoose";

import { TaskDocument, ImportanceEnum } from "../types/schemaTypes.js";

const taskSchema = new Schema<TaskDocument>({
    title: {
        type: String,
        required: [true, "To-do task must have a title!"],
        maxlength: [30, "A title must have less than 30 characters!"],
        minlength: [3, "A title must have more than 3 characters!"],
    },
    task: {
        type: String,
        required: [true, "Task is required in To-Do list"],
        maxlength: [60, "A task must have less than 60 characters!"],
        minlength: [2, "A task must have more than 2 characters!"],
    },
    importance: {
        type: Number,
        default: ImportanceEnum.Low,
        enum: {
            values: Object.values(ImportanceEnum),
            message: "Invalid value of importance!",
        },
    },
    endTime: {
        type: Date,
        validate: {
            validator: (value: any) => {
                return value instanceof Date && value.getTime() >= Date.now();
            },
            message: "Invalid date format!",
        },
    },
    startTime: {
        type: Date,
        default: Date.now,
        select: false,
        immutable: false,
    },
    isReady: {
        type: Boolean,
        default: false,
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        immutable: true,
        select: false,
    },
});

taskSchema.index({ title: 1 });

const Task = model<TaskDocument>("Task", taskSchema);

export default Task;
