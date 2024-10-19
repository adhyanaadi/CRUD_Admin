const nodeMailer = require("nodemailer");
require("dotenv").config();
const { SMTP_HOST, SMTP_PORT ,SMTP_SERVICES, SMTP_MAIL, SMTP_PASSWORD } = require('../config/keys');
console.log(SMTP_HOST , SMTP_PORT, SMTP_SERVICES , SMTP_MAIL , SMTP_PASSWORD);
const sendEmail = async (options) => {
  const transporter = nodeMailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    service: SMTP_SERVICES,
    auth: {
      user: SMTP_MAIL,
      pass: SMTP_PASSWORD,
    },
  });
  const mailOptions = {
    from: SMTP_MAIL,
    to: options.email,
    subject: options.subject,
    html: options.message_Content,
  };
  // const mailInfo = transporter.sendMail(mailOptions, (error, result) => {
  //   if (error) {
  //     console.log('error');
  //     // console.log(process.env.SMTP_HOST,process.env.SMPT_SERVICES);
  //   }
  // });

  // console.log(mailInfo);

  transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });

};

module.exports = sendEmail;