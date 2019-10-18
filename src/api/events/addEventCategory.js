/* eslint-disable camelcase */
const database = require("../../database");
const router = require("express").Router();
const validate = require("../../helpers/validate");
const Joi = require("joi");

const schema = Joi.object()
  .keys({
    eventId: Joi.number()
      .integer()
      .min(1)
      .required(),
    name: Joi.string()
      .min(3)
      .required(),
    description: Joi.string()
      .min(3)
      .max(30)
      .required(),
    price: Joi.number()
      .integer()
      .min(0)
      .required()
  })
  .required();

router.post("/eventCategories", validate(schema), async (req, res) => {
  const client = await database.connect();
  try {
    const { eventId, name, description, price } = req.body;

    await client.query(
      `INSERT INTO event_categories
      (event, name, description, price)
      VALUES ($1, $2, $3, $4)`,
      [eventId, name, description, price]
    );

    res.status(200).send("added event category");
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal Server Error");
  } finally {
    client.release();
  }
});

module.exports = router;
