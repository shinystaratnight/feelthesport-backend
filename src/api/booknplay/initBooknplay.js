const router = require("express").Router();
const database = require("../../database");
const knex = require("knex")({
  client: "pg"
});

router.get("/initBooknplay/", async (req, res) => {
  let city, sport ;
  if (req.query.city) {
    city = req.query.city
  }
  if (req.query.sport) {
    sport = req.query.sport
  }
  const client = await database.connect();

  try {
    let query1 = knex
      .select(
        knex.raw(/* SQL */ `
        ARRAY_AGG(DISTINCT courts.type) as "courtTypes"
      `)
      )
      .from("arenas")
      .innerJoin("arena_bookaslots", "arena_bookaslots.arena", "arenas.id")
      .innerJoin(
        "arena_time_slots",
        "arena_time_slots.bookaslot",
        "arena_bookaslots.id"
      )
      .innerJoin("courts", "courts.id", "arena_time_slots.court")
      .whereRaw(/* SQL */ `arena_bookaslots.date_range @> NOW()::DATE`);

    let query2 = knex
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
        (
          SELECT
          CASE WHEN arenas.show_rating THEN
          (
            SELECT
              TRUNC(ROUND(
              (SUM(reviews.rating)::DECIMAL / COUNT(reviews.rating)::DECIMAL)
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
          THEN TRUE ELSE FALSE
          END
        ) as "hasMembership",
        (
          SELECT
          CASE WHEN EXISTS
          (SELECT 1 FROM arena_coachings WHERE arena = arenas.id)
          THEN TRUE ELSE FALSE
          END
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
                AND event IS NULL
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
      query1.select(
        knex.raw(/* SQL */ `ARRAY_AGG(DISTINCT arenas.area) as "areas"`)
      );
      query1.where("arenas.city", city);
      query2.where("arenas.city", city);
    }
    if (sport) {
      query1.where("arena_bookaslots.sport", sport);
      query2.where("arena_bookaslots.sport", sport);
    }

    const response1 = (await client.query(query1.toString())).rows[0];
    const response2 = (await client.query(query2.toString())).rows;

    res.json({
      filters: response1,
      cards: response2
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal Server Error");
  } finally {
    client.release();
  }
});

module.exports = router;
