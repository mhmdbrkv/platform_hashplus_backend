import nodemailer from "nodemailer";

import {
  EMAIL_HOST,
  EMAIL_PORT,
  EMAIL_USER,
  EMAIL_PASSWORD,
} from "../config/env.js";

const transporter = nodemailer.createTransport({
  host: EMAIL_HOST,
  port: EMAIL_PORT, //false-587. true-465
  secure: false,
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASSWORD,
  },
});

const sendEmail = async (options) => {
  const emailOptions = {
    from: `Hash Plus <${EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
  };
  //------------------------------------------------//
  await transporter.sendMail(emailOptions);
};

export { sendEmail };
