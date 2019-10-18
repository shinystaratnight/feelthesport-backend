const database = require("../../database");
const router = require("express").Router();
const authenticate = require("../../helpers/authenticate");
const validate = require("../../helpers/validate");
const Joi = require("joi");
const passport = require('passport');
const successLoginReturn = require("../../helpers/successLoginReturn");

const schema = Joi.object()
  .keys({
    sport: Joi.string().required()
  })
  .required();

router.put(
  "/userSelectedSports",
  passport.authenticate('jwt'),
  validate(schema),
  async (req, res) => {
    const client = await database.connect();
    try {
      const { sport } = req.body;
      const { id } = req.user;
      await client.query(
        `UPDATE
        users
      SET
        selected_sport = $2,
        updated_at = NOW() 
      WHERE
        id = $1`,
        [id, sport]
      );
      req.user.selected_sport = sport;
      let return_data = successLoginReturn(req);
      res.json(return_data);
    } catch (error) {
      console.error(error);
      return res.status(500).send("Internal Server Error");
    } finally {
      client.release();
    }
  }
);

module.exports = router;
