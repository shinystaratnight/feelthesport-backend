const router = require("express").Router();
const database = require("../../database");
const validate = require("../../helpers/validate");
const Joi = require("joi");

const schema = Joi.object()
  .keys({
    arenaId: Joi.number()
      .integer()
      .min(1)
      .required(),
    title: Joi.string()
      .min(3)
      .required(),
    body: Joi.string()
      .min(20)
      .required(),
    image: Joi.string()
      .uri()
      .optional()
  })
  .required();

router.post("/achievements", validate(schema), async (req, res) => {
  const client = await database.connect();
  try {
    const { arenaId, title, body, image } = req.body;

    await client.query(
      `INSERT INTO achievements (arena, title, body, image) VALUES
    ($1, $2, $3, $4)`,
      [arenaId, title, body, image]
    );

    res.send("added achievements");
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal Server Error");
  } finally {
    client.release();
  }
});

module.exports = router;
