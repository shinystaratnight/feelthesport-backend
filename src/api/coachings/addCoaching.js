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
    categoryName: Joi.string()
      .min(3)
      .max(100)
      .required(),
    description: Joi.string()
      .min(30)
      .required(),
    sport: Joi.string().required(),
    startDate: Joi.date()
      .iso()
      .required(),
    endDate: Joi.date()
      .iso()
      .required(),
    maxParticipants: Joi.number()
      .integer()
      .min(1)
      .required()
  })
  .required();

router.post("/coachings", validate(schema), async (req, res) => {
  const client = await database.connect();
  try {
    const {
      arenaId,
      categoryName,
      description,
      sport,
      startDate,
      endDate,
      maxParticipants
    } = req.body;

    await client.query(
      `INSERT INTO arena_coachings
      (arena, category_name, description, sport, date_range, max_participants)
      VALUES ($1, $2, $3, $4, DATERANGE($5, $6), $7)
      `,
      [
        arenaId,
        categoryName,
        description,
        sport,
        startDate,
        endDate,
        maxParticipants
      ]
    );

    res.send("added coaching");
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal Server Error");
  } finally {
    client.release();
  }
});

module.exports = router;
