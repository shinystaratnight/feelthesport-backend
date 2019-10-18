const router = require("express").Router();
const database = require("../../database");
const validate = require("../../helpers/validate");
const Joi = require("joi");

const schema = Joi.object()
  .keys({
    bannerId: Joi.number()
      .integer()
      .min(1)
      .required(),
    hidden: Joi.boolean().required()
  })
  .required();

router.put("/banners", validate(schema), async (req, res) => {
  const client = await database.connect();
  try {
    const { bannerId, hidden } = req.body;

    await client.query(
      `UPDATE banners SET hidden = $2, updated_at = NOW()
      WHERE id = $1`,
      [bannerId, hidden]
    );

    res.send("updated banner");
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal Server Error");
  } finally {
    client.release();
  }
});

module.exports = router;
