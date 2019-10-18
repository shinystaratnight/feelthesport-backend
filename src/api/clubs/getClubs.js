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
      .optional()
  })
  .required();

router.post("/clubs", validate(schema), async (req, res) => {
  let city, sport;
  const { areas } = req.body;

  if (req.user) {
    [city, sport] = [req.user.selected_city, req.user.selected_sport];
  }

  const client = await database.connect();
  try {
    let query = knex
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
      query.where("arenas.city", city);
    }

    if (sport) {
      query.where("arena_memberships.sport", sport);
    }

    if (city && areas) {
      query.whereIn("arenas.area", areas);
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
