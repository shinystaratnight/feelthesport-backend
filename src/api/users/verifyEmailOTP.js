const router = require("express").Router();
const validate = require("../../helpers/validate");
const Joi = require("joi");
const otp = require('../../helpers/otpEmail');
const database = require("../../database");
const successLoginReturn = require("../../helpers/successLoginReturn");
const schema = Joi.object()
  .keys({
    email: Joi.string()
      .email()
      .required(),
    otp: Joi.string()
      .required()
  })
  .required();

router.post("/verifyOTPEmail", validate(schema), async (req, res) => {
  const client = await database.connect();
  try {
    const otpVerifyResult = await otp.verify(req.body.email, req.body.otp);
    if (otpVerifyResult.type === "success") {
      if (otpVerifyResult.user.email_verify === false) {
        await client.query(
            `UPDATE
                 users
             SET email_verify = true
             WHERE id = $1`,
          [otpVerifyResult.user.id]
        );
        otpVerifyResult.user.email_verify = true;
      }
      req.user = otpVerifyResult.user;
      let return_data = successLoginReturn(req);
      return res.json(return_data);
    } else {
      return res.status(422).send("Invalid OTP Code.");
    }
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal Server Error");
  } finally {
    await client.release();
  }
});

module.exports = router;
