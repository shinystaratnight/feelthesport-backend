const router = require("express").Router();
const database = require("../../database");
const validate = require("../../helpers/validate");
const Joi = require("joi");

const schema = Joi.object()
  .keys({
    city: Joi.string().required()
  })
  .required();

router.post("/cities", validate(schema), async (req, res) => {
  const client = await database.connect();
  try {
    const { city } = req.body;

    await client.query(`INSERT INTO cities (city) VALUES ($1)`, [city]);

    res.send("added city");
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal Server Error");
  } finally {
    client.release();
  }
});

module.exports = router;
