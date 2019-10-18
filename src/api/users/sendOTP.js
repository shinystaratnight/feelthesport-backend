const router = require("express").Router();
const otpMobile = require('../../helpers/otpMobile');
const otpEmail = require('../../helpers/otpEmail');
const database = require("../../database");
const validate = require("../../helpers/validate");
const Joi = require("joi");

const schema = Joi.object()
  .keys({
    mobile_email: Joi.string()
      .required("Phone number or email is required to send OTP")
  })
  .required();

router.post("/sendOTP", validate(schema), async (req, res) => {
  const client = await database.connect();
  try {
    const { rows: response } = await client.query(
        `SELECT *
         FROM users
         WHERE phone = $1
            or email = $2
      `, [req.body.mobile_email, req.body.mobile_email]);
    if (response.length === 1) {
      let otpSentResult = {};
      if(req.body.mobile_email === response[0].email){
        otpSentResult = await otpEmail.send(req.body.mobile_email);
      }
      if(req.body.mobile_email === response[0].phone){
        otpSentResult = await otpMobile.send(req.body.mobile_email);
      }
      console.log(otpSentResult)
      if (otpSentResult.type === "success") {
        return res.json({type: "success",msg: "OTP Sent successfully"});
      } else {
        return res.status(500).send("Internal Server Error");
      }
    } else {
      return res.status(422).send("Invalid Phone Number or Email Address");
    }
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal Server Error");
  } finally {
    await client.release();
  }
});

module.exports = router;


