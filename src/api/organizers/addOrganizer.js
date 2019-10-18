const router = require("express").Router();
const database = require("../../database");
const validate = require("../../helpers/validate");
const Joi = require("joi");

const schema = Joi.object()
  .keys({
    arenaId: Joi.number()
      .integer()
      .min(1)
      .optional(),
    organizer: Joi.string()
      .min(3)
      .optional()
  })
  .xor("arenaId", "organizer")
  .required();

router.post("/organizers", validate(schema), async (req, res) => {
  const client = await database.connect();
  try {
    const { arenaId, organizer } = req.body;

    if (arenaId) {
      await client.query(`INSERT INTO organizers (arena) VALUES ($1)`, [
        arenaId
      ]);
    } else {
      await client.query(`INSERT INTO organizers (organizer) VALUES ($1)`, [
        organizer
      ]);
    }

    res.send("added organizer");
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal Server Error");
  } finally {
    client.release();
  }
});

module.exports = router;
