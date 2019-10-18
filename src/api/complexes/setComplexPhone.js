const router = require("express").Router();
const database = require("../../database");
const validate = require("../../helpers/validate");
const Joi = require("../../helpers/phoneJoi");

const schema = Joi.object()
  .keys({
    complexId: Joi.number()
      .integer()
      .min(1)
      .required(),
    phone: Joi.string()
      .phone()
      .optional()
  })
  .required();

router.post("/complexPhone", validate(schema), async (req, res) => {
  const client = await database.connect();
  try {
    const { complexId, phone } = req.body;

    await client.query(
      /* SQL */ `UPDATE
      complexes
      SET
        phone = $2,
        updated_at = NOW()
      WHERE
        id = $1`,
      [complexId, phone]
    );

    res.send("set complex phone");
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal Server Error");
  } finally {
    client.release();
  }
});

module.exports = router;
