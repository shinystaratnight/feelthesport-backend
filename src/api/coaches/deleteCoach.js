const router = require("express").Router();
const database = require("../../database");
const validate = require("../../helpers/validate");
const Joi = require("joi");

const schema = Joi.object()
  .keys({
    coachId: Joi.number()
      .integer()
      .min(1)
      .required()
  })
  .required();

router.delete("/coaches", validate(schema), async (req, res) => {
  const client = await database.connect();
  try {
    const { coachId } = req.body;

    await client.query(`DELETE FROM coaches WHERE id = $1`, [coachId]);

    res.send("deleted coach");
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal Server Error");
  } finally {
    client.release();
  }
});

module.exports = router;
