const router = require("express").Router();
const database = require("../../database");
const validate = require("../../helpers/validate");
const Joi = require("joi");

const schema = Joi.object()
  .keys({
    newsId: Joi.number()
      .integer()
      .min(1)
      .required(),
    title: Joi.string()
      .min(3)
      .optional(),
    body: Joi.string()
      .min(20)
      .optional(),
    image: Joi.string()
      .uri()
      .optional()
  })
  .required();

router.put("/news", validate(schema), async (req, res) => {
  const client = await database.connect();
  try {
    const { newsId, title, body, image } = req.body;

    await client.query(
      `UPDATE news SET title = $2, body = $3, image = $4, updated_at = NOW()
      WHERE id = $1`,
      [newsId, title, body, image]
    );

    res.send("updated news");
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal Server Error");
  } finally {
    client.release();
  }
});

module.exports = router;
