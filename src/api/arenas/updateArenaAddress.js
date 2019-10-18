/* eslint-disable camelcase */
const database = require("../../database");
const router = require("express").Router();
const validate = require("../../helpers/validate");
const Joi = require("joi");

const schema = Joi.object()
  .keys({
    arenaId: Joi.number()
      .integer()
      .min(1)
      .required(),
    address: Joi.string()
      .min(10)
      .required()
  })
  .required();

router.put("/arenaAddress", validate(schema), async (req, res) => {
  const client = await database.connect();
  try {
    const { arenaId, address } = req.body;

    await client.query(
      `UPDATE arenas SET address = $2, updated_at = NOW()
      WHERE id = $1`,
      [arenaId, address]
    );

    res.status(200).send("updated arena address");
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal Server Error");
  } finally {
    client.release();
  }
});

module.exports = router;
