const router = require("express").Router();
const database = require("../../database");
const validate = require("../../helpers/validate");
const Joi = require("joi");

const schema = Joi.object()
  .keys({
    organizerId: Joi.number()
      .integer()
      .min(1)
      .required()
  })
  .required();

router.delete("/organizers", validate(schema), async (req, res) => {
  const client = await database.connect();
  try {
    const { organizerId } = req.body;

    await client.query(`DELETE FROM organizers WHERE id = $1`, [organizerId]);

    res.send("deleted organizer");
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal Server Error");
  } finally {
    client.release();
  }
});

module.exports = router;
