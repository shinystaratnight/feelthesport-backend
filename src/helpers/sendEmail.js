const nodemailer = require("nodemailer");


module.exports = async  ({to,subject,text,html} ) => {
  try{
    //let testAccount = await nodemailer.createTestAccount();
    let transporter = nodemailer.createTransport({
      // host: "smtp.ethereal.email",
      // port: 587,
      // secure: false,
      // auth: {
      //   user: testAccount.user,
      //   pass: testAccount.pass
      // }
      host: "host13.registrar-servers.com",
      port: process.env.SMTP_PORT,
      secure: true,
      auth: {
        user: process.env.SMTP_USERNAME,
        pass: process.env.SMTP_PASSWORD
      }
    });

    const emailResponse = await transporter.sendMail({
      from: process.env.SMTP_USERNAME,
      to,
      subject,
      text,
      html
    });
    return  emailResponse;
  }
  catch (e) {
    console.log(e)
  }
};
