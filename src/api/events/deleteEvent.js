const router = require("express").Router();
const database = require("../../database");
const validate = require("../../helpers/validate");
const Joi = require("joi");

const schema = Joi.object()
  .keys({
    eventId: Joi.number()
      .integer()
      .min(1)
      .required()
  })
  .required();

router.delete("/events", validate(schema), async (req, res) => {
  const client = await database.connect();
  try {
    const { eventId } = req.body;

    await client.query(`DELETE FROM events WHERE id = $1`, [eventId]);

    res.send("deleted event");
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal Server Error");
  } finally {
    client.release();
  }
});

module.exports = router;
