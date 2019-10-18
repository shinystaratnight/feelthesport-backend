const router = require("express").Router();
const database = require("../../database");
const validate = require("../../helpers/validate");
const Joi = require("joi");

const schema = Joi.object()
  .keys({
    coachingId: Joi.number()
      .integer()
      .min(1)
      .required(),
    formId: Joi.number()
      .integer()
      .min(1)
      .required()
  })
  .required();

router.put("/coachingForms", validate(schema), async (req, res) => {
  const client = await database.connect();
  try {
    const { coachingId, formId } = req.body;

    await client.query(
      `UPDATE arena_coachings
      SET form = $2, updated_at = NOW()
      WHERE id = $1
      `,
      [coachingId, formId]
    );

    res.send("updated coaching form");
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal Server Error");
  } finally {
    client.release();
  }
});

module.exports = router;
