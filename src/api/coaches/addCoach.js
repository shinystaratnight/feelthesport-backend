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
    name: Joi.string()
      .min(3)
      .required(),
    position: Joi.string()
      .min(3)
      .required(),
    socialMedia: Joi.array()
      .items(
        Joi.string()
          .uri()
          .required()
      )
      .min(1)
      .unique()
      .optional(),
    avatar: Joi.string()
      .uri()
      .optional()
  })
  .required();

router.post("/coaches", validate(schema), async (req, res) => {
  const client = await database.connect();
  try {
    const { arenaId, name, position, socialMedia, avatar } = req.body;

    await client.query(
      `INSERT INTO coaches (arena, name, position, social_media, avatar) VALUES
    ($1, $2, $3, $4, $5)`,
      [arenaId, name, position, socialMedia, avatar]
    );

    res.send("added coach");
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal Server Error");
  } finally {
    client.release();
  }
});

module.exports = router;
