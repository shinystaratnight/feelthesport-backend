const router = require("express").Router();
const database = require("../../database");
const validate = require("../../helpers/validate");
const Joi = require("joi");

const schema = Joi.object()
  .keys({
    eventId: Joi.number()
      .integer()
      .min(1)
      .required(),
    addImage: Joi.string()
      .uri()
      .optional(),
    updateImage: Joi.string()
      .uri()
      .optional(),
    deleteImage: Joi.string()
      .uri()
      .optional()
  })
  .or("addImage", "updateImage", "deleteImage")
  .with("updateImage", "addImage")
  .without("addImage", "deleteImage")
  .without("deleteImage", ["addImage", "updateImage"])
  .required();

router.post("/eventGallery", validate(schema), async (req, res) => {
  const client = await database.connect();
  try {
    const { eventId, addImage, updateImage, deleteImage } = req.body;

    await client.query(
      /* SQL */ `UPDATE
      events
      SET
      gallery = (
          CASE 
          WHEN $2::TEXT IS NOT NULL AND $3::TEXT IS NULL AND $4::TEXT IS NULL
          THEN ARRAY_APPEND(gallery, $2)
          WHEN $2::TEXT IS NOT NULL AND $3::TEXT IS NOT NULL AND $4::TEXT IS NULL
          THEN ARRAY_REPLACE(gallery, $3, $2)
          WHEN $4::TEXT IS NOT NULL AND $2::TEXT IS NULL AND $3::TEXT IS NULL
          AND ARRAY_LENGTH(gallery, 1) = 1
          THEN NULL
          WHEN $4::TEXT IS NOT NULL AND $2::TEXT IS NULL AND $3::TEXT IS NULL
          AND ARRAY_LENGTH(gallery, 1) != 1
          THEN ARRAY_REMOVE(gallery, $4)
          ELSE gallery
          END
        ),
        updated_at = NOW()
      WHERE
        id = $1`,
      [eventId, addImage, updateImage, deleteImage]
    );

    res.send("set event gallery");
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal Server Error");
  } finally {
    client.release();
  }
});

module.exports = router;
