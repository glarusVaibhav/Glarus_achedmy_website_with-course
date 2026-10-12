import nodemailer from 'nodemailer';

/**
 * Create a reusable SMTP transporter.
 * All credentials come from environment variables — never hardcoded.
 */
function createTransporter() {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || '587');
  const isSecure = process.env.SMTP_SECURE === 'true' || port === 465;
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.replace(/\s+/g, '');

  return nodemailer.createTransport({
    host,
    port,
    secure: isSecure,
    auth: {
      user,
      pass,
    },
    tls: {
      rejectUnauthorized: false,
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

    const info = await transporter.sendMail({
      from: fromAddress,
      to: email,
      subject: `${otp} is your GlarusAcademy verification code`,
      text: `Your GlarusAcademy email verification code is: ${otp}\n\nThis code will expire in 5 minutes.\nIf you did not request this code, please ignore this email.`,
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verify Your Email - GlarusAcademy</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #070913; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; color: #E2E8F0; -webkit-font-smoothing: antialiased;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #070913; background-image: radial-gradient(circle at 50% 0%, rgba(99, 102, 241, 0.15), transparent 45%); padding: 48px 16px;">
            <tr>
              <td align="center">
                <!-- Main Container Card -->
                <table role="presentation" width="100%" style="max-width: 540px; background-color: #0F1424; border: 1px solid rgba(139, 92, 246, 0.25); border-radius: 20px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 40px rgba(99, 102, 241, 0.12);">
                  
                  <!-- Top Accent Gradient Line -->
                  <tr>
                    <td height="4" style="background: linear-gradient(90deg, #6366F1 0%, #8B5CF6 50%, #EC4899 100%); line-height: 4px; font-size: 4px;">&nbsp;</td>
                  </tr>

                  <!-- Brand Header -->
                  <tr>
                    <td style="padding: 36px 40px 24px; text-align: center;">
                      <!-- Logo & App Name Badge -->
                      <table role="presentation" align="center" cellpadding="0" cellspacing="0" style="margin: 0 auto 20px;">
                        <tr>
                          <td style="background: linear-gradient(135deg, #4F46E5, #7C3AED); padding: 12px; border-radius: 14px; box-shadow: 0 8px 20px rgba(124, 58, 237, 0.4); text-align: center;" width="44" height="44">
                            <span style="font-size: 24px; line-height: 1; display: block;">🎓</span>
                          </td>
                          <td style="padding-left: 14px; text-align: left; vertical-align: middle;">
                            <span style="font-size: 20px; font-weight: 800; letter-spacing: -0.5px; color: #FFFFFF; display: block; line-height: 1.2;">
                              Glarus<span style="color: #A78BFA;">Academy</span>
                            </span>
                            <span style="font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 1.5px; color: #818CF8; display: block;">
                              AI-Powered Learning
                            </span>
                          </td>
                        </tr>
                      </table>

                      <h1 style="margin: 0 0 10px; font-size: 24px; font-weight: 800; color: #FFFFFF; letter-spacing: -0.5px;">
                        Verify Your Email Address
                      </h1>
                      <p style="margin: 0; font-size: 14px; color: #94A3B8; line-height: 1.5;">
                        Thank you for joining GlarusAcademy! Please use the 6-digit verification code below to complete your registration.
                      </p>
                    </td>
                  </tr>

                  <!-- Divider -->
                  <tr>
                    <td style="padding: 0 40px;">
                      <div style="height: 1px; background: linear-gradient(90deg, transparent, rgba(148, 163, 184, 0.15), transparent);"></div>
                    </td>
                  </tr>

                  <!-- OTP Content Section -->
                  <tr>
                    <td style="padding: 32px 40px 24px;">
                      
                      <!-- OTP Box -->
                      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(180deg, #161D33 0%, #0E1322 100%); border: 1.5px dashed rgba(167, 139, 250, 0.5); border-radius: 16px; margin: 0 0 20px; box-shadow: inset 0 2px 8px rgba(0,0,0,0.4);">
                        <tr>
                          <td style="padding: 28px 16px; text-align: center;">
                            <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: #A5B4FC; margin-bottom: 12px;">
                              Your Verification Code
                            </div>
                            <!-- OTP Code Display -->
                            <div style="font-family: 'SFMono-Regular', Consolas, 'Courier New', monospace; font-size: 40px; font-weight: 800; letter-spacing: 12px; color: #F8FAFC; text-shadow: 0 0 24px rgba(167, 139, 250, 0.6); padding-left: 12px; line-height: 1;">
                              ${otp}
                            </div>
                          </td>
                        </tr>
                      </table>

                      <!-- Expiry & Security Badge -->
                      <table role="presentation" align="center" cellpadding="0" cellspacing="0" style="margin: 0 auto 28px;">
                        <tr>
                          <td style="background-color: rgba(239, 68, 68, 0.12); border: 1px solid rgba(239, 68, 68, 0.25); border-radius: 30px; padding: 6px 16px; text-align: center;">
                            <span style="font-size: 12px; font-weight: 600; color: #FCA5A5; display: inline-flex; align-items: center;">
                              ⏱ Expires in <strong style="color: #FFFFFF; margin-left: 4px;">5 minutes</strong>
                            </span>
                          </td>
                        </tr>
                      </table>

                      <!-- Steps info box -->
                      <div style="background-color: rgba(30, 41, 59, 0.5); border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.05); padding: 18px 20px; margin-bottom: 24px;">
                        <div style="font-size: 12px; font-weight: 700; color: #CBD5E1; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">
                          Next steps:
                        </div>
                        <ol style="margin: 0; padding-left: 18px; font-size: 13px; color: #94A3B8; line-height: 1.7;">
                          <li>Return to the GlarusAcademy registration screen</li>
                          <li>Enter your 6-digit code: <strong style="color: #E2E8F0;">${otp}</strong></li>
                          <li>Start exploring AI courses, live classes & projects</li>
                        </ol>
                      </div>

                      <!-- Security Notice -->
                      <div style="border-left: 3px solid #818CF8; background-color: rgba(99, 102, 241, 0.06); padding: 12px 16px; border-radius: 0 8px 8px 0;">
                        <p style="margin: 0; font-size: 12px; color: #94A3B8; line-height: 1.5;">
                          🔒 <strong style="color: #E2E8F0;">Security Tip:</strong> Never share this code with anyone. GlarusAcademy support will never ask for your verification code.
                        </p>
                      </div>

                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="padding: 24px 40px; background-color: #090D18; border-top: 1px solid rgba(255, 255, 255, 0.06); text-align: center;">
                      <p style="margin: 0 0 8px; font-size: 12px; color: #64748B;">
                        If you did not request this email, please ignore it or <a href="mailto:support@glarusacademy.com" style="color: #818CF8; text-decoration: none;">contact support</a>.
                      </p>
                      <p style="margin: 0; font-size: 11px; color: #475569;">
                        © ${new Date().getFullYear()} GlarusAcademy Inc. • Next-Gen AI EdTech Platform
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

export async function sendPasswordResetOTP(email: string, otp: string): Promise<void> {
  const hasSmtpConfig = Boolean(process.env.SMTP_USER && process.env.SMTP_PASS);

  if (!hasSmtpConfig) {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`\n========================================`);
      console.log(`[DEV PASSWORD RESET OTP]`);
      console.log(`Recipient: ${email}`);
      console.log(`Reset OTP: ${otp}`);
      console.log(`Expires in: 10 minutes`);
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
      subject: `${otp} is your GlarusAcademy password reset code`,
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset Your Password - GlarusAcademy</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #070913; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; color: #E2E8F0; -webkit-font-smoothing: antialiased;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #070913; background-image: radial-gradient(circle at 50% 0%, rgba(239, 68, 68, 0.12), transparent 45%); padding: 48px 16px;">
            <tr>
              <td align="center">
                <!-- Main Container Card -->
                <table role="presentation" width="100%" style="max-width: 540px; background-color: #0F1424; border: 1px solid rgba(239, 68, 68, 0.25); border-radius: 20px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 40px rgba(239, 68, 68, 0.1);">
                  
                  <!-- Top Accent Gradient Line -->
                  <tr>
                    <td height="4" style="background: linear-gradient(90deg, #F59E0B 0%, #EF4444 50%, #EC4899 100%); line-height: 4px; font-size: 4px;">&nbsp;</td>
                  </tr>

                  <!-- Brand Header -->
                  <tr>
                    <td style="padding: 36px 40px 24px; text-align: center;">
                      <!-- Logo & App Name Badge -->
                      <table role="presentation" align="center" cellpadding="0" cellspacing="0" style="margin: 0 auto 20px;">
                        <tr>
                          <td style="background: linear-gradient(135deg, #DC2626, #7C3AED); padding: 12px; border-radius: 14px; box-shadow: 0 8px 20px rgba(220, 38, 38, 0.4); text-align: center;" width="44" height="44">
                            <span style="font-size: 24px; line-height: 1; display: block;">🔐</span>
                          </td>
                          <td style="padding-left: 14px; text-align: left; vertical-align: middle;">
                            <span style="font-size: 20px; font-weight: 800; letter-spacing: -0.5px; color: #FFFFFF; display: block; line-height: 1.2;">
                              Glarus<span style="color: #A78BFA;">Academy</span>
                            </span>
                            <span style="font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 1.5px; color: #F87171; display: block;">
                              Account Security
                            </span>
                          </td>
                        </tr>
                      </table>

                      <h1 style="margin: 0 0 10px; font-size: 24px; font-weight: 800; color: #FFFFFF; letter-spacing: -0.5px;">
                        Password Reset Verification
                      </h1>
                      <p style="margin: 0; font-size: 14px; color: #94A3B8; line-height: 1.5;">
                        We received a request to reset the password for your GlarusAcademy account. Enter the verification code below to proceed.
                      </p>
                    </td>
                  </tr>

                  <!-- Divider -->
                  <tr>
                    <td style="padding: 0 40px;">
                      <div style="height: 1px; background: linear-gradient(90deg, transparent, rgba(148, 163, 184, 0.15), transparent);"></div>
                    </td>
                  </tr>

                  <!-- OTP Content Section -->
                  <tr>
                    <td style="padding: 32px 40px 24px;">
                      
                      <!-- OTP Box -->
                      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(180deg, #161D33 0%, #0E1322 100%); border: 1.5px dashed rgba(248, 113, 113, 0.5); border-radius: 16px; margin: 0 0 20px; box-shadow: inset 0 2px 8px rgba(0,0,0,0.4);">
                        <tr>
                          <td style="padding: 28px 16px; text-align: center;">
                            <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: #FCA5A5; margin-bottom: 12px;">
                              Password Reset OTP
                            </div>
                            <!-- OTP Code Display -->
                            <div style="font-family: 'SFMono-Regular', Consolas, 'Courier New', monospace; font-size: 40px; font-weight: 800; letter-spacing: 12px; color: #F8FAFC; text-shadow: 0 0 24px rgba(248, 113, 113, 0.6); padding-left: 12px; line-height: 1;">
                              ${otp}
                            </div>
                          </td>
                        </tr>
                      </table>

                      <!-- Expiry & Security Badge -->
                      <table role="presentation" align="center" cellpadding="0" cellspacing="0" style="margin: 0 auto 28px;">
                        <tr>
                          <td style="background-color: rgba(239, 68, 68, 0.12); border: 1px solid rgba(239, 68, 68, 0.25); border-radius: 30px; padding: 6px 16px; text-align: center;">
                            <span style="font-size: 12px; font-weight: 600; color: #FCA5A5; display: inline-flex; align-items: center;">
                              ⏱ Expires in <strong style="color: #FFFFFF; margin-left: 4px;">10 minutes</strong>
                            </span>
                          </td>
                        </tr>
                      </table>

                      <!-- Security Notice -->
                      <div style="border-left: 3px solid #EF4444; background-color: rgba(239, 68, 68, 0.06); padding: 14px 16px; border-radius: 0 8px 8px 0; margin-bottom: 16px;">
                        <p style="margin: 0 0 6px; font-size: 13px; font-weight: 700; color: #FCA5A5;">
                          Didn't request a password reset?
                        </p>
                        <p style="margin: 0; font-size: 12px; color: #94A3B8; line-height: 1.5;">
                          If you did not request this, you can safely ignore this email. Your password will remain unchanged, and your account remains secure.
                        </p>
                      </div>

                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="padding: 24px 40px; background-color: #090D18; border-top: 1px solid rgba(255, 255, 255, 0.06); text-align: center;">
                      <p style="margin: 0 0 8px; font-size: 12px; color: #64748B;">
                        Need help? <a href="mailto:support@glarusacademy.com" style="color: #F87171; text-decoration: none;">Contact GlarusAcademy Security Team</a>.
                      </p>
                      <p style="margin: 0; font-size: 11px; color: #475569;">
                        © ${new Date().getFullYear()} GlarusAcademy Inc. • Next-Gen AI EdTech Platform
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
      console.log(`[DEV PASSWORD RESET OTP] for ${email}: ${otp}`);
      return;
    }
    throw error;
  }
}


