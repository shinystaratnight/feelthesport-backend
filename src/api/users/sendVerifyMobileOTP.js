const router = require("express").Router();
const passport = require('passport');
const successLoginReturn = require("../../helpers/successLoginReturn");
const otp = require('../../helpers/otpMobile');
const database = require("../../database");
const validate = require("../../helpers/validate");
const Joi = require("../../helpers/phoneJoi");

const schema = Joi.object()
  .keys({
    phone: Joi.string()
      .phone()
      .required("Phone number is required to send OTP")
  })
  .required();
router.post("/users/sendMobileVerifyOTP", validate(schema), passport.authenticate('jwt'), async (req, res) => {
  const client = await database.connect();
  try {
    const { rows: response } = await client.query(
        `SELECT *
         FROM users
         WHERE phone = $1
           and id != $2`, [req.body.phone, req.user.id]);
    if (response.length === 0) {
      if (req.body.phone != req.user.phone) {
        await client.query(
            `UPDATE
                 users
             SET phone = $1
             WHERE id = $2`,
          [req.body.phone, req.user.id]
        );
        req.user.phone = req.body.phone;
      }
      let otpSentResult = await otp.send(req.body.phone);
      if (otpSentResult.type === "success") {
        let return_data = successLoginReturn(req);
        return res.json(return_data);
      } else {
        return res.status(500).send("Internal Server Error");
      }
    } else {
      return res.status(422).send("The Phone Number belongs to another user");
    }
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal Server Error");
  } finally {
    await client.release();
  }

});

module.exports = router;


