const router = require("express").Router();
const database = require("../../database");
const validate = require("../../helpers/validate");
const Joi = require("joi");

const schema = Joi.object()
  .keys({
    newsId: Joi.number()
      .integer()
      .min(1)
      .required()
  })
  .required();

router.delete("/news", validate(schema), async (req, res) => {
  const client = await database.connect();
  try {
    const { newsId } = req.body;

    await client.query(`DELETE FROM news WHERE id = $1`, [newsId]);

    res.send("deleted news");
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal Server Error");
  } finally {
    client.release();
  }
});

module.exports = router;
