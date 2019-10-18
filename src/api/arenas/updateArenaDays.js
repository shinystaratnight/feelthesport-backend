/* eslint-disable camelcase */
const database = require("../../database");
const router = require("express").Router();
const validate = require("../../helpers/validate");
const Joi = require("joi");

const schema = Joi.object()
  .keys({
    arenaId: Joi.number()
      .integer()
      .min(1)
      .required(),
    workingDays: Joi.array()
      .items(
        Joi.string()
          .valid("sun", "mon", "tue", "wed", "thu", "fri", "sat")
          .required()
      )
      .min(1)
      .max(7)
      .unique()
      .optional()
  })
  .required();

router.put("/arenaDays", validate(schema), async (req, res) => {
  const client = await database.connect();
  try {
    const { arenaId, workingDays } = req.body;

    await client.query(
      `UPDATE arenas SET working_days = $2, updated_at = NOW()
      WHERE id = $1`,
      [arenaId, workingDays]
    );

    res.status(200).send("updated arena working days");
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal Server Error");
  } finally {
    client.release();
  }
});

module.exports = router;
