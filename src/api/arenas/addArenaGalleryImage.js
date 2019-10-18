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
    image: Joi.string()
      .uri()
      .required()
  })
  .required();

router.post("/arenaGallery", validate(schema), async (req, res) => {
  const client = await database.connect();
  try {
    const { arenaId, image } = req.body;

    await client.query(
      `UPDATE arenas SET gallery = ARRAY_APPEND(gallery, $2),
       updated_at = NOW()
       WHERE id = $1`,
      [arenaId, image]
    );

    res.send("added arena gallery image");
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal Server Error");
  } finally {
    client.release();
  }
});

module.exports = router;
