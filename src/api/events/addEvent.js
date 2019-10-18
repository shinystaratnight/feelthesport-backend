/* eslint-disable camelcase */
const database = require("../../database");
const router = require("express").Router();
const validate = require("../../helpers/validate");
const { DateTime } = require("luxon");
const Joi = require("joi");

const schema = Joi.object()
  .keys({
    name: Joi.string()
      .min(3)
      .max(100)
      .required(),
    sport: Joi.string().required(),
    organizerId: Joi.number()
      .integer()
      .min(1)
      .required(),
    complexId: Joi.number()
      .integer()
      .min(1)
      .required(),
    dateRange: Joi.array()
      .items(
        Joi.date()
          .iso()
          .required()
      )
      .length(2)
      .required(),
    timeRange: Joi.array()
      .items(
        Joi.string()
          .regex(/^([0-1][0-9]|2[0-3]):(00|30)$/)
          .required()
      )
      .length(2)
      .required(),
    ageRange: Joi.array()
      .items(
        Joi.number()
          .min(0)
          .max(100)
          .required()
      )
      .length(2)
      .required(),
    gender: Joi.string()
      .valid("male", "female", "other")
      .required(),
    description: Joi.string()
      .min(3)
      .max(30)
      .required(),
    image: Joi.string()
      .uri()
      .required()
  })
  .required();

router.post("/events/", validate(schema), async (req, res) => {
  const client = await database.connect();
  try {
    const {
      name,
      sport,
      organizerId,
      complexId,
      dateRange,
      timeRange,
      ageRange,
      gender,
      description,
      image
    } = req.body;

    const timeRangeLowerBound = Math.ceil(
      DateTime.fromISO(timeRange[0])
        .diff(DateTime.fromISO("00:00"), "minute")
        .toObject().minutes / 30
    );

    const timeRangeUpperBound = Math.ceil(
      DateTime.fromISO(timeRange[1])
        .diff(DateTime.fromISO("00:00"), "minute")
        .toObject().minutes / 30
    );

    await client.query(
      `INSERT INTO events
      (name,
      sport,
      organizer,
      complex,
      date_range,
      time_range,
      age_range,
      gender,
      description,
      image)
      VALUES ($1, $2, $3, $4, DATERANGE($5, $6), INT4RANGE($7, $8),
      INT4RANGE($9, $10), $11, $12, $13)`,
      [
        name,
        sport,
        organizerId,
        complexId,
        dateRange[0],
        dateRange[1],
        timeRangeLowerBound,
        timeRangeUpperBound,
        ageRange[0],
        ageRange[1],
        gender,
        description,
        image
      ]
    );

    res.status(200).send("added event");
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal Server Error");
  } finally {
    client.release();
  }
});

module.exports = router;
