import fs from 'fs';
import path from 'path';

// Parse .env manually
const envPath = path.resolve(__dirname, '../.env');
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const match = trimmed.match(/^([\w.-]+)\s*=\s*(.*)$/);
    if (match) {
      let val = match[2].trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      process.env[match[1]] = val;
    }
  }
}

async function main() {
  console.log('Using SMTP configuration:');
  console.log('  SMTP_HOST:', process.env.SMTP_HOST);
  console.log('  SMTP_PORT:', process.env.SMTP_PORT);
  console.log('  SMTP_USER:', process.env.SMTP_USER);
  console.log('  SMTP_PASS:', process.env.SMTP_PASS ? '********' : 'NOT SET');
  console.log('  SMTP_FROM:', process.env.SMTP_FROM);

  const { sendSignupOTP } = await import('../src/lib/email');

  const testEmail = 'vaibhavgupta1148@gmail.com';
  const testOtp = '849201';

  console.log(`\n📧 Sending test OTP email to: ${testEmail}...`);
  const startTime = Date.now();
  await sendSignupOTP(testEmail, testOtp);
  const duration = Date.now() - startTime;
  console.log(`\n✅ Email successfully sent via Gmail SMTP in ${duration}ms!`);
  console.log(`Check your inbox at ${testEmail} (including Spam/Updates folder if not in Primary).`);
}

main().catch(err => {
  console.error('❌ Failed to send email:', err);
  process.exit(1);
});
