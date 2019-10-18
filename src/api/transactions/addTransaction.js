const router = require("express").Router();
const database = require("../../database");
const Razorpay = require("razorpay");
const validate = require("../../helpers/validate");
const passport = require('passport');
const sendEmail = require("../../helpers/sendEmail");
const sendSMS = require("../../helpers/sendSMS");

router.post("/transactions", passport.authenticate('jwt'),  async (req, res) => {
  const userId =  req.user.id;

  const client = await database.connect();
  try {
    await client.query("BEGIN");

    await client.query(
      /* SQL */ `SELECT * FROM cart_items WHERE cart = $1 FOR UPDATE`,
      [userId]
    );

    const {
      orderId,
      pointsUsed,
      updatedAt,
      lastUserRequestAt
    } = (await client.query(
      /* SQL */ `
      SELECT
        order_id as "orderId",
        points_used as "pointsUsed",
        updated_at as "updatedAt", 
        last_user_request_at as "lastUserRequestAt"
      FROM 
        carts
      WHERE 
        user_id = $1
      FOR UPDATE`,
      [userId]
    )).rows[0];
    const { offerUsed, discountType, discount } = (await client.query(
      /* SQL */ `
      SELECT carts.offer_used           as "offerUsed",
             offers.discount_type       as "discountType",
             offers.discount            as "discount"
      FROM 
        carts
            LEFT JOIN offers on offers.id = offer_used
      WHERE 
        user_id = $1`,
      [userId]
    )).rows[0];

    if (updatedAt - lastUserRequestAt !== 0) {
      await client.query("COMMIT");
      return res.json({
        reInitCart: true
      });
    }

    if (!orderId) {
      throw new Error("invalid transaction");
    }

    const instance = await new Razorpay({
      key_id: process.env.RAZORPAY_KEY,
      key_secret: process.env.RAZORPAY_SECRET
    });

    const payment = await instance.orders.fetchPayments(orderId);

    const { cartItemsCost } = (await client.query(
      /* SQL */ `
      SELECT
      SUM(
        CASE WHEN cart_items.bookaslot_slot IS NOT NULL 
        THEN(
          SELECT
            (
              CASE WHEN arena_bookaslots.charge_per_player = TRUE THEN (
                cart_items.bookaslot_players * arena_bookaslots.price
              ) ELSE arena_bookaslots.price END
            )
          FROM
            arena_time_slots
            JOIN arena_bookaslots ON arena_bookaslots.id = arena_time_slots.bookaslot
          WHERE
            arena_time_slots.id = cart_items.bookaslot_slot
        ) WHEN cart_items.membership_period IS NOT NULL 
        THEN(
          SELECT
            price
          FROM
            arena_membership_periods
          WHERE
            arena_membership_periods.id = cart_items.membership_period
        ) WHEN cart_items.coaching_period IS NOT NULL 
        THEN(
          SELECT
            price
          FROM
            arena_coaching_periods
          WHERE
            arena_coaching_periods.id = cart_items.coaching_period
        ) WHEN cart_items.event_category IS NOT NULL 
        THEN(
          SELECT
            price
          FROM
            event_categories
          WHERE
            event_categories.id = cart_items.event_category
        ) 
        ELSE 0
        END
      )::SMALLINT as "cartItemsCost"
      FROM
        cart_items
      WHERE
        cart = $1;
        `,
      [userId]
    )).rows[0];

    let transactionCost = cartItemsCost - pointsUsed;
    let totalDiscount = 0;
    if(offerUsed != null){
      if(discountType === 'amount' ){
        totalDiscount = discount;
      }else  if(discountType === 'percent' ){
        totalDiscount = ((cartItemsCost * discount) / 100).toFixed(0);
      }
      if(totalDiscount > transactionCost){
        totalDiscount =  transactionCost;
      }
    }
    transactionCost = cartItemsCost - pointsUsed - totalDiscount;
    if (
      payment.count === 0 ||
      payment.items[0].status !== "authorized" ||
      payment.items[0].order_id !== orderId ||
      payment.items[0].amount !== (transactionCost*100)
    ) {
      throw new Error("invalid payment");
    }

    const { transactionId } = (await client.query(
      /* SQL */ `
        INSERT INTO
          transactions
        (
          user_id,
          order_id,
          payment_id,
          points_used,
          offer_used,
          totalDiscount,
          discounted_price
        )
        SELECT
          user_id,
          order_id,
          $2,
          points_used,
          offer_used,
          $4,
          $3
        FROM
          carts
        WHERE
          carts.user_id = $1
        RETURNING id as "transactionId"
        `,
      [userId, payment.items[0].id, transactionCost, totalDiscount]
    )).rows[0];

    await client.query(
      /* SQL */ `
        INSERT INTO
          transaction_items
        (
          transaction,
          bookaslot_slot,
          bookaslot_date,
          bookaslot_players,
          membership_period,
          coaching_period,
          event_category,
          form_submission,
          price
        )
        SELECT
          $2,
          bookaslot_slot,
          bookaslot_date,
          bookaslot_players,
          membership_period,
          coaching_period,
          event_category,
          form_submission,
          (
            CASE
            WHEN cart_items.bookaslot_slot IS NOT NULL THEN
            (
              SELECT
                (
                  CASE 
                  WHEN arena_bookaslots.charge_per_player = TRUE 
                  THEN arena_bookaslots.price * cart_items.bookaslot_players
                  ELSE arena_bookaslots.price
                  END
                )
              FROM
                arena_time_slots
              JOIN arena_bookaslots ON arena_bookaslots.id = arena_time_slots.bookaslot
              WHERE
                arena_time_slots.id = cart_items.bookaslot_slot
            )
            WHEN cart_items.event_category IS NOT NULL THEN
            (
              SELECT
                price
              FROM
                event_categories
              WHERE
                event_categories.id = cart_items.event_category
            )
            ELSE 0
            END
          )
        FROM
          cart_items
        WHERE
          cart_items.cart = $1
        `,
      [userId, transactionId]
    );

    await client.query(
      /* SQL */ `
      DELETE FROM cart_items * WHERE cart = $1`,
      [userId]
    );

    await client.query(
      /* SQL */ `
      UPDATE
        carts
      SET
        order_id = null,
        offer_used = null,
        points_used = 0,
        updated_at = NOW()
      WHERE
        user_id = $1
      `,
      [userId]
    );

    await client.query(
      /* SQL */ `
      UPDATE
        users
      SET
        points = points - $2,
        updated_at = NOW()
      WHERE
        id = $1
      `,
      [userId, pointsUsed]
    );

    const capturedPayment = await instance.payments.capture(
      payment.items[0].id,
      transactionCost*100,
      "INR"
    );

    if (
      capturedPayment.id !== payment.items[0].id ||
      capturedPayment.status !== "captured" ||
      capturedPayment.captured !== true ||
      capturedPayment.order_id !== orderId ||
      capturedPayment.amount !== (transactionCost*100)
    ) {
      throw new Error("invalid payment");
    }

    const emailResponse = await sendEmail({
      to:  req.user.email,
      subject: "✔ FTS Booking Confirmation",
      text: "Your booking has been confirmed",
      html: "<b>Your booking has been confirmed</b>"
    });
    //const smsResponse = await sendSMS({ to:  req.user.phone, body: "Your booking has been confirmed", });
   // console.log(smsResponse)

    res.json({ transactionId });
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
