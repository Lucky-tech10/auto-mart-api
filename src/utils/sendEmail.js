const nodemailer = require("nodemailer");
const nodemailerConfig = require("../config/nodemailer");

const sendEmail = async ({ to, subject, html }) => {
  const transporter = nodemailer.createTransport(nodemailerConfig);

  return transporter.sendMail({
    from: `"AutoMart Support" <${process.env.EMAIL_USER}>`, // sender address
    to,
    subject,
    html,
  });
};

module.exports = sendEmail;
