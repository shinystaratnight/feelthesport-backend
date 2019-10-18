const router = require("express").Router();
const database = require("../../database");
const validate = require("../../helpers/validate");
const Joi = require("joi");

const schema = Joi.object()
  .keys({
    complexId: Joi.number()
      .integer()
      .min(1)
      .required()
  })
  .required();

router.delete("/complexes", validate(schema), async (req, res) => {
  const client = await database.connect();
  try {
    const { complexId } = req.body;

    await client.query(`DELETE FROM complexes WHERE id = $1`, [complexId]);

    res.send("deleted complex");
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal Server Error");
  } finally {
    client.release();
  }
});

module.exports = router;
