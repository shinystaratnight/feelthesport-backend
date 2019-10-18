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
    trainer: Joi.boolean().required(),
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
    offers: Joi.bool().optional()
  })
  .and("minPrice", "maxPrice")
  .required();

router.post("/academies", validate(schema), async (req, res) => {
  let city, sport;
  const {
    trainer,
    areas,
    courtTypes,
    rating,
    minPrice,
    maxPrice,
    offers
  } = req.body;

  if (req.user) {
    [city, sport] = [req.user.selected_city, req.user.selected_sport];
  }

  const client = await database.connect();
  try {
    let query = knex
      .select(
        knex.raw(/* SQL */ `
        DISTINCT ON (arenas.id, arena_coachings.sport)
          arenas.id as "arenaId",
          arenas.name as "arenaName",
          arenas.description as "arenaDescription",
          arenas.image as "arenaImage",
          arenas.city as "city",
          arenas.area as "area",
          arenas.address as "address",
          arenas.opening_time as "openingTime",
          arenas.closing_time as "closingTime",
          (
            SELECT
            JSON_BUILD_OBJECT(
              'name',
              s.sport,
              'icon',
              s.icon
            )
            FROM
              sports as s
            WHERE
              s.sport = arena_coachings.sport
          ) as "sport",
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
                    arena_coachings as ac
                    WHERE
                      ac.id = ats.bookaslot
                      AND ac.arena = arenas.id
                      AND ac.sport = arena_coachings.sport
                  )
              )
            LIMIT 4
            ), ', ') as "courtTypes",
            (
              SELECT
              MIN(
                (
                  SELECT
                    MIN(acp.price)
                  FROM
                    arena_coaching_periods as acp
                  WHERE
                  acp.coaching = ac.id
                )
              )
            FROM
              arena_coachings as ac
            WHERE
            ac.arena = arenas.id
            AND ac.sport = arena_coachings.sport
            ) as "price"`)
      )
      .from("arenas")
      .innerJoin("arena_coachings", "arena_coachings.arena", "arenas.id")
      .innerJoin(
        "arena_time_slots",
        "arena_time_slots.coaching",
        "arena_coachings.id"
      )
      .innerJoin(
        "arena_coaching_periods",
        "arena_coaching_periods.coaching",
        "arena_coachings.id"
      )
      .whereRaw(/* SQL */ `arena_coachings.date_range @> NOW()::DATE`);

    if (trainer) {
      query.select(knex.raw("arenas.trainer as trainer"));
      query.whereNotNull("arenas.trainer");
    } else {
      query.whereNull("arenas.trainer");
    }

    if (city) {
      query.where("arenas.city", city);
    }

    if (sport) {
      query.where("arena_coachings.sport", sport);
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
              arena_coachings as ac
              WHERE
                ac.id = ats.bookaslot
                AND ac.arena = arenas.id
                AND ac.sport = arena_coachings.sport
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
        knex.raw(/* SQL */ `
        (
          SELECT
          MIN(
            (
              SELECT
                MIN(acp.price)
              FROM
                arena_coaching_periods as acp
              WHERE
              acp.coaching = ac.id
            )
          )
        FROM
          arena_coachings as ac
        WHERE
        ac.arena = arenas.id
        AND ac.sport = arena_coachings.sport
        )
        `),
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
            OR o.sport = arena_coachings.sport
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

    res.json(response);
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal Server Error");
  } finally {
    client.release();
  }
});

module.exports = router;
