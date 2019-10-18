const router = require("express").Router();
const database = require("../../database");
const validate = require("../../helpers/validate");
const Joi = require("joi");

const schema = Joi.object()
  .keys({
    banners: Joi.array()
      .items(
        Joi.object()
          .keys({
            image: Joi.string()
              .uri()
              .required(),
            city: Joi.string().optional(),
            sport: Joi.string().optional()
          })
          .required()
      )
      .min(1)
      .unique()
      .required()
  })
  .required();

router.post("/banners", validate(schema), async (req, res) => {
  const client = await database.connect();
  try {
    for await (const banner of req.body.banners) {
      await client.query(
        `INSERT INTO banners (image, city, sport) VALUES ($1, $2, $3)`,
        [banner.image, banner.city, banner.sport]
      );
    }

    res.send("banners added");
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal Server Error");
  } finally {
    client.release();
  }
});

module.exports = router;
