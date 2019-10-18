const router = require("express").Router();
const database = require("../../database");
const validate = require("../../helpers/validate");
const Joi = require("joi");

const schema = Joi.object()
  .keys({
    complexId: Joi.number()
      .integer()
      .min(1)
      .required(),
    addSocialMedia: Joi.string()
      .uri()
      .optional(),
    updateSocialMedia: Joi.string()
      .uri()
      .optional(),
    deleteSocialMedia: Joi.string()
      .uri()
      .optional()
  })
  .or("addSocialMedia", "updateSocialMedia", "deleteSocialMedia")
  .with("updateSocialMedia", "addSocialMedia")
  .without("addSocialMedia", "deleteSocialMedia")
  .without("deleteSocialMedia", ["addSocialMedia", "updateSocialMedia"])
  .required();

router.post("/complexSocialMedia", validate(schema), async (req, res) => {
  const client = await database.connect();
  try {
    const {
      complexId,
      addSocialMedia,
      updateSocialMedia,
      deleteSocialMedia
    } = req.body;

    await client.query(
      /* SQL */ `UPDATE
      complexes
      SET
        social_media = (
          CASE 
          WHEN $2::TEXT IS NOT NULL AND $3::TEXT IS NULL AND $4::TEXT IS NULL
          THEN ARRAY_APPEND(social_media, $2)
          WHEN $2::TEXT IS NOT NULL AND $3::TEXT IS NOT NULL AND $4::TEXT IS NULL
          THEN ARRAY_REPLACE(social_media, $3, $2)
          WHEN $4::TEXT IS NOT NULL AND $2::TEXT IS NULL AND $3::TEXT IS NULL
          AND ARRAY_LENGTH(social_media, 1) = 1
          THEN NULL
          WHEN $4::TEXT IS NOT NULL AND $2::TEXT IS NULL AND $3::TEXT IS NULL
          AND ARRAY_LENGTH(social_media, 1) != 1
          THEN ARRAY_REMOVE(social_media, $4)
          ELSE social_media
          END
        ),
        updated_at = NOW()
      WHERE
        id = $1`,
      [complexId, addSocialMedia, updateSocialMedia, deleteSocialMedia]
    );

    res.send("set complex social media");
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal Server Error");
  } finally {
    client.release();
  }
});

module.exports = router;
