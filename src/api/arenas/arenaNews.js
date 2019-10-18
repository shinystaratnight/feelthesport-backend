const router = require("express").Router();
const database = require("../../database");
const phoneUtil = require("google-libphonenumber").PhoneNumberUtil.getInstance();
const validate = require("../../helpers/validate");
const Joi = require("joi");

router.put("/arenaNews", validate(schema), async (req, res) => {
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

  const client = await database.connect();
  try {
    const { arenaId, achievements, news } = req.body;

    if (achievements) {
      // await client.query(`DELETE FROM arena_facilities where arena = $1`, [
      //   arenaId
      // ]);
      // for await (const facility of facilities) {
      //   await client.query(`INSERT INTO arena_facilities (arena, facility)`, [
      //     arenaId,
      //     facility
      //   ]);
      // }
    }
    if (news) {
      // await client.query(`DELETE FROM arena_facilities where arena = $1`, [
      //   arenaId
      // ]);
      // for await (const facility of facilities) {
      //   await client.query(`INSERT INTO arena_facilities (arena, facility)`, [
      //     arenaId,
      //     facility
      //   ]);
      // }
    }
    res.send("added arena news details");
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal Server Error");
  } finally {
    client.release();
  }
});

module.exports = router;
