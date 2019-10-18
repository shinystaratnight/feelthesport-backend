const router = require("express").Router();
const database = require("../../database");
const validate = require("../../helpers/validate");
const Joi = require("joi");

const schema = Joi.object()
  .keys({
    coachId: Joi.number()
      .integer()
      .min(1)
      .required(),
    position: Joi.string()
      .min(3)
      .optional(),
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

router.put("/coaches", validate(schema), async (req, res) => {
  const client = await database.connect();
  try {
    const { coachId, position, socialMedia, avatar } = req.body;

    await client.query(
      `UPDATE coaches SET position = $2, social_media = $3, avatar = $4, updated_at = NOW()
      WHERE id = $1`,
      [coachId, position, socialMedia, avatar]
    );

    res.send("updated coach");
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal Server Error");
  } finally {
    client.release();
  }
});

module.exports = router;
