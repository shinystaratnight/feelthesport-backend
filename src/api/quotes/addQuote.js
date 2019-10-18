const router = require("express").Router();
const database = require("../../database");
const Joi = require("joi");
const validate = require("../../helpers/validate");

const schema = Joi.object()
  .keys({
    quote: Joi.string()
      .min(10)
      .required()
  })
  .required();

router.post("/quotes", validate(schema), async (req, res) => {
  const client = await database.connect();
  try {
    const { quote } = req.body;

    await client.query(`INSERT INTO quotes (quote) VALUES ($1)`, [quote]);

    res.send("added quote");
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal Server Error");
  } finally {
    client.release();
  }
});

module.exports = router;
