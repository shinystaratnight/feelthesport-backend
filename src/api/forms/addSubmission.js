const router = require("express").Router();
const database = require("../../database");
const validate = require("../../helpers/validate");
const Joi = require("joi");

const schema = Joi.object()
  .keys({
    name: Joi.string()
      .min(3)
      .max(20)
      .required(),
    required: Joi.boolean().required(),
    type: Joi.string()
      .valid(
        "alpha",
        "numeric",
        "alphanumeric",
        "radio",
        "checkbox",
        "date",
        "email",
        "phone",
        "uri"
      )
      .required(),
    values: Joi.when("type", {
      is: "radio",
      then: Joi.array()
        .items(Joi.string().required())
        .min(2)
        .required(),
      otherwise: Joi.when("type", {
        is: "checkbox",
        then: Joi.array()
          .items(Joi.string().required())
          .min(1)
          .required(),
        otherwise: null
      })
    })
  })
  .required();

router.post("/formSubmissions", validate(schema), async (req, res) => {
  const client = await database.connect();
  try {
    const { name, type, required, values } = req.body;

    await client.query(
      `INSERT INTO form_fields (name, type, required, values)
      VALUES ($1, $2, $3, $4)`,
      [name, type, required, values]
    );

    res.status(200).send("added form field");
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal Server Error");
  } finally {
    client.release();
  }
});

module.exports = router;
