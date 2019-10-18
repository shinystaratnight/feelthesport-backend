const router = require("express").Router();
const database = require("../../database");
const validate = require("../../helpers/validate");
const Joi = require("joi");

const schema = Joi.object()
  .keys({
    membershipId: Joi.number()
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

router.post("/membershipPeriods", validate(schema), async (req, res) => {
  const client = await database.connect();
  try {
    const { membershipId, period, price } = req.body;

    await client.query(
      `INSERT INTO arena_membership_periods
      (membership, period, price)
      VALUES ($1, $2, $3)
      `,
      [membershipId, period, price]
    );

    res.send("added membership period");
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal Server Error");
  } finally {
    client.release();
  }
});

module.exports = router;
