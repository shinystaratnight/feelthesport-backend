const router = require("express").Router();
const database = require("../../database");
const validate = require("../../helpers/validate");
const Joi = require("joi");

const schema = Joi.object()
  .keys({
    reviewId: Joi.number()
      .integer()
      .min(1)
      .required()
  })
  .required();

router.delete("/reviews", validate(schema), async (req, res) => {
  const client = await database.connect();
  try {
    const { reviewId } = req.body;

    await client.query(`DELETE FROM reviews WHERE id = $1`, [reviewId]);

    res.send("deleted review");
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal Server Error");
  } finally {
    client.release();
  }
});

module.exports = router;
