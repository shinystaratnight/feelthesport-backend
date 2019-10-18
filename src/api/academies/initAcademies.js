const router = require("express").Router();
const database = require("../../database");
const knex = require("knex")({
  client: "pg"
});

router.get("/initAcademies/", async (req, res) => {
  let city, sport;

  console.log("XXX");

  if (req.user) {
    [city, sport] = [req.user.selected_city, req.user.selected_sport];
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
      .innerJoin("arena_coachings", "arena_coachings.arena", "arenas.id")
      .innerJoin(
        "arena_time_slots",
        "arena_time_slots.coaching",
        "arena_coachings.id"
      )
      .innerJoin("courts", "courts.id", "arena_time_slots.court")
      .whereRaw(/* SQL */ `arena_coachings.date_range @> NOW()::DATE`);
    //= ============================
    let query2 = knex
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

    let query3 = query2.clone();

    query2.whereNull("arenas.trainer");
    query3.select(knex.raw("arenas.trainer as trainer"));
    query3.whereNotNull("arenas.trainer");

    //= ============================

    if (city) {
      query1.select(
        knex.raw(/* SQL */ `ARRAY_AGG(DISTINCT arenas.area) as "areas"`)
      );
      query1.where("arenas.city", city);
      query2.where("arenas.city", city);
      query3.where("arenas.city", city);
    }
    if (sport) {
      query1.where("arena_coachings.sport", sport);
      query2.where("arena_coachings.sport", sport);
      query3.where("arena_coachings.sport", sport);
    }

    console.log(query2.toString());
    const response1 = (await client.query(query1.toString())).rows[0];
    const response2 = (await client.query(query2.toString())).rows;
    const response3 = (await client.query(query3.toString())).rows;

    res.json({
      filters: response1,
      cards: response2,
      trainers: response3
    });
    res.json(response1);
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal Server Error");
  } finally {
    client.release();
  }
});

module.exports = router;
