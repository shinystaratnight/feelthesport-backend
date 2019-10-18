const router = require("express").Router();
const passport = require('passport');
const successLoginReturn = require("../../helpers/successLoginReturn");
const database = require("../../database");
const validate = require("../../helpers/validate");
const Joi = require("joi")
const otp = require('../../helpers/otpEmail');

const schema = Joi.object()
  .keys({
    email: Joi.string()
      .email()
      .required("Email address is required to send OTP")
  })
  .required();

router.post("/users/sendEmailVerifyOTP", validate(schema), passport.authenticate('jwt'), async (req, res) => {
  const client = await database.connect();
  try {
    const { rows: response } = await client.query(
        `SELECT *
         FROM users
         WHERE email = $1
           and id != $2`, [req.body.email, req.user.id]);
    if (response.length === 0) {
      if (req.body.email != req.user.email) {
        await client.query(
            `UPDATE
                 users
             SET email = $1
             WHERE id = $2`,
          [req.body.email, req.user.id]
        );
        req.user.email = req.body.email;
      }
      let otpSentResult = await otp.send(req.body.email);
      console.log(otpSentResult)
      if (otpSentResult.type === "success") {
        let return_data = successLoginReturn(req);
        return res.json(return_data);
      } else {
        return res.status(500).send("Internal Server Error");
      }
    } else {
      return res.status(422).send("The Email belongs to another user");
    }
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal Server Error");
  } finally {
    await client.release();
  }

});

module.exports = router;


