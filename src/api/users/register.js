/* eslint-disable camelcase */
const database = require("../../database");
const router = require("express").Router();
const phoneUtil = require("google-libphonenumber").PhoneNumberUtil.getInstance();
const validate = require("../../helpers/validate");
const insertUser = require("../../helpers/insertUser");
const successLoginReturn = require("../../helpers/successLoginReturn");
const Joi = require("../../helpers/phoneJoi");

const schema = Joi.object()
  .keys({
    name: Joi.string()
      .min(3)
      .max(70)
      .required(),
    password: Joi.string()
      .min(6)
      .regex(/[a-z]/)
      .regex(/[A-Z]/)
      .regex(/\d+/)
      .required(),
    email: Joi.string()
      .email()
      .required(),
    phone: Joi.string()
    .phone()
      .required(),
    dateOfBirth: Joi.date()
      .iso()
      .min("1920-01-01")
      .required(),
    gender: Joi.string()
      .valid("female", "male", "other")
      .required(),
    referrerCode: Joi.string().optional()
  })
  .required();

router.post("/users/register", validate(schema), async (req, res, next) => {
  const client = await database.connect();
  try {
    const userId = await insertUser(req, "site");
    const { rows: response } = await client.query(`SELECT *
                                                   FROM users
                                                   WHERE id = $1`, [userId]);
    req.user = response[0];
    let return_data = successLoginReturn(req);
    res.status(200).json(return_data);
  } catch (error) {
    await client.query("ROLLBACK");
    console.error(error);
    if (
      error.constraint === "users_email_key" ||
      error.constraint === "users_phone_key"
    ) {
      return res.status(422).send("User already exists");
    }

    return res.status(500).send("Internal Server Error");
  } finally {
    client.release();
  }
});

module.exports = router;
