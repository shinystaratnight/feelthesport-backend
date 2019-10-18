const router = require("express").Router();
const database = require("../../database");
const phoneUtil = require("google-libphonenumber").PhoneNumberUtil.getInstance();
const validate = require("../../helpers/validate");
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
    arenaId: Joi.number()
      .integer()
      .min(1)
      .required(),
    address: Joi.string().optional(),
    gallery: Joi.array()
      .items(
        Joi.string()
          .uri()
          .required()
      )
      .min(1)
      .unique()
      .optional(),
    workingDays: Joi.array()
      .items(
        Joi.string()
          .valid("sun", "mon", "tue", "wed", "thu", "fri", "sat")
          .required()
      )
      .min(1)
      .max(7)
      .unique()
      .optional(),
    facilities: Joi.array()
      .items(Joi.string().required())
      .min(1)
      .unique()
      .optional(),
    phone: Joi.string()
      .phone()
      .optional(),
    email: Joi.string()
      .email()
      .optional(),
    socialMedia: Joi.array()
      .items(
        Joi.string()
          .uri()
          .required()
      )
      .min(1)
      .unique()
      .optional(),
    boardMembers: Joi.array()
      .items(
        Joi.number()
          .integer()
          .min(1)
          .required()
      )
      .min(1)
      .unique()
      .optional(),
    coaches: Joi.array()
      .items(
        Joi.number()
          .integer()
          .min(1)
          .required()
      )
      .min(1)
      .unique()
      .optional(),
    partners: Joi.array()
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

router.put("/arenaAbout", validate(schema), async (req, res) => {
  const client = await database.connect();
  try {
    const {
      arenaId,
      address,
      gallery,
      workingDays,
      facilities,
      phone,
      email,
      socialMedia,
      boardMembers,
      coaches,
      partners,
      termsAndConditions
    } = req.body;

    if (address) {
      await client.query(`UPDATE arenas SET address = $2 WHERE id = $1`, [
        arenaId,
        address
      ]);
    }
    if (gallery) {
      await client.query(`UPDATE arenas SET gallery = $2 WHERE id = $1`, [
        arenaId,
        gallery
      ]);
    }
    if (workingDays) {
      await client.query(`UPDATE arenas SET working_days = $2 WHERE id = $1`, [
        arenaId,
        workingDays
      ]);
    }
    if (facilities) {
      await client.query(`DELETE FROM arena_facilities where arena = $1`, [
        arenaId
      ]);
      for await (const facility of facilities) {
        await client.query(`INSERT INTO arena_facilities (arena, facility)`, [
          arenaId,
          facility
        ]);
      }
    }
    if (phone) {
      await client.query(`UPDATE arenas SET phone = $2 WHERE id = $1`, [
        arenaId,
        phone
      ]);
    }
    if (email) {
      await client.query(`UPDATE arenas SET email = $2 WHERE id = $1`, [
        arenaId,
        email
      ]);
    }
    if (socialMedia) {
      await client.query(`UPDATE arenas SET social_media = $2 WHERE id = $1`, [
        arenaId,
        socialMedia
      ]);
    }
    if (partners) {
      await client.query(`UPDATE arenas SET partners = $2 WHERE id = $1`, [
        arenaId,
        partners
      ]);
    }
    if (termsAndConditions) {
      await client.query(
        `UPDATE arenas SET terms_and_conditions = $2 WHERE id = $1`,
        [arenaId, termsAndConditions]
      );
    }
    res.send("updated arena about details");
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal Server Error");
  } finally {
    client.release();
  }
});

module.exports = router;
