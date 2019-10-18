const router = require("express").Router();
const database = require("../../database");
const validate = require("../../helpers/validate");
const Joi = require("joi");

const schema = Joi.object()
  .keys({
    image: Joi.string()
      .uri()
      .required(),
    city: Joi.string()
      .min(3)
      .optional(),
    sport: Joi.string()
      .min(3)
      .optional()
  })
  .required();

router.post("/banners", validate(schema), async (req, res) => {
  const client = await database.connect();
  try {
    const { image, city, sport } = req.body;

    await client.query(
      `INSERT INTO banners (image, city, sport) VALUES
    ($1, $2, $3)`,
      [image, city, sport]
    );

    res.send("added banner");
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal Server Error");
  } finally {
    client.release();
  }
});

module.exports = router;
