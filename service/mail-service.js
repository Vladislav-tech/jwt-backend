import dotenv from 'dotenv'

dotenv.config('./.env');
import nodeMailer from 'nodemailer';


class MailService {
    constructor() {
        const host = process.env.SMTP_HOST;
        const port = Number(process.env.SMTP_PORT);
        const user = process.env.SMTP_USER;
        // Log SMTP config (do not log passwords in production)
        console.log('MailService: SMTP config:', { host, port, user });

        this.transporter = nodeMailer.createTransport({
            host,
            port,
            secure: false,
            auth: {
                user,
                pass: process.env.SMTP_PASSWORD // In production, use environment variables or secure vaults for sensitive data
            }
        });
    }
    async sendActivationMail(to, link) {
        try {
            await this.transporter.verify();
            await this.transporter.sendMail({
                from: process.env.SMTP_USER,
                to,
                subject: 'Активация аккаунта на ' + process.env.API_URL,
                text: '',
                html: `
                    <div>
                        <h1>Для активации перейдите по ссылке</h1>
                        <a href="${link}">${link}</a>
                    </div>
                `
            });
        } catch (err) {
            console.error('MailService: sendActivationMail error:', err);
            throw err;
        }
    }
}

export default new MailService();