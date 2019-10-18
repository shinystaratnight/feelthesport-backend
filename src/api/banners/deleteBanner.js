const router = require("express").Router();
const database = require("../../database");
const validate = require("../../helpers/validate");
const Joi = require("joi");

const schema = Joi.object()
  .keys({
    bannerId: Joi.number()
      .integer()
      .min(1)
      .required()
  })
  .required();

router.delete("/banners", validate(schema), async (req, res) => {
  const client = await database.connect();
  try {
    const { bannerId } = req.body;

    await client.query(`DELETE FROM banners WHERE id = $1`, [bannerId]);

    res.send("deleted banner");
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal Server Error");
  } finally {
    client.release();
  }
});

module.exports = router;
