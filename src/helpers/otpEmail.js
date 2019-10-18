const generateOTP = require("../helpers/generateOTPCode");
const database = require("../database");
const sendEmail = require("../helpers/sendEmail");

module.exports.send = async (email) => {
  const client = await database.connect();
  let gOtp = generateOTP();
  await client.query(
      `UPDATE
           users
       SET email_verify_code = $1
       WHERE email = $2`,
    [gOtp, email]
  );

  const emailResponse = await sendEmail({
    to: email,
    subject: "✔ FTS OTP",
    text: "Your OTP is " + gOtp,
    html: "<b>Your OTP is " + gOtp + "</b>"
  });

  let returndata = { "type": "success", ...emailResponse }
  return returndata;
}

module.exports.verify = async (email, otp) => {
  const client = await database.connect();
  let { rows: finalResponse } = await client.query(
      `SELECT *
       FROM users
       WHERE email = $1
         and email_verify_code = $2`,
    [email, otp]
  );
  if (finalResponse.length === 1) {
    return { "type": "success", user: finalResponse[0] };
  } else {
    return { "type": "error" };
  }
};

