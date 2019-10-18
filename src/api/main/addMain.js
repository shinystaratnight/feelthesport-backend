const router = require("express").Router();
const database = require("../../database");
const validate = require("../../helpers/validate");
const phoneUtil = require("google-libphonenumber").PhoneNumberUtil.getInstance();
const Joi = require("joi").extend(joi => ({
  base: joi.string(),
  name: "string",
  language: {
    phone: "Must be a valid indian phone number"
  },
  rules: [
    {
      name: "phone",
      validate (params, value, state, options) {
        if (isNaN(value)) {
          return this.createError("string.phone", { value }, state, options);
        }
        const validPhone = phoneUtil.isValidNumberForRegion(
          phoneUtil.parseAndKeepRawInput(value, "IN"),
          "IN"
        );
        if (!validPhone) {
          return this.createError("string.phone", { value }, state, options);
        }
        return value;
      }
    }
  ]
}));

const schema = Joi.object()
  .keys({
    phone: Joi.string()
      .phone()
      .required(),
    email: Joi.string()
      .email()
      .required(),
    socialMedia: Joi.array()
      .items(
        Joi.string()
          .uri()
          .required()
      )
      .min(1)
      .unique()
      .optional(),
    termsAndConditions: Joi.array()
      .items(Joi.string().required())
      .min(1)
      .unique()
      .optional()
  })
  .required();

router.post("/main", validate(schema), async (req, res) => {
  const client = await database.connect();
  try {
    const { phone, email, socialMedia, termsAndConditions } = req.body;

    await client.query(
      `INSERT INTO main (phone, email, social_media, terms_and_conditions) VALUES
    ($1, $2, $3, $4)`,
      [phone, email, socialMedia, termsAndConditions]
    );

    res.send("added main");
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal Server Error");
  } finally {
    client.release();
  }
});

module.exports = router;
