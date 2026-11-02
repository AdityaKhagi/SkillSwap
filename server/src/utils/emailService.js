const nodemailer = require("nodemailer");

const smtpPort = Number(process.env.SMTP_PORT || 465);

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: smtpPort,
  secure: smtpPort === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  connectionTimeout: 15000,
  greetingTimeout: 10000,
  socketTimeout: 20000,
});

async function verifyEmailService() {
  try {
    await transporter.verify();
    console.log("Email service connected successfully!");
    return true;
  } catch (error) {
    console.error("Email service connection failed:", error.message);
    return false;
  }
}

async function sendEmail({ to, subject, html, text }) {
  if (!to || !subject || (!html && !text)) {
    throw new Error("Recipient, subject and email content are required.");
  }

  try {
    const info = await transporter.sendMail({
      from: `"Skill?" <${process.env.SMTP_USER}>`,
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