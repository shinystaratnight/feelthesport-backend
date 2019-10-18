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

router.delete("/areas", validate(schema), async (req, res) => {
  const client = await database.connect();
  try {
    const { city, area } = req.body;

    await client.query(`DELETE FROM areas WHERE city = $1 AND area = $2`, [
      city,
      area
    ]);

    res.send("deleted area");
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal Server Error");
  } finally {
    client.release();
  }
});

module.exports = router;
