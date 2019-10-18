const router = require("express").Router();
const database = require("../../database");
const validate = require("../../helpers/validate");
const Joi = require("joi");

const schema = Joi.object()
  .keys({
    reviewId: Joi.number()
      .integer()
      .min(1)
      .required(),
    body: Joi.string()
      .min(20)
      .required()
  })
  .required();

router.post("/replies", validate(schema), async (req, res) => {
  const client = await database.connect();
  try {
    const { reviewId, body } = req.body;

    await client.query(
      `INSERT INTO replies (review, replier, body) VALUES
    ($1, $2, $3)`,
      [reviewId, req.user.id, body]
    );

    res.send("added review reply");
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal Server Error");
  } finally {
    client.release();
  }
});

module.exports = router;
