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
    partners: Joi.array()
      .items(
        Joi.string()
          .uri()
          .required()
      )
      .min(1)
      .unique()
      .optional()
  })
  .required();

router.put("/arenaPartners", validate(schema), async (req, res) => {
  const client = await database.connect();
  try {
    const { arenaId, partners } = req.body;

    await client.query(
      `UPDATE arenas SET partners = $2, updated_at = NOW()
      WHERE id = $1`,
      [arenaId, partners]
    );

    res.status(200).send("updated arena partners");
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal Server Error");
  } finally {
    client.release();
  }
});

module.exports = router;
