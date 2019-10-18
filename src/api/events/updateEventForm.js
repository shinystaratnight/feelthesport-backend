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
    formId: Joi.number()
      .integer()
      .min(1)
      .required()
  })
  .required();

router.put("/eventForms", validate(schema), async (req, res) => {
  const client = await database.connect();
  try {
    const { eventId, formId } = req.body;

    await client.query(
      `UPDATE events SET form = $2, updated_at = NOW()
      WHERE id = $1`,
      [eventId, formId]
    );

    res.status(200).send("updated event form");
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal Server Error");
  } finally {
    client.release();
  }
});

module.exports = router;
