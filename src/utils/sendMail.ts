import { SendMailOptions, createTransport } from 'nodemailer'

import AppError from './appError.js';

const sendEmail = async (email: string, subject: string, message: string): Promise<AppError | void> => {
    try {
        // create transporter object using SMTP
        const transporter = createTransport({
            host: process.env.EMAIL_HOST,
            port: Number(process.env.EMAIL_PORT),
            auth: {
                user: process.env.EMAIL_USERNAME,
                pass: process.env.EMAIL_PASSWORD, 
            },
        });

        const mailOptions: SendMailOptions = {
            from: process.env.EMAIL_USERNAME!,
            to: email,
            subject: subject,
            text: message
        };

        await transporter.sendMail(mailOptions);
    } catch (err) {
        return new AppError(`Email message wasn't send. Please try again.`, 404);
    }
};

export default sendEmail;