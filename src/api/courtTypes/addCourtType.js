const router = require("express").Router();
const database = require("../../database");
const validate = require("../../helpers/validate");
const Joi = require("joi");

const schema = Joi.object()
  .keys({
    courtType: Joi.string().required()
  })
  .required();

router.post("/courtTypes", validate(schema), async (req, res) => {
  const client = await database.connect();
  try {
    const { courtType } = req.body;

    await client.query(`INSERT INTO court_types (type) VALUES ($1)`, [
      courtType
    ]);

    res.send("added court type");
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal Server Error");
  } finally {
    client.release();
  }
});

module.exports = router;
