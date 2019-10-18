const router = require("express").Router();
const database = require("../../database");
const validate = require("../../helpers/validate");
const Joi = require("joi");

const schema = Joi.object()
  .keys({
    quote: Joi.string().required()
  })
  .required();

router.delete("/quotes", validate(schema), async (req, res) => {
  const client = await database.connect();
  try {
    const { quote } = req.body;

    await client.query(`DELETE FROM quotes WHERE quote = $1`, [quote]);

    res.send("deleted quote");
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal Server Error");
  } finally {
    client.release();
  }
});

module.exports = router;
