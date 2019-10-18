const router = require("express").Router();
const database = require("../../database");
const passport = require('passport');
const validate = require("../../helpers/validate");
const Joi = require("joi");

const schema = Joi.object()
  .keys({
    itemId: Joi.number()
      .integer()
      .min(1)
      .required()
  })
  .required();

router.delete("/carts/:itemId", passport.authenticate('jwt'), async (req, res) => {
  const itemId = Number(req.params.itemId);
  const userId = req.user.id;
  const validatedParam = Joi.validate({ itemId }, schema);
  if (validatedParam.error) return res.status(400).send("Bad Request");

  const client = await database.connect();
  try {
    await client.query("BEGIN");

    await client.query(
      /* SQL */ `DELETE FROM cart_items WHERE cart = $1 AND id = $2`,
      [userId, itemId]
    );

    await client.query(
      /* SQL */ `UPDATE carts SET updated_at = NOW() WHERE user_id = $1`,
      [userId]
    );

    res.send("Deleted cart item");
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
