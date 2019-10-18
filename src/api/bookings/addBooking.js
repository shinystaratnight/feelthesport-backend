const router = require("express").Router();
const database = require("../../database");
const validate = require("../../helpers/validate");
const { DateTime, Interval } = require("luxon");
const Joi = require("joi").extend(joi => ({
  base: joi.array(),
  name: "array",
  language: {
    timeSlots: "Must be a valid array of time slots"
  },
  rules: [
    {
      name: "timeSlots",
      validate (params, value, state, options) {
        let validTimeSlots = true;
        const timeSlots = [...value];

        for (let index = 0; index < timeSlots.length; index++) {
          let slot1 = timeSlots[index];

          let time1 = DateTime.fromISO(slot1[0]);
          let time2 = time1.plus({ minutes: 30 * slot1[1] });

          if (index < timeSlots.length - 1) {
            let slot2 = timeSlots[index + 1];

            let time3 = DateTime.fromISO(slot2[0]);
            let time4 = time3.plus({ minutes: 30 * slot2[1] });

            let interval1 = Interval.fromDateTimes(time1, time2);
            let interval2 = Interval.fromDateTimes(time3, time4);

            if (!interval1.abutsStart(interval2)) {
              validTimeSlots = false;
              break;
            }
          }
        }

        if (!validTimeSlots) {
          return this.createError("array.timeSlots", { value }, state, options);
        }
        return value;
      }
    }
  ]
}));

const schema = Joi.object()
  .keys({
    arenaId: Joi.number()
      .integer()
      .min(1)
      .required(),
    type: Joi.string()
      .valid("bookaslot", "membership", "coaching")
      .required(),
    categoryName: Joi.string()
      .min(3)
      .max(100)
      .required(),
    description: Joi.string()
      .min(30)
      .required(),
    sport: Joi.string().required(),
    price: Joi.number()
      .integer()
      .min(0)
      .required(),
    startDate: Joi.date()
      .iso()
      .required(),
    endDate: Joi.date()
      .iso()
      .required(),
    period: Joi.when("type", {
      is: "membership",
      then: Joi.number()
        .integer()
        .min(1)
        .required(),
      otherwise: Joi.when("type", {
        is: "coaching",
        then: Joi.number()
          .integer()
          .min(1)
          .required(),
        otherwise: null
      })
    }),
    formId: Joi.when("type", {
      is: "membership",
      then: Joi.number()
        .integer()
        .min(1)
        .required(),
      otherwise: Joi.when("type", {
        is: "coaching",
        then: Joi.number()
          .integer()
          .min(1)
          .required(),
        otherwise: null
      })
    }),
    courtId: Joi.number()
      .integer()
      .min(1)
      .required(),
    minPlayers: Joi.number()
      .integer()
      .min(1)
      .optional(),
    maxPlayers: Joi.number()
      .integer()
      .min(1)
      .optional(),
    timeSlots: Joi.array()
      .items(
        Joi.array()
          .ordered(
            Joi.string()
              .regex(/^([0-1][0-9]|2[0-3]):(00|30)$/)
              .required(),
            Joi.number()
              .integer()
              .min(1)
              .max(48)
              .required()
          )
          .length(2)
          .unique()
          .required()
      )
      .min(1)
      .unique()
      .timeSlots()
      .required()
  })
  .required();

router.post("/bookings", validate(schema), async (req, res) => {
  const client = await database.connect();
  try {
    await client.query("BEGIN");
    const {
      arenaId,
      type,
      categoryName,
      description,
      sport,
      price,
      startDate,
      endDate,
      period,
      formId,
      courtId,
      minPlayers,
      maxPlayers,
      timeSlots
    } = req.body;

    let bookingId;

    if (type === "bookaslot") {
      bookingId = (await client.query(
        `INSERT INTO arena_bookings
      (arena, type, category_name, description, sport, price, date_range)
      VALUES ($1, $2, $3, $4, $5, $6, DATERANGE($7, $8)) RETURNING id
      `,
        [
          arenaId,
          type,
          categoryName,
          description,
          sport,
          price,
          startDate,
          endDate
        ]
      )).rows[0].id;
    } else if (type === "membership" || type === "coaching") {
      bookingId = (await client.query(
        `INSERT INTO arena_bookings
      (arena, type, category_name, description, sport, price, date_range, period, form)
      VALUES ($1, $2, $3, $4, $5, $6, DATERANGE($7, $8), $9, $10) RETURNING id
      `,
        [
          arenaId,
          type,
          categoryName,
          description,
          sport,
          price,
          startDate,
          endDate,
          period,
          formId
        ]
      )).rows[0].id;
    }

    for await (const slot of timeSlots) {
      const lowerBound = Math.ceil(
        DateTime.fromISO(slot[0])
          .diff(DateTime.fromISO("00:00"), "minute")
          .toObject().minutes / 30
      );
      const upperBound = lowerBound + slot[1];

      await client.query(
        `INSERT INTO arena_booking_time_slots (arena_booking, court, slot, min_players, max_players)
        VALUES ($1, $2, INT4RANGE($3, $4), $5, $6)`,
        [bookingId, courtId, lowerBound, upperBound, minPlayers, maxPlayers]
      );
    }

    res.send("added arena booking");
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    console.error(error);
    return res.status(500).send("Internal Server Error");
  } finally {
    client.release();
  }
});

module.exports = router;
