
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT) || 465,
  secure: process.env.SMTP_SECURE !== "false",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function verifyEmailService() {
  try {
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

  return transporter.sendMail({
    from: `"SkillSwap" <${process.env.SMTP_USER}>`,
    to,
    subject,
    text,
    html,
  });
}

module.exports = {
  transporter,
  verifyEmailService,
  sendEmail,
};
