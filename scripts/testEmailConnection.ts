import nodemailer from 'nodemailer';

async function verifyEmailSetup() {
  console.log('🔍 Checking SMTP Email Configuration...');
  console.log('----------------------------------------');
  console.log('SMTP_HOST  :', process.env.SMTP_HOST || 'smtp.gmail.com');
  console.log('SMTP_PORT  :', process.env.SMTP_PORT || '587');
  console.log('SMTP_USER  :', process.env.SMTP_USER || '(NOT SET)');
  console.log('SMTP_PASS  :', process.env.SMTP_PASS ? `[Configured: ${process.env.SMTP_PASS.length} chars]` : '(NOT SET)');
  console.log('SMTP_FROM  :', process.env.SMTP_FROM || '(Default)');
  console.log('----------------------------------------');

  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.error('❌ Error: SMTP_USER or SMTP_PASS is missing in .env!');
    console.log('👉 Please set SMTP_USER and SMTP_PASS in your frontend/.env file.');
    process.exit(1);
  }

  const cleanPass = process.env.SMTP_PASS.replace(/\s+/g, '');
  const port = parseInt(process.env.SMTP_PORT || '587');
  const isSecure = process.env.SMTP_SECURE === 'true' || port === 465;

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port,
    secure: isSecure,
    auth: {
      user: process.env.SMTP_USER.trim(),
      pass: cleanPass,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  try {
    console.log('📡 Connecting to SMTP server...');
    await transporter.verify();
    console.log('✅ SUCCESS: SMTP server is connected and credentials are valid!');
    console.log('🎉 Your emails will send smoothly.');
  } catch (err: any) {
    console.error('❌ SMTP Connection Failed:', err.message);
    console.log('\n💡 Quick Solutions:');
    console.log(' 1. Make sure 2-Step Verification is ON in your Google Account.');
    console.log(' 2. Generate a new Google App Password:');
    console.log('    https://myaccount.google.com/apppasswords');
    console.log(' 3. Update SMTP_PASS="your 16-char app password" in frontend/.env');
    console.log(' 4. Restart the Next.js server with: npm run dev');
  }
}

verifyEmailSetup();
