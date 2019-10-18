const router = require("express").Router();
const database = require("../../database");
const validate = require("../../helpers/validate");
const Joi = require("joi");

const schema = Joi.object()
  .keys({
    boardMemberId: Joi.number()
      .integer()
      .min(1)
      .required()
  })
  .required();

router.delete("/boardMembers", validate(schema), async (req, res) => {
  const client = await database.connect();
  try {
    const { boardMemberId } = req.body;

    await client.query(`DELETE FROM board_members WHERE id = $1`, [
      boardMemberId
    ]);

    res.send("deleted board member");
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal Server Error");
  } finally {
    client.release();
  }
});

module.exports = router;
