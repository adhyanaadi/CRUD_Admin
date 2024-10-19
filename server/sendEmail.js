// const nodemailer = require("nodemailer");

// const sendEmail = async (options) => {
//   const transporter = nodemailer.createTransport({
//     // secure: true,
//     host: 'smtp.gmail.com',
//     port: 465,
//     // secure: true,
//     auth: {
//       user: 'rupeshrushil@gmail.com',
//       pass: 'sqfzgnwogmidboxt',
//     },
//   });

//   const mailOptions = {
//     from: 'rupeshrushil@gmail.com',
//     to: options.email,
//     subject: options.subject,
//     html: options.message_Content,
//   };
//   console.log(mailOptions)

//   try {
//     const info = await transporter.sendMail(mailOptions);
//     console.log('Email sent: ' + info.response);
//   } catch (error) {
//     console.error('Error sending email:', error);
//   }
// };


// // const demoEmail = async () => {
// //   const emailOptions = {
// //     email: 'aadiadhyan@gmail.com',  // Replace with the recipient's email address
// //     subject: 'Demo Email',
// //     message_Content: `<h1>Hello from Nodemailer!</h1>
// //                       <p>This is a test email sent using <strong>Nodemailer</strong>.</p>`,
// //   };

// //   await sendEmail(emailOptions);
// // };

// // // Call the demo function
// // demoEmail();
// module.exports = sendEmail;





const nodeMailer = require("nodemailer");
const sendEmail = async (options) => {
  console.log(options);
  const transporter = nodeMailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    service: 'gmail',
    auth: {
      user: 'rupeshrushil@gmail.com',
      pass: 'sqfzgnwogmidboxt',
    },
  });
  const mailOptions = {
    from: 'rupeshrushil@gmail.com',
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
const demoEmail = async () => {
  const emailOptions = {
    email: 'aadiadhyan@gmail.com',  // Replace with the recipient's email address
    subject: 'Demo Email',
    message_Content: `<h1>Hello from Nodemailer!</h1>
                      <p>This is a test email sent using <strong>Nodemailer</strong>.</p>`,
  };

  await sendEmail(emailOptions);
};

// Call the demo function
// demoEmail();
module.exports = sendEmail;