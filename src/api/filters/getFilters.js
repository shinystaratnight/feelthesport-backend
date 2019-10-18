const router = require("express").Router();
const database = require("../../database");
const validate = require("../../helpers/validate");
const authenticate = require("../../helpers/authenticate");
const Joi = require("joi");
const _ = require("lodash");

const schema = Joi.object()
  .keys({
    city: Joi.string().required(),
    sport: Joi.string().required(),
    type: Joi.string()
      .valid("booknplays", "clubs", "academies", "events")
      .required()
  })
  .required();

router.get("/filters/:type/:city/:sport/", async (req, res) => {
  const [type, city, sport] = [
    req.params.type,
    req.params.city,
    req.params.sport
  ];
  const validatedParam = Joi.validate({ city, sport, type }, schema);
  if (validatedParam.error) return res.status(400).send("Bad Request");

  console.log("USER123:", req.user);

  const client = await database.connect();
  try {
    let response;

    if (type === "booknplays") {
      response = (await client.query(
        /* SQL */ `
        SELECT
          ARRAY_AGG(DISTINCT areas.area) as "areas",
          ARRAY_AGG(DISTINCT  courts.type) as "courtTypes"
        FROM
          areas
        JOIN
          arenas ON areas.city = arenas.city
        JOIN
          arena_bookaslots ON arena_bookaslots.arena = arenas.id
          AND arena_bookaslots.date_range @> NOW()::DATE
        JOIN
          arena_time_slots ON arena_time_slots.bookaslot = arena_bookaslots.id
        JOIN
          courts ON courts.id = arena_time_slots.court
        WHERE
          areas.city = $1 AND arena_bookaslots.sport = $2
        `,
        [city, sport]
      )).rows[0];
    }

    if (type === "clubs") {
      response = (await client.query(
        /* SQL */ `
        SELECT
          ARRAY_AGG(DISTINCT areas.area) as "areas"
        FROM
          areas
        JOIN
          arenas ON areas.city = arenas.city
        JOIN
          arena_memberships ON arena_memberships.arena = arenas.id
          AND arena_memberships.date_range @> NOW()::DATE
        JOIN
          arena_membership_periods ON arena_membership_periods.membership = arena_memberships.id
        JOIN
          arena_time_slots ON arena_time_slots.membership = arena_memberships.id
        WHERE
          areas.city = $1 AND arena_memberships.sport = $2
        `,
        [city, sport]
      )).rows[0];
    }

    if (type === "academies") {
      response = (await client.query(
        /* SQL */ `
        SELECT
          ARRAY_AGG(DISTINCT areas.area) as "areas",
          ARRAY_AGG(DISTINCT courts.type) as "courtTypes"
        FROM
          areas
        JOIN
          arenas ON areas.city = arenas.city
        JOIN
          arena_coachings ON arena_coachings.arena = arenas.id
          AND arena_coachings.date_range @> NOW()::DATE
        JOIN
          arena_coaching_periods ON arena_coaching_periods.coaching = arena_coachings.id
        JOIN
          arena_time_slots ON arena_time_slots.coaching = arena_coachings.id
        JOIN
          courts ON courts.id = arena_time_slots.court
        WHERE
          areas.city = $1 AND arena_coachings.sport = $2
        `,
        [city, sport]
      )).rows[0];
    }

    if (type === "events") {
      response = (await client.query(
        /* SQL */ `
        SELECT
        ARRAY_AGG(DISTINCT areas.area) as "areas",
        ARRAY_AGG(
          DISTINCT (
            CASE WHEN complexes.arena IS NULL 
            THEN complexes.name 
            ELSE (
              SELECT
                name
              FROM
                arenas
              WHERE
                id = complexes.arena
            ) 
            END
          )
        ) as "complexes",
        ARRAY_AGG(
          DISTINCT (
            CASE WHEN organizers.arena IS NULL 
            THEN organizers.organizer 
            ELSE (
              SELECT
                name
              FROM
                arenas
              WHERE
                id = organizers.arena
            ) 
            END
          )
        ) as "organizers"
        FROM
          events
          JOIN complexes ON complexes.id = events.complex
          JOIN organizers ON organizers.id = events.organizer
          JOIN event_categories ON event_categories.event = events.id
          JOIN areas ON areas.city = $1
        WHERE
          events.sport = $2
          AND events.date_range @> NOW() :: DATE
        `,
        [city, sport]
      )).rows[0];
    }

    res.json(response);
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal Server Error");
  } finally {
    client.release();
  }
});

module.exports = router;

// Book N Play: Area, Sports, Price, Rating, Court Type, Offers
// Sort By: Most Popular, Lowest Price, Highest Rating, Nearest By, Most Recent
