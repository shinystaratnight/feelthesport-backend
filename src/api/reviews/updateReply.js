const router = require("express").Router();
const database = require("../../database");
const validate = require("../../helpers/validate");
const Joi = require("joi");

const schema = Joi.object()
  .keys({
    replyId: Joi.number()
      .integer()
      .min(1)
      .required(),
    body: Joi.string()
      .min(3)
      .optional()
  })
  .required();

router.put("/replies", validate(schema), async (req, res) => {
  const client = await database.connect();
  try {
    const { replyId, body } = req.body;

    await client.query(
      `UPDATE review_replies SET body = $2, updated_at = NOW()
      WHERE id = $1`,
      [replyId, body]
    );

    res.send("updated review reply");
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal Server Error");
  } finally {
    client.release();
  }
});

module.exports = router;
