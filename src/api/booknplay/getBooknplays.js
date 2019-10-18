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
        "Most Recent",
        "Highest Discount"
      )
      .required(),
    areas: Joi.array()
      .items(Joi.string().required())
      .min(1)
      .optional(),
    courtTypes: Joi.array()
      .items(Joi.string().required())
      .min(1)
      .optional(),
    rating: Joi.number()
      .integer()
      .min(1)
      .max(5)
      .optional(),
    minPrice: Joi.number()
      .integer()
      .min(0)
      .max(Joi.ref("maxPrice"))
      .invalid(Joi.ref("maxPrice"))
      .optional(),
    maxPrice: Joi.number()
      .integer()
      .optional(),
    offers: Joi.array()
      .items(Joi.string().valid("Yes").required())
      .min(1)
      .optional(),
    city: Joi.string().optional(),
    sport: Joi.string().optional(),
  })
  .and("minPrice", "maxPrice")
  .required();

router.post("/booknplays", validate(schema), async (req, res) => {
  const { areas, courtTypes, rating, minPrice, maxPrice, offers, city, sport, sortBy } = req.body;
  const client = await database.connect();
  try {
    let query = knex
      .select(
        knex.raw(/* SQL */ `
        DISTINCT ON (arenas.id, arena_bookaslots.sport)
        arenas.id as "arenaId",
        arenas.name as "arenaName",
        arenas.image as "arenaImage",
        arenas.city as "city",
        arenas.area as "area",
        arenas.opening_time as "openingTime",
        arenas.closing_time as "closingTime",
        arena_bookaslots.id as "bookaslotId",
        arena_bookaslots.sport as "sport",
        arenas.created_at as "createdAt",
        (
          SELECT
          CASE WHEN arenas.show_rating THEN
          (
          SELECT
          TRUNC(ROUND(
            (SUM(reviews.rating)::decimal / COUNT(reviews.rating)::decimal)
             * 2) / 2, 1)
          FROM reviews WHERE reviews.arena = arenas.id
          ) ELSE NULL
          END
        )::REAL as "rating",
        ARRAY_TO_STRING(ARRAY(
        SELECT
          type
        FROM
          courts
        WHERE
          EXISTS (
            SELECT
              DISTINCT ats.court
            FROM
              arena_time_slots as ats
            WHERE
              courts.id = ats.court
              AND EXISTS (
                SELECT
                  id
                FROM
                  arena_bookaslots as ab
                WHERE
                  ab.id = ats.bookaslot
                  AND ab.arena = arenas.id
                  AND ab.sport = arena_bookaslots.sport
              )
          )
        LIMIT 4
        ), ', ') as "courtTypes",
        (
          SELECT
            MIN(ab.price)
          FROM
            arena_bookaslots as ab
          WHERE
            ab.arena = arenas.id
            AND ab.sport = arena_bookaslots.sport
        ) as "price",
        (
          SELECT
          CASE WHEN EXISTS
          (SELECT 1 FROM arena_memberships WHERE arena = arenas.id)
          THEN TRUE ELSE FALSE END
        ) as "hasMembership",
        (
          SELECT
          CASE WHEN EXISTS
          (SELECT 1 FROM arena_coachings WHERE arena = arenas.id)
          THEN TRUE ELSE FALSE END
        ) as "hasCoaching",
        (
          SELECT
          CASE WHEN EXISTS
          (SELECT 1 FROM organizers
            JOIN events ON organizers.id = events.organizer
            WHERE organizers.arena = arenas.id)
          THEN TRUE ELSE FALSE
          END
        ) as "isEventOrganizer",
        (
          SELECT
          CASE WHEN EXISTS
          (SELECT 1 FROM complexes
            JOIN events ON complexes.id = events.complex
            WHERE complexes.arena = arenas.id)
          THEN TRUE ELSE FALSE
          END
        ) as "isEventComplex",
        (
          SELECT
            MAX(o.discount)
          FROM
            offers as o
          WHERE
            (
              o.city = arenas.city
              OR o.arena = arenas.id
              OR o.sport = arena_bookaslots.sport
              OR (
                o.city IS NULL
                AND o.sport IS NULL
                AND o.arena IS NULL
                AND o.event IS NULL
              )
            )
            AND o.discount_type = 'percent'
            AND o.date_range @> NOW()::DATE
        ) as "biggestPercentOffer",
        (
          SELECT
            MAX(o.discount)
          FROM
            offers as o
          WHERE
            (
              o.city = arenas.city
              OR o.arena = arenas.id
              OR o.sport = arena_bookaslots.sport
            )
            AND o.discount_type = 'amount'
            AND o.date_range @> NOW()::DATE
        ) as "biggestAmountOffer"`)
      )
      .from("arenas")
      .innerJoin("arena_bookaslots", "arena_bookaslots.arena", "arenas.id")
      .innerJoin(
        "arena_time_slots",
        "arena_time_slots.bookaslot",
        "arena_bookaslots.id"
      )
      .whereRaw(/* SQL */ `arena_bookaslots.date_range @> NOW()::DATE`);

    if (city) {
      query.where("arenas.city", city);
    }

    if (sport) {
      console.log(sport)
      query.where("arena_bookaslots.sport", sport);
    }

    if (areas) {
      query.whereIn("arenas.area", areas);
    }

    if (courtTypes) {
      query.whereRaw(
        /* SQL */ `
      (
      SELECT
        ARRAY_AGG(type)
      FROM
        courts
      WHERE
        EXISTS (
          SELECT
            DISTINCT ats.court
          FROM
            arena_time_slots as ats
          WHERE
            courts.id = ats.court
            AND EXISTS (
              SELECT
                id
              FROM
                arena_bookaslots as ab
              WHERE
                ab.id = ats.bookaslot
                AND ab.arena = arenas.id
                AND ab.sport = arena_bookaslots.sport
            )
        )
      ) && ARRAY[${courtTypes.map(_ => "?").join(",")}]`,
        courtTypes
      );
    }

    if (rating) {
      query.where(
        knex.raw(/* SQL */ `(
          SELECT
          CASE WHEN arenas.show_rating THEN
          (
          SELECT
          TRUNC(ROUND(
            (SUM(reviews.rating)::decimal / COUNT(reviews.rating)::decimal)
             * 2) / 2, 1)
          FROM reviews WHERE reviews.arena = arenas.id
          ) ELSE NULL
          END
        )`),
        ">=",
        rating
      );
    }

    if (minPrice) {
      query.whereBetween(
        knex.raw(/* SQL */ `(
          SELECT
            MIN(ab.price)
          FROM
            arena_bookaslots as ab
          WHERE
            ab.arena = arenas.id
            AND ab.sport = arena_bookaslots.sport
        )`),
        [minPrice, maxPrice]
      );
    }

    if (offers) {
      query.whereExists(
        knex.raw(/* SQL */ `(
          SELECT
            1
          FROM
            offers as o
          WHERE
          (
            o.city = arenas.city
            OR o.arena = arenas.id
            OR o.sport = arena_bookaslots.sport
            OR (
              o.city IS NULL
              AND o.sport IS NULL
              AND o.arena IS NULL
              AND o.event IS NULL
            )
          )
          AND o.date_range @> NOW()::DATE
        )`),
        [minPrice, maxPrice]
      );
    }
    const response = (await client.query(query.toString())).rows;

    switch (sortBy) {
      case "Most Popular":
        break;
      case   "Lowest Price":
        response.sort((a, b) => (a.price > b.price) ? 1 : -1);
        break;
      case   "Highest Rating":
        response.sort((a, b) => (a.rating > b.rating) ? 1 : -1);
        break;
      case   "Nearest By":
        break;
      case   "Most Recent":
        response.sort((a, b) => (a.createdAt < b.createdAt) ? 1 : -1);
        break;
      case   "Highest Discount":
        response.sort((a, b) => (a.biggestPercentOffer < b.biggestPercentOffer) ? 1 : -1);
        break;
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
