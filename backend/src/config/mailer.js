import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// Tạo transporter chỉ 1 lần
const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  secure: false,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

// Kiểm tra kết nối SMTP khi server khởi chạy
transporter.verify((error, success) => {
  if (error) {
    console.error("SMTP connection error:", error);
  } else {
    console.log("SMTP server is ready to take emails");
  }
});

// Hàm gửi mail
export const sendMail = async (to, subject, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"Admin" <${process.env.MAIL_USER}>`,
      to,
      subject,
      html,
    });

    console.log(" Email sent:", info.messageId);
    return true;
  } catch (err) {
    console.error(" Error sending email:", err);
    return false;
  }
};
