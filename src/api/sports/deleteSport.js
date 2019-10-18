const router = require("express").Router();
const database = require("../../database");
const validate = require("../../helpers/validate");
const Joi = require("joi");

const schema = Joi.object()
  .keys({
    sport: Joi.string().required()
  })
  .required();

router.delete("/sports", validate(schema), async (req, res) => {
  const client = await database.connect();
  try {
    const { sport } = req.body;

    await client.query(`DELETE FROM sports WHERE sport = $1`, [sport]);

    res.send("deleted sport");
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal Server Error");
  } finally {
    client.release();
  }
});

module.exports = router;
