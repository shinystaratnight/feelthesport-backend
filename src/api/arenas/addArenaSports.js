const router = require("express").Router();
const database = require("../../database");
const validate = require("../../helpers/validate");
const Joi = require("joi");

const schema = Joi.object()
  .keys({
    arenaId: Joi.number()
      .integer()
      .min(1)
      .required(),
    sport: Joi.string().required(),
    courtType: Joi.string().required(),
    price: Joi.number()
      .integer()
      .min(0)
      .required(),
    mainSport: Joi.boolean().required(),
    openingTime: Joi.string()
      .regex(/^(0[0-9]|1[0-9]|2[0-3]|[0-9]):[0-5][0-9]$/)
      .required(),
    closingTime: Joi.string()
      .regex(/^(0[0-9]|1[0-9]|2[0-3]|[0-9]):[0-5][0-9]$/)
      .required()
  })
  .required();

router.post("/arenaSports", validate(schema), async (req, res) => {
  const client = await database.connect();
  try {
    await client.query(
      `INSERT INTO arena_sports
        (arena, sport, court_type, price, main_sport, opening_time, closing_time)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        req.body.arenaId,
        req.body.sport,
        req.body.courtType,
        req.body.price,
        req.body.mainSport,
        req.body.openingTime,
        req.body.closingTime
      ]
    );

    res.send("arena sport added");
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal Server Error");
  } finally {
    client.release();
  }
});

module.exports = router;
