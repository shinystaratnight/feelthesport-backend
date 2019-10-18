const router = require("express").Router();
const database = require("../../database");
const Joi = require("joi");
const _ = require("lodash");

const schema = Joi.object()
  .keys({
    bookaslotId: Joi.number()
      .integer()
      .min(1)
      .required()
  })
  .required();

router.get("/bookaslot/:id", async (req, res) => {
  const bookaslotId = Number(req.params.id);
  const validatedParam = Joi.validate({ bookaslotId }, schema);
  if (validatedParam.error) return res.status(400).send("Bad Request");

  const client = await database.connect();
  try {
    const response = (await client.query(
      /* SQL */ `
    SELECT
    arena_bookaslots.arena as "arenaId",
    (
      SELECT
        name
      FROM
        arenas
      WHERE
        id = arena_bookaslots.arena
    ) as "arenaName",
    arena_bookaslots.sport as "sport",
    arena_bookaslots.price as "price",
    arena_bookaslots.charge_per_player as "chargePerPlayer",
    (
      SELECT
        MIN ((price / time) * 2)
      FROM
        (
          (
            SELECT
              ab.price as "price",
              UPPER(ats.slot) - LOWER(ats.slot) as "time"
            FROM
              arena_bookaslots as ab
              JOIN arena_time_slots as ats ON ats.bookaslot = ab.id
            WHERE
              ab.id = arena_bookaslots.id
          )
        ) pricetime
    ) as "costPerHour",
    (
      SELECT
        JSON_OBJECT_AGG(
          courts.id,
          (
            JSON_BUILD_OBJECT(
              'type',
              courts.type,
              'minPlayers',
              arena_time_slots.min_players,
              'maxPlayers',
              arena_time_slots.max_players
            )
          )
        )
      FROM
        courts
        JOIN arena_time_slots ON arena_time_slots.court = courts.id
      WHERE
        arena_time_slots.bookaslot = arena_bookaslots.id
    ) as "courts",
    (
        select JSON_OBJECT_AGG(
                       courts.id,
                       (SELECT JSON_OBJECT_AGG(
                                       ats.id,
                                       TO_CHAR(LOWER(ats.slot) * TIME '00:30', 'HH12:MIam')
                                           || '-' ||
                                       TO_CHAR(UPPER(ats.slot) * TIME '00:30', 'HH12:MIam')
                                   )
                        FROM arena_time_slots as ats
                        WHERE ats.bookaslot = arena_bookaslots.id
                          and ats.court = courts.id)) as DD

        from courts
        WHERE EXISTS(
                      SELECT 1
                      FROM arena_time_slots
                      WHERE court = courts.id
                        AND bookaslot = arena_bookaslots.id
                  )
    ) as "slotTimes",
    (
      SELECT
        JSON_OBJECT_AGG(
          "date"::DATE,
          (
            SELECT
              JSON_OBJECT_AGG(
                courts.id,
                (
                  SELECT
                    JSON_OBJECT_AGG(
                      ats.id,
                      (
                        CASE
                        WHEN 
                        (
                          (((LOWER(ats.slot) * TIME '00:30') + "date") <= NOW())
                          OR
                          EXISTS(
                            SELECT
                              1
                            FROM
                              transaction_items
                            WHERE
                              transaction_items.bookaslot_slot = ats.id
                              AND transaction_items.bookaslot_date = "date"
                          )

                        ) THEN 'unavailable'
                        WHEN (
                          EXISTS(
                            SELECT
                              1
                            FROM
                              cart_items
                            WHERE
                              cart_items.bookaslot_slot = ats.id
                              AND cart_items.bookaslot_date = "date"
                          )
                        ) THEN 'inProcess'
                        ELSE 'available'
                        END
                      )
                    )
                  FROM
                    arena_time_slots as ats
                  WHERE
                    ats.bookaslot = arena_bookaslots.id
                    AND ats.court = courts.id
                )

              )
            FROM
              courts
            WHERE
              EXISTS (
                SELECT
                  1
                FROM
                  arena_time_slots
                WHERE
                  court = courts.id
                  AND bookaslot = arena_bookaslots.id
              )
          )
        )
      FROM
        generate_series(
          CURRENT_DATE,
          (
            CASE 
            WHEN UPPER(arena_bookaslots.date_range) < (CURRENT_DATE + INTERVAL '13 days') 
            THEN UPPER(arena_bookaslots.date_range) 
            ELSE CURRENT_DATE + INTERVAL '13 days' 
            END
          ),
          INTERVAL '1 day'
        ) as "date"
    ) as "slots"
  FROM
    arena_bookaslots
  WHERE
    arena_bookaslots.id = $1
      `,
      [bookaslotId]
    )).rows[0];

    if (!response) {
      return res.status(404).send("bookaslot does not exist");
    }

    res.json(response);
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal Server Error");
  } finally {
    client.release();
  }
});

module.exports = router;
