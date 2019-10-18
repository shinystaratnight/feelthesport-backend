const router = require("express").Router();
const validate = require("../../helpers/validate");
const Joi = require("../../helpers/phoneJoi");
const otp = require('../../helpers/otpMobile');
const database = require("../../database");
const successLoginReturn = require("../../helpers/successLoginReturn");
const schema = Joi.object()
  .keys({
    phone: Joi.string()
      .phone()
      .required(),
    otp: Joi.string()
      .required()
  })
  .required();
router.post("/verifyOTPMobile", validate(schema), async (req, res) => {
  const client = await database.connect();
  try {
    const otpVerifyResult = await otp.verify(req.body.phone, req.body.otp);
    if (otpVerifyResult.type === "success") {
      let { rows: finalResponse } = await client.query(
          `SELECT *
           FROM users
           WHERE phone = $1`,
        [req.body.phone]
      );
      if (finalResponse.length === 1) {
        if (finalResponse[0].phone_verify === false) {
          await client.query(
              `UPDATE
                   users
               SET phone_verify = true
               WHERE id = $1`,
            [finalResponse[0].id]
          );
          finalResponse[0].phone_verify = true;
        }
        req.user = finalResponse[0];
        let return_data = successLoginReturn(req);
        return res.json(return_data);
      } else {
        return res.status(500).send("Internal Server Error");
      }
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
