import nodemailer from 'nodemailer';

/**
 * Create a reusable SMTP transporter.
 * All credentials come from environment variables — never hardcoded.
 */
function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

/**
 * Send a signup OTP verification email.
 * The OTP is displayed in the email HTML.
 * In development, if SMTP credentials are not configured, it prints to console for easy testing.
 */
export async function sendSignupOTP(email: string, otp: string): Promise<void> {
  const hasSmtpConfig = Boolean(process.env.SMTP_USER && process.env.SMTP_PASS);

  if (!hasSmtpConfig) {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`\n========================================`);
      console.log(`[DEV OTP NOTIFICATION]`);
      console.log(`Recipient: ${email}`);
      console.log(`Verification OTP: ${otp}`);
      console.log(`(Configure SMTP_USER and SMTP_PASS in .env to send real emails)`);
      console.log(`========================================\n`);
      return;
    }
    throw new Error('SMTP credentials are not configured.');
  }

  try {
    const transporter = createTransporter();
    const fromAddress = process.env.SMTP_FROM || `"GlarusAcademy" <${process.env.SMTP_USER}>`;

    await transporter.sendMail({
      from: fromAddress,
      to: email,
      subject: 'GlarusAcademy — Email Verification Code',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; background-color: #0B0F19; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #0B0F19; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="background-color: #131827; border-radius: 16px; border: 1px solid rgba(109, 40, 217, 0.2); overflow: hidden;">
                  <!-- Header -->
                  <tr>
                    <td style="padding: 32px 32px 24px; text-align: center; background: linear-gradient(135deg, rgba(109, 40, 217, 0.15), rgba(37, 99, 235, 0.15));">
                      <div style="width: 48px; height: 48px; background: linear-gradient(135deg, #6D28D9, #2563EB); border-radius: 12px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 16px;">
                        <span style="font-size: 24px; color: white;">🎓</span>
                      </div>
                      <h1 style="margin: 0; color: #F1F5F9; font-size: 22px; font-weight: 700;">
                        Verify Your Email
                      </h1>
                      <p style="margin: 8px 0 0; color: #94A3B8; font-size: 14px;">
                        Complete your GlarusAcademy registration
                      </p>
                    </td>
                  </tr>
                  <!-- Body -->
                  <tr>
                    <td style="padding: 32px;">
                      <p style="margin: 0 0 24px; color: #CBD5E1; font-size: 14px; line-height: 1.6;">
                        Enter the following verification code to complete your account setup:
                      </p>
                      <!-- OTP Code -->
                      <div style="text-align: center; padding: 24px; background-color: #0B0F19; border-radius: 12px; border: 1px solid rgba(109, 40, 217, 0.3); margin-bottom: 24px;">
                        <span style="font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #A78BFA; font-family: 'Courier New', monospace;">
                          ${otp}
                        </span>
                      </div>
                      <p style="margin: 0 0 8px; color: #EF4444; font-size: 13px; text-align: center;">
                        ⏱ This code expires in <strong>5 minutes</strong>.
                      </p>
                      <p style="margin: 0; color: #64748B; font-size: 12px; text-align: center;">
                        If you did not request this code, please ignore this email.
                      </p>
                    </td>
                  </tr>
                  <!-- Footer -->
                  <tr>
                    <td style="padding: 20px 32px; border-top: 1px solid rgba(255,255,255,0.05); text-align: center;">
                      <p style="margin: 0; color: #475569; font-size: 11px;">
                        © ${new Date().getFullYear()} GlarusAcademy — AI EdTech Platform
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('Failed to send email via SMTP, fallback to dev console:', error);
      console.log(`[DEV OTP] for ${email}: ${otp}`);
      return;
    }
    throw error;
  }
}

