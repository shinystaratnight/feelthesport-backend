const Razorpay = require("razorpay");
const router = require("express").Router();
const database = require("../../database");
const passport = require('passport');
const validate = require("../../helpers/validate");
router.get("/cartOrders", passport.authenticate('jwt'), async (req, res) => {
  const userId = req.user.id;

  const client = await database.connect();
  try {
    await client.query("BEGIN");

    await client.query(
      /* SQL */ `SELECT * FROM cart_items WHERE cart = $1 FOR UPDATE`,
      [userId]
    );

    const { updatedAt, lastUserRequestAt, pointsUsed} = (await client.query(
      /* SQL */ `
      SELECT carts.updated_at           as "updatedAt",
             carts.last_user_request_at as "lastUserRequestAt",
             carts.points_used          as "pointsUsed"
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
    const instance = await new Razorpay({
      key_id: process.env.RAZORPAY_KEY,
      key_secret: process.env.RAZORPAY_SECRET
    });
    let cartTotal = cartItemsCost - pointsUsed;
    let totalDiscount = 0;
    if(offerUsed != null){
      if(discountType === 'amount' ){
        totalDiscount = discount;
      }else  if(discountType === 'percent' ){
        totalDiscount = ((cartItemsCost * discount) / 100).toFixed(0);
      }
      if(totalDiscount > cartTotal){
        totalDiscount =  cartTotal;
      }
    }
    cartTotal = cartItemsCost - pointsUsed - totalDiscount;

    const newOrder = await instance.orders.create({
      amount: cartTotal * 100,
      currency: "INR",
      receipt: "receipt",
      payment_capture: false
    });

    await client.query(
      /* SQL */ `
    UPDATE 
      carts
    SET
      order_id = $2
    WHERE
      user_id = $1`,
      [userId, newOrder.id]
    );

    res.json({
      razorKey: process.env.RAZORPAY_KEY,
      orderId: newOrder.id
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
