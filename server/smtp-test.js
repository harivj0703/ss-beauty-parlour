const nodemailer = require('nodemailer');

const testSMTP = async () => {
  const host = process.env.EMAIL_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.EMAIL_PORT || '465', 10);
  const user = process.env.EMAIL_USER || 'ssbeautyparlour2528@gmail.com';
  const pass = process.env.EMAIL_PASS || 'cglg uyqo jytu wvmq';

  // Exactly matching the application's logic
  const secure = port === 465;

  console.log('--- SMTP TEST SCRIPT ---');
  console.log(`Host: ${host}`);
  console.log(`Port: ${port}`);
  console.log(`Secure: ${secure}`);

  const config = {
    host,
    port,
    secure,
    auth: { user, pass },
    tls: { rejectUnauthorized: false }
  };

  const transporter = nodemailer.createTransport(config);

  try {
    await transporter.verify();
    console.log('Result: SUCCESS');
  } catch (err) {
    console.log('Result: FAILED');
    console.error('Full Error Object:');
    console.error(err);
  }
  process.exit(0);
};

testSMTP();
