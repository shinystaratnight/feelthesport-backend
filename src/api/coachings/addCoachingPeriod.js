const router = require("express").Router();
const database = require("../../database");
const validate = require("../../helpers/validate");
const Joi = require("joi");

const schema = Joi.object()
  .keys({
    coachingId: Joi.number()
      .integer()
      .min(1)
      .required(),
    period: Joi.number()
      .integer()
      .min(1)
      .required(),
    price: Joi.number()
      .integer()
      .min(0)
      .required()
  })
  .required();

router.post("/coachingPeriods", validate(schema), async (req, res) => {
  const client = await database.connect();
  try {
    const { coachingId, period, price } = req.body;

    await client.query(
      `INSERT INTO arena_coaching_periods
      (coaching, period, price)
      VALUES ($1, $2, $3)
      `,
      [coachingId, period, price]
    );

    res.send("added coaching period");
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal Server Error");
  } finally {
    client.release();
  }
});

module.exports = router;
