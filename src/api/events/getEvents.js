const router = require("express").Router();
const database = require("../../database");
const validate = require("../../helpers/validate");
const Joi = require("joi");
const knex = require("knex")({
  client: "pg"
});

const schema = Joi.object()
  .keys({
    sortBy: Joi.string()
      .valid(
        "Most Popular",
        "Lowest Price",
        "Highest Rating",
        "Nearest By",
        "Most Recent"
      )
      .required(),
    areas: Joi.array()
      .items(Joi.string().required())
      .min(1)
      .optional(),
    organizers: Joi.array()
      .items(Joi.string().required())
      .min(1)
      .optional(),
    genders: Joi.array()
      .items(
        Joi.string()
          .valid("Male", "Female")
          .required()
      )
      .min(1)
      .unique()
      .optional()
  })
  .required();

router.post("/getEvents", validate(schema), async (req, res) => {
  let city, sport;
  const { areas, organizers, genders } = req.body;

  if (req.user) {
    [city, sport] = [req.user.selected_city, req.user.selected_sport];
  }

  const client = await database.connect();
  try {
    let query = knex
      .select(
        knex.raw(/* SQL */ `
          DISTINCT events.id as "id",
          events.name as "name",
          events.sport as "sport",
          events.image as "image",
          (LOWER(events.date_range)):: TEXT as "startDate",
          (UPPER(events.date_range)):: TEXT as "endDate",
          (LOWER(events.time_range) * TIME '00:30') :: TEXT as "startTime",
          (UPPER(events.time_range) * TIME '00:30') :: TEXT as "endTime",
          (LOWER(events.age_range)) as "startAge",
          (UPPER(events.age_range)) as "endAge",
          (
            CASE WHEN organizers.arena IS NULL THEN organizers.organizer
            ELSE (SELECT ar.name FROM arenas as ar WHERE organizers.arena = ar.id)
            END
          ) as "organizer",
          (
            CASE WHEN complexes.arena IS NULL THEN complexes.name
            ELSE arenas.name
            END
          ) as "complex",
          (
            CASE WHEN complexes.arena IS NULL THEN complexes.city
            ELSE arenas.city
            END
          ) as "city",
          (
            CASE WHEN complexes.arena IS NULL THEN complexes.area
            ELSE arenas.area
            END
          ) as "area",
          (
            SELECT
              MIN(ec.price)
            FROM
              event_categories as ec
            WHERE ec.event = events.id
          ) as "price"
              `)
      )
      .from("events")
      .joinRaw(
        /* SQL */ `
      JOIN event_categories ON event_categories.event = events.id
      JOIN organizers ON events.organizer = organizers.id
      JOIN complexes ON events.complex = complexes.id
      LEFT JOIN arenas ON complexes.arena = arenas.id
      `
      )
      .whereNotNull("form")
      .whereRaw(/* SQL */ `events.date_range @> NOW()::DATE`);

    if (city) {
      query.whereRaw(
        /* SQL */ `
      (
        CASE WHEN complexes.arena IS NULL THEN complexes.city
        ELSE arenas.city
        END
      ) = ?
      `,
        city
      );
    }

    if (sport) {
      query.where("events.sport", sport);
    }

    if (areas) {
      query.whereIn(
        knex.raw(/* SQL */ `
        (
          CASE WHEN complexes.arena IS NULL THEN complexes.area
          ELSE arenas.area
          END
        )`),
        areas
      );
    }
    if (organizers) {
      query.whereIn(
        knex.raw(/* SQL */ `
        (
          CASE WHEN organizers.arena IS NULL THEN organizers.organizer
          ELSE (SELECT ar.name FROM arenas as ar WHERE organizers.arena = ar.id)
          END
        )`),
        organizers
      );
    }
    if (genders) {
      query.whereIn("events.gender", genders);
    }

    const response = (await client.query(query.toString())).rows;

    res.json(response);
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal Server Error");
  } finally {
    client.release();
  }
});

module.exports = router;
