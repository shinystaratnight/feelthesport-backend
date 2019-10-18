const router = require("express").Router();
const database = require("../../database");
const Joi = require("joi");
const { DateTime } = require("luxon");
const _ = require("lodash");

const schema = Joi.object()
  .keys({
    bookingId: Joi.number()
      .integer()
      .min(1)
      .required()
  })
  .required();

router.get("/booking/:id", async (req, res) => {
  const bookingId = Number(req.params.id);
  const validatedParam = Joi.validate({ bookingId }, schema);
  if (validatedParam.error) return res.status(400).send("Bad Request");

  const client = await database.connect();
  try {
    const bookingInfo = (await client.query(
      /* SQL */ `
    SELECT
    arenas.id as arena_id,
    arenas.name as arena_name,
    a.price as price,
   -- a.max_players as max_players,
    a.price as price,
  (
    SELECT
      JSON_STRIP_NULLS(
        JSON_OBJECT_AGG(
          b.id,
          b.type
        )
      )
    FROM
      courts as b
    WHERE
      b.arena = arenas.id
  ) as court_types,
  (
    SELECT
      JSON_STRIP_NULLS(
        JSON_OBJECT_AGG(
          b.court,
          (
            SELECT
              ARRAY_AGG(
                ARRAY[
                  (LOWER(c.slot) * time '00:30') :: TIME,
                  (UPPER(c.slot) * time '00:30') :: TIME
                ]
              )
            FROM
              arena_time_slots as c
            WHERE
              c.bookaslot = a.id
              AND c.court = b.court
          )
        )
      )
    FROM
      arena_time_slots as b
    WHERE
      b.bookaslot = a.id
  ) as time_slots,
  ARRAY [
    LOWER(date_range) :: TEXT,
    UPPER(date_range) :: TEXT
  ] as date_range,
  (
    SELECT
      JSON_STRIP_NULLS(
        JSON_OBJECT_AGG(
          b.bookaslot_date :: DATE,
          (
            SELECT
              JSON_STRIP_NULLS(
                JSON_OBJECT_AGG(
                  d.court,
                  (
                    SELECT
                      ARRAY_AGG(
                        ARRAY [
                          (LOWER(e.slot) * time '00:30') :: TIME,
                          (UPPER(e.slot) * time '00:30') :: TIME
                        ]
                      )
                    FROM
                      transactions as f
                      JOIN arena_time_slots as e ON f.bookaslot_date = b.bookaslot_date
                      AND e.id = f.bookaslot_slot
                      AND e.court = d.court
                  )
                )
              )
            FROM
              arena_time_slots as d
            WHERE
              d.bookaslot = a.id
          )
        )
      )
    FROM
      transactions as b
      JOIN arena_time_slots as c ON c.id = b.bookaslot_slot
      AND b.bookaslot_date >= NOW() :: DATE
      AND b.bookaslot_date <= NOW() :: DATE + INTERVAL '2 weeks'
      AND c.bookaslot = a.id
  ) as booked_slots,
  (
    SELECT
      JSON_STRIP_NULLS(
        JSON_OBJECT_AGG(
          b.bookaslot_date :: DATE,
          (
            SELECT
              JSON_STRIP_NULLS(
                JSON_OBJECT_AGG(
                  d.court,
                  (
                    SELECT
                      ARRAY_AGG(
                        ARRAY [
                          (LOWER(e.slot) * time '00:30') :: TIME,
                          (UPPER(e.slot) * time '00:30') :: TIME
                        ]
                      )
                    FROM
                      carts as f
                      JOIN arena_time_slots as e ON f.bookaslot_date = b.bookaslot_date
                      AND e.id = f.bookaslot_slot
                      AND e.court = d.court
                  )
                )
              )
            FROM
              arena_time_slots as d
            WHERE
              d.bookaslot = a.id
          )
        )
      )
    FROM
      carts as b
      JOIN arena_time_slots as c ON c.id = b.bookaslot_slot
      AND b.created_at + INTERVAL '8 minute' > NOW() 
      AND c.bookaslot = a.id
  ) as inprocess_slots
FROM
  arena_bookaslots as a
  JOIN arenas ON a.arena = arenas.id
  AND a.id = $1`,
      [bookingId]
    )).rows[0];

    // TODO: return arena not found here if arenaInfo === null

    // const currentDateTime = DateTime.utc().setZone("UTC+5:30");
    const currentDateTime = DateTime.local();
    const currentDate = currentDateTime.toFormat("yyyy-LL-dd");

    let bookingDates = [];
    for (let i = 0; i < 14; i++) {
      bookingDates.push(
        currentDateTime.plus({ days: i }).toFormat("yyyy-LL-dd")
      );

      if (
        DateTime.fromISO(bookingDates[bookingDates.length - 1]) >=
        DateTime.fromISO(bookingInfo.date_range[1])
      ) {
        break;
      }
    }

    let unavailableSlots = bookingInfo.booked_slots;
    let inProcessSlots = bookingInfo.inprocess_slots;

    Object.entries(bookingInfo.time_slots).forEach(([key, value]) => {
      if (
        unavailableSlots &&
        unavailableSlots[currentDate] &&
        unavailableSlots[currentDate][key]
      ) {
        unavailableSlots[currentDate][key] = _.uniqWith(
          value
            .filter(([st, et]) => currentDateTime >= DateTime.fromISO(st))
            .concat(unavailableSlots[currentDate][key]),
          _.isEqual
        );
      }
    });

    Object.entries(bookingInfo.time_slots).forEach(([key, value]) => {
      if (
        inProcessSlots &&
        inProcessSlots[currentDate] &&
        inProcessSlots[currentDate][key]
      ) {
        inProcessSlots[currentDate][key] = _.uniqWith(
          value
            .filter(([st, et]) => currentDateTime >= DateTime.fromISO(st))
            .concat(inProcessSlots[currentDate][key]),
          _.isEqual
        );
      }
    });

    res.json({
      arenaId: bookingInfo.arena_id,
      arenaName: bookingInfo.arena_name,
      price: bookingInfo.price,
      // maxPlayers: bookingInfo.max_players,
      courtTypes: bookingInfo.court_types,
      bookingDates: bookingDates,
      timeSlots: bookingInfo.time_slots,
      unavailableSlots: unavailableSlots,
      inProcessSlots: inProcessSlots
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal Server Error");
  } finally {
    client.release();
  }
});

module.exports = router;
