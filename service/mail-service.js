import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config({ path: './.env' });

class MailService {
    constructor() {
        const host = process.env.SMTP_HOST;
        const port = Number(process.env.SMTP_PORT);
        const user = process.env.SMTP_USER;

        if (process.env.NODE_ENV !== 'production') {
            console.log('MailService initialized:', { host, port, user });
        }

        this.transporter = nodemailer.createTransport({
            host,
            port,
            secure: port === 465,
            auth: {
                user,
                pass: process.env.SMTP_PASSWORD,
            },
        });
    }

    async sendActivationMail(to, activationLink) {
        try {
            await this.transporter.verify();

            const appName = process.env.APP_NAME || 'Your App';

            const mailOptions = {
                from: `"${appName}" <${process.env.SMTP_USER}>`,
                to,
                subject: `🚀 Activate Your ${appName} Account – Let's Get Started! 🎉`,
                text: `Hey there! 👋\n\nThanks for joining ${appName}! 🎈\nClick the link to activate your account and unlock everything:\n${activationLink}\n\nThis link expires in 24 hours ⏳\n\nDidn't sign up? Just ignore this email 😊\n\nCheers,\nThe ${appName} Team`,
                html: this.generateActivationHtml(appName, activationLink),
            };

            await this.transporter.sendMail(mailOptions);
            console.log(`Activation email sent to ${to}`);
        } catch (err) {
            console.error('Failed to send activation email:', err);
            throw new Error(`Email send failed: ${err.message}`);
        }
    }

    generateActivationHtml(appName, link) {
        const apiUrl = process.env.API_URL || 'https://your-app.com';

        // Пульсирующая кнопка как GIF (рекомендую создать отдельно в Canva/Figma → экспорт GIF)
        // Альтернатива: статичная кнопка + CSS pulse только для Apple Mail
        const buttonGifUrl = 'https://your-cdn.com/pulsing-activate-button.gif'; // ← загрузи свой GIF
        const buttonStaticUrl = 'https://your-cdn.com/static-activate-button.png'; // fallback

        return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Activate Your ${appName} Account 🎉</title>
  <style type="text/css">
    body { margin:0; padding:0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background:#f4f7fa; }
    table { border-collapse:collapse; }
    a { color:#6366f1; }
    .container { max-width:600px; margin:0 auto; background:#ffffff; border-radius:16px; overflow:hidden; box-shadow:0 8px 24px rgba(0,0,0,0.1); }
    .header { background:linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding:48px 30px; text-align:center; color:white; }
    .content { padding:40px 30px; text-align:center; color:#1f2937; }
    .button-wrapper { margin:32px 0; }
    .button { display:inline-block; background:#6366f1; color:white !important; font-weight:700; padding:18px 48px; border-radius:12px; text-decoration:none; font-size:20px; }
    /* Pulse animation — работает только в Apple Mail / WebKit */
    @keyframes pulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.08); }
      100% { transform: scale(1); }
    }
    .animate-pulse { animation: pulse 2s infinite ease-in-out; }
    .footer { background:#f1f5f9; padding:28px 30px; font-size:14px; color:#6b7280; text-align:center; }
    @media only screen and (max-width:600px) {
      .content { padding:32px 20px; }
      .button { width:100%; box-sizing:border-box; }
    }
  </style>
</head>
<body>
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding:40px 0;">
        <table class="container" cellpadding="0" cellspacing="0">
          <!-- Header -->
          <tr>
            <td class="header">
              <h1 style="margin:0; font-size:36px; font-weight:800;">Welcome aboard! 🚀</h1>
              <p style="margin:16px 0 0; font-size:20px;">You're one click away from awesome 🎉</p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td class="content">
              <h2 style="margin:0 0 24px; font-size:28px;">Activate Your Account ✨</h2>
              <p style="margin:0 0 32px; font-size:17px; line-height:1.6; color:#4b5563;">
                Hi there! 👋<br>
                Thank you for signing up to ${appName} — we're thrilled to have you! 🌟<br><br>
                Just click the button below to confirm your email and start exploring.
              </p>

              <div class="button-wrapper">
                <!-- Пытаемся показать GIF, fallback — статичная + CSS pulse -->
                <!--[if !mso]><!-- -->
                <a href="${link}" target="_blank" style="display:inline-block;">
                  <img src="${buttonGifUrl}" alt="Activate Now" width="280" style="display:block; border-radius:12px;" class="animate-pulse">
                </a>
                <!--<![endif]-->
                <!--[if mso]>
                <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${link}" style="height:60px;v-text-anchor:middle;width:280px;" arcsize="12%" stroke="f" fillcolor="#6366f1">
                  <w:anchorlock/>
                  <center style="color:#ffffff;font-family:sans-serif;font-size:20px;font-weight:bold;">Activate My Account →</center>
                </v:roundrect>
                <![endif]-->
                <a href="${link}" target="_blank" class="button animate-pulse" style="background:#6366f1; padding:18px 48px; border-radius:12px; font-size:20px; font-weight:bold; color:white !important; text-decoration:none;">
                  Activate My Account →
                </a>
              </div>

              <p style="margin:32px 0 0; font-size:15px; color:#6b7280;">
                Link expires in 24 hours ⏳<br>
                Not you? No worries — just ignore this email 😊
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td class="footer">
              <p style="margin:0 0 12px;">© ${new Date().getFullYear()} ${appName} • All rights reserved ❤️</p>
              <p style="margin:0;">You're receiving this because you signed up at ${apiUrl}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;
    }
}

export default new MailService();