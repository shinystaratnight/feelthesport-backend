const router = require("express").Router();
const database = require("../../database");
const knex = require("knex")({
  client: "pg"
});

router.get("/initClubs/", async (req, res) => {
  let city, sport;

  if (req.user) {
    [city, sport] = [req.user.selected_city, req.user.selected_sport];
  }

  const client = await database.connect();

  try {
    let query1 = knex
      .from("arenas")
      .innerJoin("arena_memberships", "arena_memberships.arena", "arenas.id")
      .whereRaw(/* SQL */ `arena_memberships.date_range @> NOW()::DATE`);

    let query2 = knex
      .select(
        knex.raw(/* SQL */ `
            DISTINCT arenas.id as "id",
            arenas.name as "name",
            arenas.image as "image",
            arenas.area as "area",
            arena_memberships.sport as "sport"`)
      )
      .from("arenas")
      .innerJoin("arena_memberships", "arena_memberships.arena", "arenas.id")
      .whereRaw(/* SQL */ `arena_memberships.date_range @> NOW()::DATE`);

    if (city) {
      query1.select(
        knex.raw(/* SQL */ `ARRAY_AGG(DISTINCT arenas.area) as "areas"`)
      );
      query1.where("arenas.city", city);
      query2.where("arenas.city", city);
    }
    if (sport) {
      query1.where("arena_memberships.sport", sport);
      query2.where("arena_memberships.sport", sport);
    }

    let response1;
    if (city) {
      response1 = (await client.query(query1.toString())).rows[0];
    }

    const response2 = (await client.query(query2.toString())).rows;

    res.json({
      filters: response1 || [],
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
