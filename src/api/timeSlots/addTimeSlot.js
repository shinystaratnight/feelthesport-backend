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
    bookaslotId: Joi.number()
      .integer()
      .min(1)
      .optional(),
    membershipId: Joi.number()
      .integer()
      .min(1)
      .optional(),
    coachingId: Joi.number()
      .integer()
      .min(1)
      .optional(),
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
      .min(Joi.ref("minPlayers"))
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
  .xor("bookaslotId", "membershipId", "coachingId")
  .and("minPlayers", "maxPlayers")
  .required();

router.post("/timeSlots", validate(schema), async (req, res) => {
  const client = await database.connect();
  try {
    await client.query("BEGIN");
    const {
      bookaslotId,
      membershipId,
      coachingId,
      courtId,
      minPlayers,
      maxPlayers,
      timeSlots
    } = req.body;

    for await (const slot of timeSlots) {
      const lowerBound = Math.ceil(
        DateTime.fromISO(slot[0])
          .diff(DateTime.fromISO("00:00"), "minute")
          .toObject().minutes / 30
      );
      const upperBound = lowerBound + slot[1];

      await client.query(
        `INSERT INTO arena_time_slots
        (bookaslot, membership, coaching, court, min_players, max_players, slot)
        VALUES ($1, $2, $3, $4, $5, $6, INT4RANGE($7, $8))`,
        [
          bookaslotId,
          membershipId,
          coachingId,
          courtId,
          minPlayers,
          maxPlayers,
          lowerBound,
          upperBound
        ]
      );
    }

    res.send("added time slots");
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
