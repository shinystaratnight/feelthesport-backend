const router = require("express").Router();
const database = require("../../database");
const validate = require("../../helpers/validate");
const Joi = require("joi");

const schema = Joi.object()
  .keys({
    eventId: Joi.number()
      .integer()
      .min(1)
      .required(),
    addTerm: Joi.string()
      .min(6)
      .optional(),
    updateTerm: Joi.string()
      .min(6)
      .optional(),
    deleteTerm: Joi.string()
      .min(6)
      .optional()
  })
  .or("addTerm", "updateTerm", "deleteTerm")
  .with("updateTerm", "addTerm")
  .without("addTerm", "deleteTerm")
  .without("deleteTerm", ["addTerm", "updateTerm"])
  .required();

router.post(
  "/api/eventTermsAndConditions",
  validate(schema),
  async (req, res) => {
    const client = await database.connect();
    try {
      const { eventId, addTerm, updateTerm, deleteTerm } = req.body;

      await client.query(
        /* SQL */ `UPDATE
      events
      SET
        terms_and_conditions = (
          CASE 
          WHEN $2::TEXT IS NOT NULL AND $3::TEXT IS NULL AND $4::TEXT IS NULL
          THEN ARRAY_APPEND(terms_and_conditions, $2)
          WHEN $2::TEXT IS NOT NULL AND $3::TEXT IS NOT NULL AND $4::TEXT IS NULL
          THEN ARRAY_REPLACE(terms_and_conditions, $3, $2)
          WHEN $4::TEXT IS NOT NULL AND $2::TEXT IS NULL AND $3::TEXT IS NULL
          AND ARRAY_LENGTH(terms_and_conditions, 1) = 1
          THEN NULL
          WHEN $4::TEXT IS NOT NULL AND $2::TEXT IS NULL AND $3::TEXT IS NULL
          AND ARRAY_LENGTH(terms_and_conditions, 1) != 1
          THEN ARRAY_REMOVE(terms_and_conditions, $4)
          ELSE terms_and_conditions
          END
        ),
        updated_at = NOW()
      WHERE
        id = $1`,
        [eventId, addTerm, updateTerm, deleteTerm]
      );

      res.send("set event terms and conditions");
    } catch (error) {
      console.error(error);
      return res.status(500).send("Internal Server Error");
    } finally {
      client.release();
    }
  }
);

module.exports = router;
