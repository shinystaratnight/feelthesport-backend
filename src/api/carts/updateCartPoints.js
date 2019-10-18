const router = require("express").Router();
const database = require("../../database");
const passport = require('passport');
const validate = require("../../helpers/validate");
const Joi = require("joi");

const schema = Joi.object()
  .keys({
    points: Joi.number()
      .integer()
      .min(0)
      .required()
  })
  .required();

router.put("/cartPoints", validate(schema), passport.authenticate('jwt'), async (req, res) => {
  const userId = req.user.id;
  const client = await database.connect();
  try {
    const { points } = req.body;

    await client.query(
      /* SQL */ `
      UPDATE
        carts
      SET
        points_used = $2,
        updated_at = NOW()
      WHERE
        user_id = $1`,
      [userId, points]
    );

    res.send("updated cart points");
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal Server Error");
  } finally {
    client.release();
  }
});

module.exports = router;
