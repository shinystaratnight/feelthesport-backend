const router = require("express").Router();
const validate = require("../../helpers/validate");
const Joi = require("../../helpers/phoneJoi");
const otpMobile = require('../../helpers/otpMobile');
const otpEmail = require('../../helpers/otpEmail');
const database = require("../../database");
const successLoginReturn = require("../../helpers/successLoginReturn");
const schema = Joi.object()
  .keys({
    mobile_email: Joi.string()
      .required(),
    otp: Joi.string()
      .required()
  })
  .required();

router.post("/verifyOTP", validate(schema), async (req, res) => {
  const client = await database.connect();
  try {
    const { rows: response } = await client.query(
        `SELECT *
         FROM users
         WHERE phone = $1
            or email = $2
      `, [req.body.mobile_email, req.body.mobile_email]);
    if (response.length === 1) {
      let otpVerifyResult = {};
      if (req.body.mobile_email === response[0].email) {
        otpVerifyResult = await otpEmail.verify(req.body.mobile_email, req.body.otp);
      }
      if (req.body.mobile_email === response[0].phone) {
        otpVerifyResult = await otpMobile.verify(req.body.mobile_email, req.body.otp);
      }
      console.log(otpVerifyResult)
      if (otpVerifyResult.type === "success") {
        req.user = response[0];
        let return_data = successLoginReturn(req);
        return res.json(return_data);
      } else {
        return res.status(422).send("Invalid Phone Number or Email Address or OTP");
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
