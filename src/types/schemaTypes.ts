import { Document, Model, Schema } from "mongoose";

export interface UserDocument extends Document {
    email: string;
    password: string;
    role: string;
}

export interface UserModel extends Model<UserDocument> {
    login(email: string, password: string): Promise<UserDocument>;
}

export interface TokenDocument extends Document {
    userId: Schema.Types.ObjectId;
    token: string;
    createdAt: Date;
}

export interface TaskDocument extends Document {
    title: string;
    task: string;
    importance: number;
    endTime: Date;
    startTime: Date;
    isReady: boolean;
    user: Schema.Types.ObjectId;
}

export enum ImportanceEnum {
    Low = 1,
    Medium = 2,
    High = 3,
}