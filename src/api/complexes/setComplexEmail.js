const router = require("express").Router();
const database = require("../../database");
const validate = require("../../helpers/validate");
const Joi = require("joi");

const schema = Joi.object()
  .keys({
    complexId: Joi.number()
      .integer()
      .min(1)
      .required(),
    email: Joi.string()
      .email()
      .optional()
  })
  .required();

router.post("/complexEmail", validate(schema), async (req, res) => {
  const client = await database.connect();
  try {
    const { complexId, email } = req.body;

    await client.query(
      /* SQL */ `UPDATE
      complexes
      SET
        email = $2,
        updated_at = NOW()
      WHERE
        id = $1`,
      [complexId, email]
    );

    res.send("set complex email");
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal Server Error");
  } finally {
    client.release();
  }
});

module.exports = router;
