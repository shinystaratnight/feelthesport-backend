const router = require("express").Router();
const database = require("../../database");
const validate = require("../../helpers/validate");
const Joi = require("joi");

const schema = Joi.object()
  .keys({
    arenaId: Joi.number()
      .integer()
      .min(1)
      .required()
  })
  .required();

router.delete("/arena", validate(schema), async (req, res) => {
  const client = await database.connect();
  try {
    const { arenaId } = req.body;

    await client.query(`DELETE FROM arenas WHERE id = $1`, [arenaId]);

    res.send("deleted arena");
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal Server Error");
  } finally {
    client.release();
  }
});

module.exports = router;
