const router = require("express").Router();
const database = require("../../database");
const validate = require("../../helpers/validate");
const Joi = require("joi");

const schema = Joi.object()
  .keys({
    replyId: Joi.number()
      .integer()
      .min(1)
      .required()
  })
  .required();

router.delete("/reply", validate(schema), async (req, res) => {
  const client = await database.connect();
  try {
    const { replyId } = req.body;

    await client.query(`DELETE FROM replies WHERE id = $1`, [replyId]);

    res.send("deleted review reply");
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal Server Error");
  } finally {
    client.release();
  }
});

module.exports = router;
