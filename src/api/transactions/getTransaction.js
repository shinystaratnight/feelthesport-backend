const router = require("express").Router();
const database = require("../../database");
const _ = require("lodash");
const Joi = require("joi");
const passport = require('passport');
const Razorpay = require("razorpay");
const validate = require("../../helpers/validate");
const bookaslotsCartObjectBuilder = require("../../helpers/objectBuilders/bookaslotsCartObjectBuilder");
const membershipsCartObjectBuilder = require("../../helpers/objectBuilders/membershipsCartObjectBuilder");
const coachingsCartObjectBuilder = require("../../helpers/objectBuilders/coachingsCartObjectBuilder");
const eventsCartObjectBuilder = require("../../helpers/objectBuilders/eventsCartObjectBuilder");
const addCostToBookaslotsCart = require("../../helpers/addCostToBookaslotsCart");
const addCostToMembershipsCart = require("../../helpers/addCostToMembershipsCart");
const addCostToCoachingsCart = require("../../helpers/addCostToCoachingsCart");
const addCostToEventsCart = require("../../helpers/addCostToEventsCart");

const schema = Joi.object()
  .keys({
    transactionId: Joi.number()
      .integer()
      .min(1)
      .required()
  })
  .required();

router.get("/transactions/:transactionId", passport.authenticate('jwt'), async (req, res) => {
  const transactionId = Number(req.params.transactionId);
  const validatedParam = Joi.validate({ transactionId }, schema);
  if (validatedParam.error) return res.status(400).send("Bad Request");

  const userId = req.user.id;

  const client = await database.connect();
  try {
    const {
      order_id: orderID,
      payment_id: paymentID,
      points_used: pointsUsed,
      totaldiscount: discount,
      discounted_price: cost,
      created_at: createdAt
    } =
      (await client.query(`
          select *
          from transactions
          where id = $1
            and user_id = $2`, [transactionId, userId])).rows[0]
    const bookaslotsResponse = (await client.query(
      /* SQL */ `
                SELECT a.id                              as "itemId",
                       a.bookaslot_players               as "players",
                       d.name                            as "arenaName",
                       d.address                         as "address",
                       c.id                              as "bookaslotId",
                       a.bookaslot_date::TEXT as "bookaslotDate",
                       f.id                              as "courtId",
                       f.type                            as "courtType",
                       a.price                           as "slotCost",
                       c.sport                           as "sport",
      TO_CHAR(LOWER(b.slot) * TIME '00:30', 'HH12:MIam') 
      || '-' || 
      TO_CHAR(UPPER(b.slot) * TIME '00:30', 'HH12:MIam') as "timeSlots"
                FROM
      transaction_items as a
      JOIN arena_time_slots as b ON b.id = a.bookaslot_slot
      JOIN arena_bookaslots as c ON c.id = b.bookaslot
      JOIN arenas as d ON d.id = c.arena
      JOIN courts f ON b.court = f.id
    WHERE
      a.transaction = $1
      AND EXISTS (
        SELECT
          1
        FROM
          transactions
        WHERE
          transactions.user_id = $2
      )
                ORDER BY a.bookaslot_date
`,
      [transactionId, userId]
    )).rows;
    // const eventsResponse = (await client.query(
    //   /* SQL */ `
    //       SELECT
    //       a.id as "itemId",
    //       c.id as "eventId",
    //       c.name as "eventName",
    //       (
    //         CASE WHEN e.arena IS NULL THEN e.address
    //         ELSE f.address END
    //       ) as "address",
    //       JSON_BUILD_OBJECT('name', d.sport, 'icon', d.icon) as "sport",
    //       (LOWER(c.date_range))::TEXT as "startDate",
    //       (UPPER(c.date_range))::TEXT as "endDate",
    //       (LOWER(c.time_range) * TIME '00:30')::TEXT as "startTime",
    //       (UPPER(c.time_range) * TIME '00:30')::TEXT as "endTime",
    //       b.id as "eventCategoryId",
    //       JSON_BUILD_OBJECT('name', b.name, 'price', b.price) as "eventCategory",
    //       g.id as "formSubmissionId",
    //       h.id as "formSubmissionFieldId",
    //       (
    //         CASE
    //         WHEN (h.input_text IS NOT NULL) THEN JSON_BUILD_OBJECT('field', i.name, 'input', h.input_text)
    //         WHEN (h.input_number IS NOT NULL) THEN JSON_BUILD_OBJECT('field', i.name, 'input', h.input_number)
    //         WHEN (h.input_date IS NOT NULL) THEN JSON_BUILD_OBJECT('field', i.name, 'input', h.input_date)
    //         ELSE JSON_BUILD_OBJECT('field', i.name, 'input', h.input_array)
    //         END
    //       ) as "formSubmissionFieldInfo"
    //     FROM
    //       cart_items as a
    //       JOIN event_categories as b ON b.id = a.event_category
    //       JOIN events as c ON c.id = b.event
    //       Join sports as d ON d.sport = c.sport
    //       JOIN complexes as e ON e.id = c.complex
    //       LEFT JOIN arenas as f ON e.arena = f.id
    //       JOIN registration_form_submissions as g ON a.form_submission = g.id
    //       LEFT JOIN registration_form_submission_fields as h ON h.submission = g.id
    //       LEFT JOIN form_fields as i ON i.id = h.field
    //     WHERE
    //       a.cart = $1
    // `,
    //   [userId]
    // )).rows;

    // if (bookaslotsResponse.length !== 0) {
    //   bookaslotsCart = addCostToBookaslotsCart(
    //     bookaslotsCartObjectBuilder(bookaslotsResponse)
    //   );
    // }

    const _ = require("lodash");

    const xxx = rows => {
      const formatRow = ({
        itemId,
        arenaName,
        address,
        bookaslotId,
        bookaslotDate,
        courtId,
        players,
        courtType,
        slotCost,
        sport,
        timeSlots
      }) => ({
        bookaslots: {
          [bookaslotId]: {
            arenaName,
            address,
            dates: {
              [bookaslotDate]: {
                sport,
                courts: {
                  [courtId]: {
                    courtType,
                    players,
                    timeSlots: {
                      [itemId]: {timeSlots ,slotCost}
                    },
                  }
                }
              }
            }
          }
        }
      });

      let output = {};
      rows.forEach(row => {
        output = _.mergeWith(
          {},
          output,
          formatRow(row),
          (objValue, srcValue) => {
            if (_.isArray(objValue)) {
              return objValue.concat(srcValue);
            }
          }
        );
      });
      return output;
    };
    let bookaslots = xxx(bookaslotsResponse);

    const instance = await new Razorpay({
      key_id: process.env.RAZORPAY_KEY,
      key_secret: process.env.RAZORPAY_SECRET
    });
    const payment = await instance.orders.fetchPayments(orderID);

    res.json({
        ...bookaslots,
      //membershipsCart,
      //coachingsCart,
      //eventsCart,
      transactionId,
      orderID,
      paymentID,
      pointsUsed,
      discount,
      cost,
      createdAt,
      payMethod: payment.items[0].method
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal Server Error");
  } finally {
    client.release();
  }
});

module.exports = router;
