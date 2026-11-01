const nodemailer = require("nodemailer");

const smtpPort = Number(process.env.SMTP_PORT || 465);

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: smtpPort,
  secure:
    process.env.SMTP_SECURE === undefined
      ? smtpPort === 465
      : process.env.SMTP_SECURE === "true",

  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },

  connectionTimeout: 15000,
  greetingTimeout: 10000,
  socketTimeout: 20000,

  pool: false,
});

async function verifyEmailService() {
  try {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      throw new Error("SMTP_USER or SMTP_PASS is missing.");
    }

    await transporter.verify();

    console.log("SkillSwap email service connected successfully!");
    return true;
  } catch (error) {
    console.error("Email service connection failed:", error.message);
    return false;
  }
}

async function sendEmail({ to, subject, html, text }) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    throw new Error("Email credentials are not configured.");
  }

  if (!to || !subject || (!html && !text)) {
    throw new Error("Recipient, subject and email content are required.");
  }

  try {
    const info = await transporter.sendMail({
      from: `"SkillSwap" <${process.env.SMTP_USER}>`,
      to,
      subject,
      text,
      html,
    });

    console.log("Email sent successfully:", info.messageId);
    return info;
  } catch (error) {
    console.error("Email sending failed:", error.message);
    throw error;
  }
}

module.exports = {
  transporter,
  verifyEmailService,
  sendEmail,
};