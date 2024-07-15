import nodemailer from 'nodemailer';
import { fileURLToPath } from 'url';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const webEmailVerificationTemplatePath = join(
  __dirname,
  'emailTemplates',
  'webEmailVerification.html'
);
const mobileEmailVerificationTemplatePath = join(
  __dirname,
  'emailTemplates',
  'mobileEmailVerification.html'
);

const webEmailVerificationTemplate = readFileSync(
  webEmailVerificationTemplatePath,
  'utf8'
);
const mobileEmailVerificationTemplate = readFileSync(
  mobileEmailVerificationTemplatePath,
  'utf8'
);

const transporter = nodemailer.createTransport({
  host: process.env.HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.SECURE,
  tls: {
    rejectUnauthorized: false,
  },
  auth: {
    user: process.env.USER,
    pass: process.env.PASS,
  },
});

const sendEmailVerificationWeb = async (email, firstName, link) => {
  const webEmailVerificationContent = webEmailVerificationTemplate
    .replace('{{firstName}}', firstName)
    .replace('{{link}}', link);
  try {
    const info = await transporter.sendMail({
      from: 'foodDeleveryApp',
      to: email,
      subject: 'Email verification',
      html: webEmailVerificationContent,
    });

    return info;
  } catch (error) {
    console.log(error);
  }
};

const sendEmailVerificationMobile = async (email, firstName, token) => {
  const mobileEmailVerificationContent = mobileEmailVerificationTemplate
    .replace('{{firstName}}', firstName)
    .replace('{{token}}', token);
  try {
    const info = await transporter.sendMail({
      from: 'foodDeleveryApp',
      to: email,
      subject: 'Email verification',
      html: mobileEmailVerificationContent,
    });

    return info;
  } catch (error) {
    console.log(error);
  }
};

export { sendEmailVerificationWeb, sendEmailVerificationMobile };
