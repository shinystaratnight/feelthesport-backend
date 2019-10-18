const router = require("express").Router();
const database = require("../../database");
const knex = require("knex")({
  client: "pg"
});

router.get("/initEvents", async (req, res) => {
  let city, sport;

  if (req.user) {
    [city, sport] = [req.user.selected_city, req.user.selected_sport];
  }

  const client = await database.connect();

  try {
    let query1 = knex
      .select(
        knex.raw(/* SQL */ `
      ARRAY_AGG(DISTINCT 
        (
          CASE WHEN organizers.arena IS NULL THEN organizers.organizer
          ELSE (SELECT ar.name FROM arenas as ar WHERE organizers.arena = ar.id)
          END
        )
      ) as "organizers"
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
      .whereRaw(/* SQL */ `events.date_range @> NOW()::DATE`);

    //= ============================
    let query2 = knex
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
      .whereRaw(/* SQL */ `events.date_range @> NOW()::DATE`);
    //= ============================

    if (city) {
      query1.select(
        knex.raw(/* SQL */ `
        ARRAY_AGG(DISTINCT 
          (
            CASE WHEN complexes.arena IS NULL THEN complexes.area
            ELSE arenas.area
            END
          )
        ) as "areas"`)
      );
      query1.whereRaw(
        /* SQL */ `
      (
        CASE WHEN complexes.arena IS NULL THEN complexes.city
        ELSE arenas.city
        END
      ) = ?
      `,
        city
      );
      query2.whereRaw(
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
      query1.where("events.sport", sport);
      query2.where("events.sport", sport);
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
