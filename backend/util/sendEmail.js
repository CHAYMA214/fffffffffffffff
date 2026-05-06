const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'chaymabaklouti59@gmail.com',     
      pass: 'zxbi gyoa qwzr oiwx'    }
  });

  const mailOptions = {
    from: '"RE App" <no-reply@reapp.com>',
    to: options.email,
    subject: options.subject,
    html: options.message
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
