const router = require("express").Router();
const database = require("../../database");
const passport = require('passport');
const validate = require("../../helpers/validate");
const Joi = require("joi");

const schema = Joi.object()
  .keys({
    offerId: Joi.number()
      .integer()
      .required()
  })
  .required();

router.put("/cartOffer", validate(schema), passport.authenticate('jwt'), async (req, res) => {
  const userId = req.user.id;
  const client = await database.connect();
  try {
    let { offerId } = req.body;
    if(offerId  == 0) offerId = null;
    await client.query(
      /* SQL */ `
      UPDATE
        carts
      SET
        offer_used = $2,
        updated_at = NOW()
      WHERE
        user_id = $1`,
      [userId, offerId]
    );

    res.send("updated cart offer");
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal Server Error");
  } finally {
    client.release();
  }
});

module.exports = router;
