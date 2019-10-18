const router = require("express").Router();
const database = require("../../database");
const validate = require("../../helpers/validate");
const Joi = require("joi");

const schema = Joi.object()
  .keys({
    city: Joi.string().required(),
    area: Joi.string().required()
  })
  .required();

router.post("/areas", validate(schema), async (req, res) => {
  const client = await database.connect();
  try {
    const { city, area } = req.body;

    await client.query(`INSERT INTO areas (city, area) VALUES ($1, $2)`, [
      city,
      area
    ]);

    res.send("added area");
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal Server Error");
  } finally {
    client.release();
  }
});

module.exports = router;
