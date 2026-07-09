const nodemailer = require('nodemailer');

const hasEmailConfig = () => {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_PORT && process.env.NOTIFICATION_EMAIL_TO);
};

const createTransporter = () => {
  if (!hasEmailConfig()) return null;

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === 'true',
    auth: process.env.SMTP_USER && process.env.SMTP_PASS ? {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    } : undefined,
  });
};

const sendNotificationEmail = async (notification) => {
  const transporter = createTransporter();
  if (!transporter) return false;

  await transporter.sendMail({
    from: process.env.NOTIFICATION_EMAIL_FROM || process.env.SMTP_USER,
    to: process.env.NOTIFICATION_EMAIL_TO,
    subject: notification.title,
    text: notification.message,
  });

  return true;
};

module.exports = { sendNotificationEmail };
