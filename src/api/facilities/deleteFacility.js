const router = require("express").Router();
const database = require("../../database");
const validate = require("../../helpers/validate");
const Joi = require("joi");

const schema = Joi.object()
  .keys({
    facility: Joi.string().required()
  })
  .required();

router.delete("/facilities", validate(schema), async (req, res) => {
  const client = await database.connect();
  try {
    const { facility } = req.body;

    await client.query(`DELETE FROM facilities WHERE facility = $1`, [
      facility
    ]);

    res.send("deleted facility");
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal Server Error");
  } finally {
    client.release();
  }
});

module.exports = router;
