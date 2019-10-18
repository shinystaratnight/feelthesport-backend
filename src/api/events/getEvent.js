const router = require("express").Router();
const database = require("../../database");
const Joi = require("joi");

const schema = Joi.object()
  .keys({
    eventId: Joi.number()
      .integer()
      .min(1)
      .required()
  })
  .required();

router.get("/event/:id", async (req, res) => {
  const eventId = Number(req.params.id);
  const validatedParam = Joi.validate({ eventId }, schema);
  if (validatedParam.error) return res.status(400).send("Bad Request");

  const client = await database.connect();
  try {
    const eventInfo = (await client.query(
      /* SQL */ `
    SELECT
      a.id as "id",
      a.name as "name",
      a.description as "description",
      a.image as "image",
      a.sport as "sport",
      (LOWER(date_range))::TEXT as "startDate",
      (UPPER(date_range))::TEXT as "endDate",
      (LOWER(time_range) * TIME '00:30')::TEXT as "startTime",
      (UPPER(time_range) * TIME '00:30')::TEXT as "endTime",
      (LOWER(age_range)) as "minAge",
      (UPPER(age_range)) as "maxAge",
      a.gender as "gender",
      a.max_participants as "maxParticipants",
      a.gallery as "gallery",
      a.terms_and_conditions as "termsAndConditions",
      (
        CASE WHEN b.arena IS NULL THEN b.organizer
        ELSE (SELECT name FROM arenas as e WHERE b.arena = e.id) END
      ) as "organizer",
      (
        CASE WHEN c.arena IS NULL THEN c.name
        ELSE d.name END
      ) as "complexName",
      (
        CASE WHEN c.arena IS NULL THEN c.city
        ELSE d.city END
      ) as "complexCity",
      (
        CASE WHEN c.arena IS NULL THEN c.area
        ELSE d.area END
      ) as "complexArea",
      (
        CASE WHEN c.arena IS NULL THEN c.address
        ELSE d.address END
      ) as "complexAddress",
      (
        CASE WHEN c.arena IS NULL THEN c.phone
        ELSE d.phone END
      ) as "complexPhone",
      (
        CASE WHEN c.arena IS NULL THEN c.email
        ELSE d.email END
      ) as "complexEmail",
      (
        CASE WHEN c.arena IS NULL THEN c.social_media
        ELSE d.social_media END
      ) as "complexSocialMedia",
      (
        SELECT 
          JSON_STRIP_NULLS(
            JSON_AGG(
              JSON_BUILD_OBJECT(
                'id',
                e.id,
                'name',
                e.name,
                'description',
                e.description,
                'price',
                e.price
              )
            )
          )
        FROM event_categories as e
        WHERE e.event = a.id
      ) as "eventCategories",
      (
        SELECT
          JSON_STRIP_NULLS(
            JSON_AGG(
              JSON_BUILD_OBJECT(
                'id',
                g.id,
                'name',
                g.name,
                'type',
                g.type,
                'values',
                g.values,
                'required',
                g.required
              )
            )
          )
        FROM registration_forms as e
        JOIN registration_form_fields as f ON e.id = f.form
        JOIN form_fields as g ON f.field = g.id
        WHERE a.form = e.id

      ) as "form"
    FROM
      events as a
      JOIN organizers as b ON a.organizer = b.id
      JOIN complexes as c ON a.complex = c.id
      LEFT JOIN arenas as d ON c.arena = d.id
      WHERE a.id = $1`,
      [eventId]
    )).rows[0];

    if (!eventInfo) {
      return res.status(404).send("event does not exist");
    }

    res.json(eventInfo);
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal Server Error");
  } finally {
    client.release();
  }
});

module.exports = router;
