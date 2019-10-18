const router = require("express").Router();
const database = require("../../database");
const passport = require('passport');
const _ = require("lodash");
const bookaslotsCartObjectBuilder = require("../../helpers/objectBuilders/bookaslotsCartObjectBuilder");
const membershipsCartObjectBuilder = require("../../helpers/objectBuilders/membershipsCartObjectBuilder");
const coachingsCartObjectBuilder = require("../../helpers/objectBuilders/coachingsCartObjectBuilder");
const eventsCartObjectBuilder = require("../../helpers/objectBuilders/eventsCartObjectBuilder");
const addCostToBookaslotsCart = require("../../helpers/addCostToBookaslotsCart");
const addCostToMembershipsCart = require("../../helpers/addCostToMembershipsCart");
const addCostToCoachingsCart = require("../../helpers/addCostToCoachingsCart");
const addCostToEventsCart = require("../../helpers/addCostToEventsCart");

router.get("/carts", passport.authenticate('jwt'),  async (req, res) => {
  const userId = req.user.id;

  const client = await database.connect();
  try {
    await client.query("BEGIN");

    await client.query(
      /* SQL */ `SELECT * FROM cart_items WHERE cart = $1 FOR UPDATE`,
      [userId]
    );

    const bookaslotsResponse = (await client.query(
      /* SQL */ `
      SELECT
      a.id as "itemId",
      d.name as "arenaName",
      d.address as "address",
      c.id as "bookaslotId",
      a.bookaslot_date::TEXT as "bookaslotDate",
      f.id as "courtId",
      f.type as "courtType",
      c.price as "slotCost",
      c.charge_per_player as "chargePerPlayer",
      a.bookaslot_players as "numOfPlayers",
      JSON_BUILD_OBJECT('name', e.sport, 'icon', e.icon) as "sport",
      TO_CHAR(LOWER(b.slot) * TIME '00:30', 'HH12:MIam') 
      || '-' || 
      TO_CHAR(UPPER(b.slot) * TIME '00:30', 'HH12:MIam') as "timeSlots"
    FROM
      cart_items as a
      JOIN arena_time_slots as b ON b.id = a.bookaslot_slot
      JOIN arena_bookaslots as c ON c.id = b.bookaslot
      JOIN arenas as d ON d.id = c.arena
      JOIN sports as e ON c.sport = e.sport
      JOIN courts f ON b.court = f.id
    WHERE
      a.cart = $1
    ORDER BY a.bookaslot_date
`,
      [userId]
    )).rows;

    const eventsResponse = (await client.query(
      /* SQL */ `
          SELECT
          a.id as "itemId",
          c.id as "eventId",
          c.name as "eventName",
          (
            CASE WHEN e.arena IS NULL THEN e.address
            ELSE f.address END
          ) as "address",
          JSON_BUILD_OBJECT('name', d.sport, 'icon', d.icon) as "sport",
          (LOWER(c.date_range))::TEXT as "startDate",
          (UPPER(c.date_range))::TEXT as "endDate",
          (LOWER(c.time_range) * TIME '00:30')::TEXT as "startTime",
          (UPPER(c.time_range) * TIME '00:30')::TEXT as "endTime",
          b.id as "eventCategoryId",
          JSON_BUILD_OBJECT('name', b.name, 'price', b.price) as "eventCategory",
          g.id as "formSubmissionId",
          h.id as "formSubmissionFieldId",
          (
            CASE
            WHEN (h.input_text IS NOT NULL) THEN JSON_BUILD_OBJECT('field', i.name, 'input', h.input_text)
            WHEN (h.input_number IS NOT NULL) THEN JSON_BUILD_OBJECT('field', i.name, 'input', h.input_number)
            WHEN (h.input_date IS NOT NULL) THEN JSON_BUILD_OBJECT('field', i.name, 'input', h.input_date)
            ELSE JSON_BUILD_OBJECT('field', i.name, 'input', h.input_array)
            END
          ) as "formSubmissionFieldInfo"
        FROM
          cart_items as a
          JOIN event_categories as b ON b.id = a.event_category
          JOIN events as c ON c.id = b.event
          Join sports as d ON d.sport = c.sport
          JOIN complexes as e ON e.id = c.complex
          LEFT JOIN arenas as f ON e.arena = f.id
          JOIN registration_form_submissions as g ON a.form_submission = g.id
          LEFT JOIN registration_form_submission_fields as h ON h.submission = g.id
          LEFT JOIN form_fields as i ON i.id = h.field
        WHERE
          a.cart = $1
    `,
      [userId]
    )).rows;

    const membershipsResponse = (await client.query(
      /* SQL */ `
          SELECT
          a.id as "itemId",
          b.id as "membershipPeriodId",
          c.id as "membershipId",
          d.name as "arenaName",
          d.address as "address",
          JSON_BUILD_OBJECT('name', e.sport, 'icon', e.icon) as "sport",
          (CURRENT_DATE)::TEXT as "startDate",
          (CURRENT_DATE + b.period)::TEXT as "endDate",
          b.period as "period",
          JSON_BUILD_OBJECT('name', c.category_name, 'price', b.price) as "membershipPeriod",
          f.id as "formSubmissionId",
          g.id as "formSubmissionFieldId",
          (
            CASE
            WHEN (g.input_text IS NOT NULL) THEN JSON_BUILD_OBJECT('field', h.name, 'input', g.input_text)
            WHEN (g.input_number IS NOT NULL) THEN JSON_BUILD_OBJECT('field', h.name, 'input', g.input_number)
            WHEN (g.input_date IS NOT NULL) THEN JSON_BUILD_OBJECT('field', h.name, 'input', g.input_date)
            ELSE JSON_BUILD_OBJECT('field', h.name, 'input', g.input_array)
            END
          ) as "formSubmissionFieldInfo"
        FROM
          cart_items as a
          JOIN arena_membership_periods as b ON b.id = a.membership_period
          JOIN arena_memberships as c ON c.id = b.membership
          JOIN arenas as d ON d.id = c.arena
          JOIN sports as e ON e.sport = c.sport
          JOIN registration_form_submissions as f ON f.id = a.form_submission
          LEFT JOIN registration_form_submission_fields as g ON g.submission = f.id
          LEFT JOIN form_fields as h ON h.id = g.field
        WHERE
          a.cart = $1
    `,
      [userId]
    )).rows;

    const coachingsResponse = (await client.query(
      /* SQL */ `
          SELECT
          a.id as "itemId",
          b.id as "coachingPeriodId",
          c.id as "coachingId",
          d.name as "arenaName",
          d.address as "address",
          JSON_BUILD_OBJECT('name', e.sport, 'icon', e.icon) as "sport",
          (CURRENT_DATE)::TEXT as "startDate",
          (CURRENT_DATE + b.period)::TEXT as "endDate",
          b.period as "period",
          JSON_BUILD_OBJECT('name', c.category_name, 'price', b.price) as "coachingPeriod",
          f.id as "formSubmissionId",
          g.id as "formSubmissionFieldId",
          (
            CASE
            WHEN (g.input_text IS NOT NULL) THEN JSON_BUILD_OBJECT('field', h.name, 'input', g.input_text)
            WHEN (g.input_number IS NOT NULL) THEN JSON_BUILD_OBJECT('field', h.name, 'input', g.input_number)
            WHEN (g.input_date IS NOT NULL) THEN JSON_BUILD_OBJECT('field', h.name, 'input', g.input_date)
            ELSE JSON_BUILD_OBJECT('field', h.name, 'input', g.input_array)
            END
          ) as "formSubmissionFieldInfo"
        FROM
          cart_items as a
          JOIN arena_coaching_periods as b ON b.id = a.coaching_period
          JOIN arena_coachings as c ON c.id = b.coaching
          JOIN arenas as d ON d.id = c.arena
          JOIN sports as e ON e.sport = c.sport
          JOIN registration_form_submissions as f ON f.id = a.form_submission
          LEFT JOIN registration_form_submission_fields as g ON g.submission = f.id
          LEFT JOIN form_fields as h ON h.id = g.field
        WHERE
          a.cart = $1
    `,
      [userId]
    )).rows;

    const offers = (await client.query(
      /* SQL */ `
      SELECT
        DISTINCT ON (offers.id)
        offers.id as "id",
        offers.name as "name",
        (
          CASE 
          WHEN offers.city IS NOT NULL THEN 'city'
          WHEN offers.sport IS NOT NULL THEN 'sport'
          WHEN offers.arena IS NOT NULL THEN 'arena'
          WHEN offers.event IS NOT NULL THEN 'event'
          ELSE 'general'
          END
        ) as "type",
        offers.discount_type as "discountType",
        offers.discount as "discount",
        offers.coupon_code as "couponCode"
      FROM
        cart_items, offers
      WHERE
        offers.date_range @> CURRENT_DATE
        AND (
          offers.city = cart_items.city
          OR offers.sport = cart_items.sport
          OR offers.arena = cart_items.arena
          OR offers.event = cart_items.event
          OR (
            offers.city IS NULL
            AND offers.sport IS NULL
            AND offers.arena IS NULL
            AND offers.event IS NULL
          )
        )
        AND cart_items.cart = $1
    `,
      [userId]
    )).rows;

    let {
      offer_used: usedOfferId,
      points_used: usedPoints
    } = (await client.query(
      /* SQL */ `
      SELECT
        offer_used,
        points_used
      FROM
        carts
      WHERE
        user_id = $1
      `,
      [userId]
    )).rows[0];

    await client.query(
      /* SQL */ `
      UPDATE
        carts
      SET
        last_user_request_at = NOW(),
        updated_at = NOW()
      WHERE
        user_id = $1
      `,
      [userId]
    );

    if (
      bookaslotsResponse.length === 0 &&
      eventsResponse.length === 0 &&
      membershipsResponse.length === 0 &&
      coachingsResponse.length === 0
    ) {
      return res.json({ cart: [] });
    }

    let bookaslotsCart = { cost: 0 };
    let eventsCart = { cost: 0 };
    let membershipsCart = { cost: 0 };
    let coachingsCart = { cost: 0 };
    let totalDiscount = 0;

    if (bookaslotsResponse.length !== 0) {
      bookaslotsCart = addCostToBookaslotsCart(
        bookaslotsCartObjectBuilder(bookaslotsResponse)
      );
    }
    if (eventsResponse.length !== 0) {
      eventsCart = addCostToEventsCart(eventsCartObjectBuilder(eventsResponse));
    }
    if (membershipsResponse.length !== 0) {
      membershipsCart = addCostToMembershipsCart(
        membershipsCartObjectBuilder(membershipsResponse)
      );
    }
    if (coachingsResponse.length !== 0) {
      coachingsCart = addCostToCoachingsCart(
        coachingsCartObjectBuilder(coachingsResponse)
      );
    }

    let usedOffer = null;
    let totalCost = bookaslotsCart.cost +
      membershipsCart.cost +
      coachingsCart.cost +
      eventsCart.cost;
    const percentOfPoints = ((totalCost * 20) / 100).toFixed(0)
    if(usedPoints > percentOfPoints){
      await client.query(
        /* SQL */ `
                  UPDATE
                      carts
                  SET
                      points_used = $2,
                      updated_at = NOW()
                  WHERE
                      user_id = $1`,
        [userId, percentOfPoints]
      );
      usedPoints = percentOfPoints
    }


    if(usedOfferId !== null){
      offers.forEach(function (singleOffer) {
        if(singleOffer.id == usedOfferId){
          if(singleOffer.discountType === 'amount' ){
            totalDiscount = singleOffer.discount;
          }else  if(singleOffer.discountType === 'percent' ){
            totalDiscount = ((totalCost * singleOffer.discount) / 100).toFixed(0);
          }
          if(totalDiscount > (totalCost - usedPoints)){
            totalDiscount = totalCost - usedPoints;
          }
          usedOffer = {...singleOffer, totalDiscount };
        }
      })
    }

    if(usedOffer == null){
      await client.query(
        /* SQL */ `
      UPDATE
        carts
      SET
        offer_used = null,
        updated_at = NOW()
      WHERE
        user_id = $1`,
        [userId]
      );
    }




    const combinedCarts = _.mergeWith(
      {},
      bookaslotsCart,
      membershipsCart,
      coachingsCart,
      eventsCart,
      {
        cost:
          totalCost -
          usedPoints -
          totalDiscount

      }
    );

    res.json({
      cart: combinedCarts,
      usedOffer,
      usedPoints,
      offers
    });
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
