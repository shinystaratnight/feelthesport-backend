const router = require("express").Router();
const database = require("../../database");
const passport = require('passport');
const validate = require("../../helpers/validate");
const Joi = require("joi");

const schema = Joi.object()
  .keys({
    cartItems: Joi.array()
      .items(
        Joi.object()
          .keys({
            bookaslotSlotId: Joi.number()
              .integer()
              .min(1)
              .optional(),
            bookaslotDate: Joi.date()
              .iso()
              .optional(),
            bookaslotPlayers: Joi.number()
              .integer()
              .min(1)
              .optional(),
            membershipPeriodId: Joi.number()
              .integer()
              .min(1)
              .optional(),
            coachingPeriodId: Joi.number()
              .integer()
              .min(1)
              .optional(),
            eventCategoryId: Joi.number()
              .integer()
              .min(1)
              .optional(),
            formSubmission: Joi.array()
              .items(
                Joi.object()
                  .keys({
                    fieldId: Joi.number()
                      .integer()
                      .min(1)
                      .required(),
                    input: Joi.optional()
                  })
                  .required()
              )
              .unique("fieldId")
              .min(1)
              .optional()
          })
          .xor(
            "bookaslotSlotId",
            "membershipPeriodId",
            "coachingPeriodId",
            "eventCategoryId"
          )
          .with("bookaslotSlotId", ["bookaslotDate", "bookaslotPlayers"])
          .without("bookaslotSlotId", "formSubmission")
          .with("membershipPeriodId", "formSubmission")
          .without("membershipPeriodId", ["bookaslotDate", "bookaslotPlayers"])
          .with("coachingPeriodId", "formSubmission")
          .without("coachingPeriodId", ["bookaslotDate", "bookaslotPlayers"])
          .with("eventCategoryId", "formSubmission")
          .without("eventCategoryId", ["bookaslotDate", "bookaslotPlayers"])
          .required()
      )
      .unique()
      .min(1)
      .required()
  })
  .required();

router.post("/carts", validate(schema),  passport.authenticate('jwt'), async (req, res) => {
  const client = await database.connect();
  try {
    await client.query("BEGIN");
    const { cartItems } = req.body;
    const userId = req.user.id;

    for (const cartItem of cartItems) {
      const {
        bookaslotSlotId,
        bookaslotDate,
        bookaslotPlayers,
        membershipPeriodId,
        coachingPeriodId,
        eventCategoryId,
        formSubmission
      } = cartItem;

      let formSubmissionId;

      if (formSubmission && membershipPeriodId) {
        formSubmissionId = (await client.query(
          /* SQL */ `
        SELECT add_form_submission(
          (SELECT membership FROM arena_membership_periods WHERE id = $1), 
          NULL, 
          NULL, 
          $2) as "formSubmissionId"`,
          [membershipPeriodId, JSON.stringify(formSubmission)]
        )).rows[0].formSubmissionId;
      } else if (formSubmission && coachingPeriodId) {
        formSubmissionId = (await client.query(
          /* SQL */ `
        SELECT add_form_submission(
          NULL, 
          (SELECT coaching FROM arena_coaching_periods WHERE id = $1), 
          NULL, 
          $2) as "formSubmissionId"`,
          [coachingPeriodId, JSON.stringify(formSubmission)]
        )).rows[0].formSubmissionId;
      } else if (formSubmission && eventCategoryId) {
        formSubmissionId = (await client.query(
          /* SQL */ `
        SELECT add_form_submission(
          NULL, 
          NULL, 
          (SELECT event FROM event_categories WHERE id = $1), 
          $2) as "formSubmissionId"`,
          [eventCategoryId, JSON.stringify(formSubmission)]
        )).rows[0].formSubmissionId;
      }

      await client.query(
        /* SQL */ `
        INSERT INTO cart_items 
          (cart, 
          bookaslot_slot, 
          bookaslot_date, 
          bookaslot_players, 
          membership_period, 
          coaching_period, 
          event_category, 
          form_submission)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          userId,
          bookaslotSlotId,
          bookaslotDate,
          bookaslotPlayers,
          membershipPeriodId,
          coachingPeriodId,
          eventCategoryId,
          formSubmissionId
        ]
      );
    }

    await client.query(
      /* SQL */ `
      UPDATE
        carts
      SET
        updated_at = NOW()
      WHERE
        user_id = $1
      `,
      [userId]
    );

    res.send("added cart items");
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    console.error(error);
    return res.status(500).send("Internal Server Error");
  } finally {
    client.release();
  }
});

module.exports = router;
