import { Injectable } from '@nestjs/common';
import nodemailer from 'nodemailer';

@Injectable()
export class MailService {
    private transporter;

    constructor() {
        // Configuración para testing
        if (process.env.NODE_ENV === 'test') {
            this.transporter = {
                sendMail: jest.fn().mockResolvedValue(true)
            };
        } else {
            this.transporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST,
                port: Number(process.env.SMTP_PORT),
                secure: process.env.SMTP_SECURE === 'true',
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS,
                },
            });
        }
    }

    getTransporterForTesting() {
        return this.transporter;
    }

    async sendResetPasswordEmail(to: string, token: string) {
        const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
        const mailOptions = {
            from: process.env.SMTP_FROM,
            to,
            subject: 'Restablecimiento de contraseña',
            text: `Haz clic en el siguiente enlace para restablecer tu contraseña: ${resetUrl}`,
            html: `<p>Haz clic en el siguiente enlace para restablecer tu contraseña: <a href="${resetUrl}">${resetUrl}</a></p>`,
        };

        await this.transporter.sendMail(mailOptions);
    }
}
