/* eslint-disable camelcase */
const database = require("../../database");
const router = require("express").Router();
const validate = require("../../helpers/validate");
const Joi = require("joi");

router.put("/arenaAddress", validate(schema), async (req, res) => {
  const schema = Joi.object()
    .keys({
      arenaId: Joi.number()
        .integer()
        .min(1)
        .required(),
      image: Joi.string()
        .uri()
        .required()
    })
    .required();

  const client = await database.connect();
  try {
    const { arenaId, image } = req.body;

    await client.query(
      `UPDATE arenas SET image = $2, updated_at = NOW()
      WHERE id = $1`,
      [arenaId, image]
    );

    res.status(200).send("updated arena image");
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal Server Error");
  } finally {
    client.release();
  }
});

module.exports = router;
