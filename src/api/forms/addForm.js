const router = require("express").Router();
const database = require("../../database");
const validate = require("../../helpers/validate");
const Joi = require("../../helpers/phoneJoi");

const schema = Joi.object()
  .keys({
    formName: Joi.string()
      .min(3)
      .required(),
    formFieldIds: Joi.array()
      .items(
        Joi.number()
          .integer()
          .min(1)
          .required()
      )
      .min(1)
      .required()
  })
  .required();

router.post("/forms", validate(schema), async (req, res) => {
  const client = await database.connect();
  try {
    const { formName, formFieldIds } = req.body;
    await client.query("BEGIN");

    const { id: formId } = (await client.query(
      `INSERT INTO registration_forms (name) VALUES ($1) RETURNING id`,
      [formName]
    )).rows[0];

    for (const formFieldId of formFieldIds) {
      await client.query(
        `INSERT INTO registration_form_fields (form, field) VALUES ($1, $2)`,
        [formId, formFieldId]
      );
    }

    await client.query("COMMIT");
    res.status(200).send("added registration form");
  } catch (error) {
    await client.query("ROLLBACK");
    console.error(error);
    return res.status(500).send("Internal Server Error");
  } finally {
    client.release();
  }
});

module.exports = router;
