const router = require("express").Router();
const database = require("../../database");
const knex = require("knex")({
  client: "pg"
});

router.get("/siteInfo", async (req, res) => {
  let city, sport;

  if (req.user) {
    [city, sport] = [req.user.selected_city, req.user.selected_sport];
  }
  if (req.query.city) {
    [city] = [req.query.city];
  }
  if (req.query.sport) {
    [sport] = [req.query.sport];
  }

  const client = await database.connect();
  try {
    const siteInfo = (await client.query(/* sql */ `
    SELECT
    main.phone as "phone",
    main.email as "email",
    main.social_media as "socialMedia",
    main.terms_and_conditions as "termsAndConditions",
    (
      SELECT
        quote
      FROM
        quotes
      ORDER BY
        random()
      LIMIT
        1
    ) as "quote",
    ARRAY(
      SELECT
        city
      FROM
        cities
    ) as "cities",
    (
      SELECT
        JSON_OBJECT_AGG(
          category,
          ARRAY(
            SELECT
              JSON_BUILD_OBJECT(
                'name',
                sports.sport,
                'icon',
                sports.icon
              )
            FROM
              sports
            WHERE
              sports.category = sport_categories.category
          )
        )
      FROM
        sport_categories
    ) as "sports"
    FROM
      main
       `)).rows[0];

    let bannersQuery = knex
      .select(knex.raw(/* SQL */ `image`))
      .from("banners")
      .where("banners.hidden", "False")
      .whereNull("banners.city");

    let offersQuery = knex
      .select(
        knex.raw(/* SQL */ `
          DISTINCT ON (offers.id)
          offers.id as "id",
          offers.name as "name",
          offers.image as "image",
          (
            CASE 
            WHEN offers.city IS NOT NULL THEN 'city'
            WHEN offers.sport IS NOT NULL THEN 'sport'
            WHEN offers.arena IS NOT NULL THEN 'arena'
            WHEN offers.event IS NOT NULL THEN 'event'
            ELSE 'general'
            END
          ) as "type",
          offers.discount_type as "discountType",
          offers.discount as "discount"
       `)
      )
      .from("offers").whereRaw(/* SQL */ `
      offers.date_range @> CURRENT_DATE`);

    let eventsQuery = knex
      .select(
        knex.raw(/* SQL */ `
        events.id as "id",
        events.name as "name",
        events.sport as "sport",
        events.image as "image",
        (LOWER(events.date_range))::TEXT as "startDate",
        (UPPER(events.date_range))::TEXT as "endDate",
        (LOWER(events.time_range) * TIME '00:30')::TEXT as "startTime",
        (UPPER(events.time_range) * TIME '00:30')::TEXT as "endTime",
        (LOWER(events.age_range)) as "startAge",
        (UPPER(events.age_range)) as "endAge",
        (
          CASE 
          WHEN organizers.arena IS NULL 
          THEN organizers.organizer 
          ELSE (
            SELECT
              ar.name
            FROM
              arenas as ar
            WHERE
              organizers.arena = ar.id
          ) 
          END
        ) as "organizer",
        (
          CASE 
          WHEN complexes.arena IS NULL 
          THEN complexes.name 
          ELSE (SELECT name FROM arenas WHERE id = complexes.arena)
          END
        ) as "complex",
        (
          CASE 
          WHEN complexes.arena IS NULL 
          THEN complexes.city 
          ELSE (SELECT city FROM arenas WHERE id = complexes.arena)
          END
        ) as "city",
        (
          CASE 
          WHEN complexes.arena IS NULL 
          THEN complexes.area 
          ELSE (SELECT area FROM arenas WHERE id = complexes.arena)
          END
        ) as "area",
        (
          SELECT
            MIN(ec.price)
          FROM
            event_categories as ec
          WHERE
            ec.event = events.id
        ) as "price"
       `)
      )
      .from("events")
      .innerJoin("organizers", "organizers.id", "events.organizer")
      .innerJoin("complexes", "complexes.id", "events.complex")
      .whereRaw(/* SQL */ `
      events.form IS NOT NULL
      AND EXISTS(
        SELECT
          1
        FROM
          event_categories
        WHERE
          event_categories.event = events.id
      )
      AND events.date_range @> CURRENT_DATE
      `);

    if (city) {
      bannersQuery.orWhere("banners.city", city);

      offersQuery.crossJoin("arenas");
      offersQuery.crossJoin("events");
      offersQuery.join("complexes", "complexes.id", "events.complex");

      offersQuery.where("offers.city", city);

      offersQuery.orWhereRaw(
        /* SQL */ `
        offers.arena = arenas.id AND arenas.city = ?
      `,
        [city]
      );

      offersQuery.orWhereRaw(
        /* SQL */ `
        offers.event = events.id
        AND events.complex = complexes.id
        AND (
          complexes.city = ?
          OR (complexes.arena = arenas.id AND arenas.city = ?)
        )
      `,
        [city, city]
      );

      // if (!sport) {
      offersQuery.crossJoin("arena_bookaslots");
      offersQuery.crossJoin("arena_memberships");
      offersQuery.crossJoin("arena_coachings");

      offersQuery.orWhereRaw(
        /* SQL */ `
          arena_bookaslots.arena =  arenas.id
          AND arenas.city = ?
          AND arena_bookaslots.sport = offers.sport
        `,
        [city]
      );
      offersQuery.orWhereRaw(
        /* SQL */ `
          arena_memberships.arena =  arenas.id
          AND arenas.city = ?
          AND arena_memberships.sport = offers.sport
        `,
        [city]
      );
      offersQuery.orWhereRaw(
        /* SQL */ `
          arena_coachings.arena =  arenas.id
          AND arenas.city = ?
          AND arena_coachings.sport = offers.sport
        `,
        [city]
      );
      // }

      offersQuery.orWhereRaw(/* SQL */ `
        offers.city IS NULL
        AND offers.sport IS NULL
        AND offers.arena IS NULL
        AND offers.event IS NULL
        `);

      eventsQuery.whereRaw(
        /* SQL */ `
        complexes.city = ? OR EXISTS (
          SELECT
            1
          FROM
            arenas
          WHERE
            city = ?
            AND id = complexes.arena
        )
      `,
        [city, city]
      );
    }

    const bannersResponse = (await client.query(bannersQuery.toString())).rows;
    const offersResponse = (await client.query(offersQuery.toString())).rows;
    const eventsResponse = (await client.query(eventsQuery.toString())).rows;

    res.json({
      ...siteInfo,
      banners: bannersResponse.map(banner => banner.image),
      offers: offersResponse,
      events: eventsResponse
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal Server Error");
  } finally {
    client.release();
  }
});

module.exports = router;
