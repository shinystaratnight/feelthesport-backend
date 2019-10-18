const router = require("express").Router();
const database = require("../../database");
const Joi = require("joi");
const _ = require("lodash");

const schema = Joi.object()
  .keys({
    arenaId: Joi.number()
      .integer()
      .min(1)
      .required()
  })
  .required();

router.get("/arena/:id", async (req, res) => {
  const arenaId = Number(req.params.id);
  let canReview = false;
  const validatedParam = Joi.validate({ arenaId }, schema);
  if (validatedParam.error) return res.status(400).send("Bad Request");

  const client = await database.connect();
  try {
    const arenaInfo = (await client.query(
      /* SQL */ `
      SELECT
      arenas.id as "arenaId",
      arenas.name as "arenaName",
      arenas.description as "description",
      arenas.city as "city",
      arenas.area as "area",
      arenas.address as "address",
      arenas.phone as "phone",
      arenas.email as "email",
      arenas.working_days as "workingDays",
      arenas.opening_time as "openingTime",
      arenas.closing_time as "closingTime",
      arenas.image as "image",
      arenas.gallery as "gallery",
      arenas.partners as "partners",
      arenas.social_media as "socialMedia",
      arenas.terms_and_conditions as "termsAndConditions",
      ARRAY(
        SELECT
          facility
        FROM
          arena_facilities
        WHERE
          arena = arenas.id
      ) as "facilities",
      (
        SELECT
          ARRAY_AGG(
            JSON_STRIP_NULLS(
              JSON_BUILD_OBJECT (
                'name',
                name,
                'position',
                position,
                'avatar',
                avatar,
                'socialMedia',
                social_media
              )
            )
          )
        FROM
          board_members
        WHERE
          arena = arenas.id
      ) as "boardMembers",
      (
        SELECT
          ARRAY_AGG(
            JSON_STRIP_NULLS(
              JSON_BUILD_OBJECT (
                'name',
                name,
                'position',
                position,
                'avatar',
                avatar,
                'socialMedia',
                social_media
              )
            )
          )
        FROM
          coaches
        WHERE
          arena = arenas.id
      ) as "coaches",
      (
        SELECT
          ARRAY_AGG(
            JSON_STRIP_NULLS(
              JSON_BUILD_OBJECT(
                'title',
                title,
                'body',
                body,
                'date',
                created_at::DATE,
                'image',
                image
              )
            )
          )
        FROM
          achievements
        WHERE
          arena = arenas.id
      ) as "achievements",
      (
        SELECT
          ARRAY_AGG(
            JSON_STRIP_NULLS(
              JSON_BUILD_OBJECT (
                'title',
                title,
                'body',
                body,
                'date',
                created_at::DATE,
                'image',
                image
              )
            )
          )
        FROM
          news
        WHERE
          arena = arenas.id
      ) as "news",
      (
        SELECT
          ARRAY_AGG(
            JSON_STRIP_NULLS(
              JSON_BUILD_OBJECT (
                'name',
                name,
                'position',
                position,
                'avatar',
                avatar,
                'socialMedia',
                social_media
              )
            )
          )
        FROM
          players
        WHERE
          arena = arenas.id
      ) as "players",
      (
        SELECT
          COUNT(*)
        FROM
          reviews
        WHERE
          arena = arenas.id
      ) :: SMALLINT as "ratingCount",
      (
        SELECT
          COUNT(*)
        FROM
          reviews
        WHERE
          body IS NOT NULL
          AND arena = arenas.id
      ) :: SMALLINT as "reviewCount",
      (
        SELECT
          CASE WHEN arenas.show_rating THEN (
            SELECT
              TRUNC(
                ROUND(
                  (
                    SUM(reviews.rating)::DECIMAL / COUNT(reviews.rating)::DECIMAL
                  ) * 2
                ) / 2,
                1
              )
            FROM
              reviews
            WHERE
              reviews.arena = arenas.id
          ) ELSE NULL END
      ) :: REAL as "rating",
      (
        SELECT
          JSON_AGG(
            JSON_STRIP_NULLS(
              JSON_BUILD_OBJECT(
                'reviewer',
                (
                  SELECT
                    name
                  FROM
                    users
                  WHERE
                    id = review.reviewer
                ),
                'body',
                review.body,
                'rating',
                review.rating,
                'reply',
                (
                  SELECT
                    JSON_BUILD_OBJECT(
                      'replier',
                      replier,
                      'body',
                      body
                    )
                  FROM
                    replies
                  WHERE
                    id = review.id
                )
              )
            )
          )
        FROM
          (
            SELECT
              id,
              reviewer,
              body,
              rating
            FROM
              reviews
            WHERE
              body IS NOT NULL
              AND arena = arenas.id
            ORDER BY
              created_at DESC
            LIMIT
              5
          ) as review
      ) as "reviews",
      (
        SELECT
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'id',
              offers.id,
              'name',
              offers.name,
              'image',
              offers.image,
              'type',
              (
                CASE 
                WHEN offers.city IS NOT NULL THEN 'city'
                WHEN offers.sport IS NOT NULL THEN 'sport'
                WHEN offers.arena IS NOT NULL THEN 'arena'
                WHEN offers.event IS NOT NULL THEN 'event'
                ELSE 'general'
                END
              ),
              'discountType',
              offers.discount_type,
              'discount',
              offers.discount
            )
          )
        FROM
          offers
        WHERE
          offers.date_range @> CURRENT_DATE
          AND (
            offers.arena = arenas.id
            OR offers.city = arenas.city
            OR EXISTS (
              SELECT
                1
              FROM
                arena_bookaslots
              WHERE
                arena_bookaslots.arena = arenas.id 
                AND arena_bookaslots.sport = offers.sport
            )
            OR EXISTS (
              SELECT
                1
              FROM
                events
              JOIN complexes ON complexes.id = events.complex
              WHERE
                complexes.arena IS NOT NULL
                AND complexes.arena = arenas.id
                AND events.date_range @> CURRENT_DATE  
                AND offers.event = events.id
            )
            OR (
              offers.city IS NULL
              AND offers.sport IS NULL
              AND offers.arena IS NULL
              AND offers.event IS NULL
            )
          )
      ) as "offers",
      (
        SELECT
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'id',
              arena_bookaslots.id,
              'categoryName',
              arena_bookaslots.category_name,
              'description',
              arena_bookaslots.description,
              'price',
              arena_bookaslots.price,
              'sport',
              arena_bookaslots.sport
            )
          )
        FROM
          arena_bookaslots
        WHERE
          arena_bookaslots.arena = arenas.id
          AND EXISTS (
            SELECT
              1
            FROM
              arena_time_slots
            WHERE
              arena_time_slots.bookaslot = arena_bookaslots.id
          )
          AND arena_bookaslots.date_range @> CURRENT_DATE
      ) as "bookaslots",
      (
        SELECT
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'categoryName',
              arena_memberships.category_name,
              'description',
              arena_memberships.description,
              'sport',
              arena_memberships.sport,
              'periods',
              (
                SELECT
                  JSON_AGG(
                    JSON_BUILD_OBJECT(
                      'period',
                      arena_membership_periods.period,
                      'price',
                      arena_membership_periods.price
                    )
                  )
                FROM
                  arena_membership_periods
                WHERE
                  arena_membership_periods.membership = arena_memberships.id
              )
            )
          )
        FROM
          arena_memberships
        WHERE
          arena_memberships.arena = arenas.id
          AND EXISTS (
            SELECT
              1
            FROM
              arena_time_slots
            WHERE
              arena_time_slots.membership = arena_memberships.id
          )
          AND EXISTS (
            SELECT
              1
            FROM
              arena_membership_periods
            WHERE
              arena_membership_periods.membership = arena_memberships.id
              AND UPPER(arena_memberships.date_range) - 
              arena_membership_periods.period >= CURRENT_DATE
          )
          AND arena_memberships.form IS NOT NULL
          AND arena_memberships.date_range @> CURRENT_DATE
      ) as "memberships",
      (
        SELECT
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'categoryName',
              arena_coachings.category_name,
              'description',
              arena_coachings.description,
              'sport',
              arena_coachings.sport,
              'periods',
              (
                SELECT
                  JSON_AGG(
                    JSON_BUILD_OBJECT(
                      'period',
                      arena_coaching_periods.period,
                      'price',
                      arena_coaching_periods.price
                    )
                  )
                FROM
                  arena_coaching_periods
                WHERE
                  arena_coaching_periods.coaching = arena_coachings.id
              )
            )
          )
        FROM
          arena_coachings
        WHERE
          arena_coachings.arena = arenas.id
          AND EXISTS (
            SELECT
              1
            FROM
              arena_time_slots
            WHERE
              arena_time_slots.coaching = arena_coachings.id
          )
          AND EXISTS (
            SELECT
              1
            FROM
              arena_coaching_periods
            WHERE
              arena_coaching_periods.coaching = arena_coachings.id
              AND UPPER(arena_coachings.date_range) - 
              arena_coaching_periods.period >= CURRENT_DATE
          )
          AND arena_coachings.form IS NOT NULL
          AND arena_coachings.date_range @> CURRENT_DATE
      ) as "coachings",
      (
        SELECT
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'id',
              events.id,
              'name',
              events.name,
              'sport',
              events.sport,
              'image',
              events.image,
              'startDate',
              (LOWER(events.date_range))::TEXT,
              'endDate',
              (UPPER(events.date_range))::TEXT,
              'startTime',
              (LOWER(events.time_range) * TIME '00:30')::TEXT,
              'endTime',
              (UPPER(events.time_range) * TIME '00:30')::TEXT,
              'startAge',
              (LOWER(events.age_range)),
              'endAge',
              (UPPER(events.age_range)),
              'organizer',
              (
                CASE WHEN organizers.arena IS NULL THEN organizers.organizer ELSE (
                  SELECT
                    ar.name
                  FROM
                    arenas as ar
                  WHERE
                    organizers.arena = ar.id
                ) END
              ),
              'complex',
              (
                CASE WHEN complexes.arena IS NULL THEN complexes.name ELSE arenas.name END
              ),
              'city',
              (
                CASE WHEN complexes.arena IS NULL THEN complexes.city ELSE arenas.city END
              ),
              'area',
              (
                CASE WHEN complexes.arena IS NULL THEN complexes.area ELSE arenas.area END
              ),
              'price',
              (
                SELECT
                  MIN(ec.price)
                FROM
                  event_categories as ec
                WHERE
                  ec.event = events.id
              )
            )
          )
        FROM
          events
          JOIN organizers ON events.organizer = organizers.id
          JOIN complexes ON events.complex = complexes.id
        WHERE
          events.form IS NOT NULL
          AND EXISTS(
            SELECT
              1
            FROM
              event_categories
            WHERE
              event_categories.event = events.id
          )
          AND (
            complexes.arena = arenas.id
            OR organizers.arena = arenas.id
          )
          AND UPPER(events.date_range) < CURRENT_DATE
      ) as "pastEvents",
      (
        SELECT
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'id',
              events.id,
              'name',
              events.name,
              'sport',
              events.sport,
              'image',
              events.image,
              'startDate',
              (LOWER(events.date_range))::TEXT,
              'endDate',
              (UPPER(events.date_range))::TEXT,
              'startTime',
              (LOWER(events.time_range) * TIME '00:30'),
              'endTime',
              (UPPER(events.time_range) * TIME '00:30'),
              'startAge',
              (LOWER(events.age_range)),
              'endAge',
              (UPPER(events.age_range)),
              'organizer',
              (
                CASE WHEN organizers.arena IS NULL THEN organizers.organizer ELSE (
                  SELECT
                    ar.name
                  FROM
                    arenas as ar
                  WHERE
                    organizers.arena = ar.id
                ) END
              ),
              'complex',
              (
                CASE WHEN complexes.arena IS NULL THEN complexes.name ELSE arenas.name END
              ),
              'city',
              (
                CASE WHEN complexes.arena IS NULL THEN complexes.city ELSE arenas.city END
              ),
              'area',
              (
                CASE WHEN complexes.arena IS NULL THEN complexes.area ELSE arenas.area END
              ),
              'price',
              (
                SELECT
                  MIN(ec.price)
                FROM
                  event_categories as ec
                WHERE
                  ec.event = events.id
              )
            )
          )
        FROM
          events
          JOIN organizers ON events.organizer = organizers.id
          JOIN complexes ON events.complex = complexes.id
        WHERE
          events.form IS NOT NULL
          AND EXISTS(
            SELECT
              1
            FROM
              event_categories
            WHERE
              event_categories.event = events.id
          )
          AND (
            complexes.arena = arenas.id
            OR organizers.arena = arenas.id
          )
          AND events.date_range @> CURRENT_DATE
      ) as "presentEvents",
      (
        SELECT
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'id',
              events.id,
              'name',
              events.name,
              'sport',
              events.sport,
              'image',
              events.image,
              'startDate',
              (LOWER(events.date_range))::TEXT,
              'endDate',
              (UPPER(events.date_range))::TEXT,
              'startTime',
              (LOWER(events.time_range) * TIME '00:30'),
              'endTime',
              (UPPER(events.time_range) * TIME '00:30'),
              'startAge',
              (LOWER(events.age_range)),
              'endAge',
              (UPPER(events.age_range)),
              'organizer',
              (
                CASE WHEN organizers.arena IS NULL THEN organizers.organizer ELSE (
                  SELECT
                    ar.name
                  FROM
                    arenas as ar
                  WHERE
                    organizers.arena = ar.id
                ) END
              ),
              'complex',
              (
                CASE WHEN complexes.arena IS NULL THEN complexes.name ELSE arenas.name END
              ),
              'city',
              (
                CASE WHEN complexes.arena IS NULL THEN complexes.city ELSE arenas.city END
              ),
              'area',
              (
                CASE WHEN complexes.arena IS NULL THEN complexes.area ELSE arenas.area END
              ),
              'price',
              (
                SELECT
                  MIN(ec.price)
                FROM
                  event_categories as ec
                WHERE
                  ec.event = events.id
              )
            )
          )
        FROM
          events
          JOIN organizers ON events.organizer = organizers.id
          JOIN complexes ON events.complex = complexes.id
        WHERE
          events.form IS NOT NULL
          AND EXISTS(
            SELECT
              1
            FROM
              event_categories
            WHERE
              event_categories.event = events.id
          )
          AND (
            complexes.arena = arenas.id
            OR organizers.arena = arenas.id
          )
          AND LOWER(events.date_range) > CURRENT_DATE
      ) as "futureEvents",
      (
        SELECT
          JSON_OBJECT_AGG(
            y.sport,
            ARRAY_TO_STRING(
              ARRAY(
                SELECT
                  JSON_ARRAY_ELEMENTS_TEXT(y.types)
              ),
              ', '
            )
          )
        FROM
          (
            SELECT
              x.sport as "sport",
              JSON_AGG(DISTINCT x.type) as "types"
            FROM
              (
                (
                  SELECT
                    arena_bookaslots.sport as "sport",
                    courts.type as "type"
                  FROM
                    arena_time_slots
                    JOIN courts ON arena_time_slots.court = courts.id
                    JOIN arena_bookaslots ON arena_bookaslots.id = arena_time_slots.bookaslot
                  WHERE
                    arena_bookaslots.arena = arenas.id
                    AND arena_bookaslots.date_range @> CURRENT_DATE
                )
                UNION ALL
                  (
                    SELECT
                      arena_memberships.sport as "sport",
                      courts.type as "type"
                    FROM
                      arena_time_slots
                      JOIN courts ON arena_time_slots.court = courts.id
                      JOIN arena_memberships ON arena_memberships.id = arena_time_slots.membership
                    WHERE
                      arena_memberships.arena = arenas.id
                      AND arena_memberships.date_range @> CURRENT_DATE
                  )
                UNION ALL
                  (
                    SELECT
                      arena_coachings.sport as "sport",
                      courts.type as "type"
                    FROM
                      arena_time_slots
                      JOIN courts ON arena_time_slots.court = courts.id
                      JOIN arena_coachings ON arena_coachings.id = arena_time_slots.coaching
                    WHERE
                      arena_coachings.arena = arenas.id
                      AND arena_coachings.date_range @> CURRENT_DATE
                  )
              ) as x
            GROUP BY
              x.sport
          ) as y
      ) as "courtTypes",
      (
        SELECT
        MIN ((price / time) * 2) as "costPerHour"
      FROM
        (
          (
            SELECT
              arena_bookaslots.price as "price",
              UPPER(arena_time_slots.slot) - LOWER(arena_time_slots.slot) as "time"
            FROM
              arena_bookaslots
              JOIN arena_time_slots ON arena_time_slots.bookaslot = arena_bookaslots.id
            WHERE
              arena_bookaslots.arena = arenas.id
              AND arena_bookaslots.date_range @> CURRENT_DATE
          )
          UNION ALL
            (
              SELECT
                arena_membership_periods.price as "price",
                UPPER(arena_time_slots.slot) - LOWER(arena_time_slots.slot) as "time"
              FROM
                arena_membership_periods
                JOIN arena_memberships ON arena_memberships.id = arena_membership_periods.membership
                JOIN arena_time_slots ON arena_time_slots.membership = arena_memberships.id
              WHERE
                arena_memberships.form IS NOT NULL
                AND arena_memberships.arena = arenas.id
                AND arena_memberships.date_range @> CURRENT_DATE
            )
          UNION ALL
            (
              SELECT
                arena_coaching_periods.price as "price",
                UPPER(arena_time_slots.slot) - LOWER(arena_time_slots.slot) as "time"
              FROM
                arena_coaching_periods
                JOIN arena_coachings ON arena_coachings.id = arena_coaching_periods.coaching
                JOIN arena_time_slots ON arena_time_slots.coaching = arena_coachings.id
              WHERE
                arena_coachings.form IS NOT NULL
                AND arena_coachings.arena = arenas.id
                AND arena_coachings.date_range @> CURRENT_DATE
            )
        ) pricetime
      )
    FROM
      arenas
    WHERE
      arenas.id = $1
      `,
      [arenaId]
    )).rows[0];

    if (!arenaInfo) {
      return res.status(404).send("arena does not exist");
    }

    if (req.user) {
      const { numOfUserArenaReviews } = (await client.query(
        /* SQL */ `
        SELECT
          COUNT(*) as "numOfUserArenaReviews"
        FROM
          reviews
        WHERE
          reviewer = $1
          AND arena = $2
        `,
        [req.user.id, arenaInfo.arenaId]
      )).rows[0];

      const { numOfUserArenaTransactions } = (await client.query(
        /* SQL */ `
        SELECT
          COUNT(transaction_items.id) as "numOfUserArenaTransactions"
        FROM
          transactions
          JOIN transaction_items ON transaction_items.transaction = transactions.id
          JOIN arena_time_slots ON arena_time_slots.id = transaction_items.bookaslot_slot
          JOIN arena_bookaslots ON arena_bookaslots.id = arena_time_slots.bookaslot
        WHERE
          transactions.user_id = $1
          AND arena_bookaslots.arena = $2
        `,
        [req.user.id, arenaInfo.arenaId]
      )).rows[0];

      if (numOfUserArenaTransactions > numOfUserArenaReviews) canReview = true;
    }

    let subscriptions = {};

    if (arenaInfo.bookaslots) {
      arenaInfo.bookaslots.forEach(bookaslot => {
        if (!subscriptions[bookaslot.sport]) {
          subscriptions[bookaslot.sport] = {};
          subscriptions[bookaslot.sport].bookaslots = _.omit(
            bookaslot,
            "sport"
          );
        } else if (!subscriptions[bookaslot.sport].bookaslots) {
          subscriptions[bookaslot.sport].bookaslots = _.omit(
            bookaslot,
            "sport"
          );
        } else {
          subscriptions[bookaslot.sport] = {
            ...subscriptions[bookaslot.sport],
            bookaslots: {
              ...subscriptions[bookaslot.sport].bookaslots,
              ..._.omit(bookaslot, "sport")
            }
          };
        }
      });
    }
    if (arenaInfo.memberships) {
      arenaInfo.memberships.forEach(membership => {
        if (!subscriptions[membership.sport]) {
          subscriptions[membership.sport] = {};
          subscriptions[membership.sport].memberships = [
            _.omit(membership, "sport")
          ];
        } else if (!subscriptions[membership.sport].memberships) {
          subscriptions[membership.sport].memberships = [
            _.omit(membership, "sport")
          ];
        } else {
          subscriptions[membership.sport] = {
            ...subscriptions[membership.sport],
            memberships: [
              ...subscriptions[membership.sport].memberships,
              _.omit(membership, "sport")
            ]
          };
        }
      });
    }
    if (arenaInfo.coachings) {
      arenaInfo.coachings.forEach(coaching => {
        if (!subscriptions[coaching.sport]) {
          subscriptions[coaching.sport] = {};
          subscriptions[coaching.sport].coachings = [_.omit(coaching, "sport")];
        } else if (!subscriptions[coaching.sport].coachings) {
          subscriptions[coaching.sport].coachings = [_.omit(coaching, "sport")];
        } else {
          subscriptions[coaching.sport] = {
            ...subscriptions[coaching.sport],
            coachings: [
              ...subscriptions[coaching.sport].coachings,
              _.omit(coaching, "sport")
            ]
          };
        }
      });
    }

    res.json({
      ...arenaInfo,
      sports: Object.keys(subscriptions),
      subscriptions,
      canReview
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal Server Error");
  } finally {
    client.release();
  }
});

module.exports = router;
