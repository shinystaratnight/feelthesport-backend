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
    facilities: Joi.array()
      .items(Joi.string().required())
      .min(1)
      .unique()
      .optional()
  })
  .required();

router.put("/arenaGallery", validate(schema), async (req, res) => {
  const client = await database.connect();
  try {
    const { arenaId, facilities } = req.body;

    await client.query(`DELETE FROM arena_facilities where arena = $1`, [
      arenaId
    ]);

    for await (const facility of facilities) {
      await client.query(
        `INSERT INTO arena_facilities (arena, facility) VALUES ($1, $2)`,
        [arenaId, facility]
      );
    }

    res.status(200).send("updated arena facilities");
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal Server Error");
  } finally {
    client.release();
  }
});

module.exports = router;
