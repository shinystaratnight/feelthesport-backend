const database = require("../../database");
const router = require("express").Router();
const authenticate = require("../../helpers/authenticate");
const validate = require("../../helpers/validate");
const Joi = require("joi");
const passport = require('passport');
const successLoginReturn = require("../../helpers/successLoginReturn");

const schema = Joi.object()
  .keys({
    city: Joi.string().required()
  })
  .required();

router.put(
  "/userSelectedCities",
  passport.authenticate('jwt'),
  validate(schema),
  async (req, res) => {
    const client = await database.connect();
    try {
      const { city } = req.body;
      const { id } = req.user;
      await client.query(
          `UPDATE
               users
           SET
               selected_city = $2,
               updated_at = NOW()
           WHERE
               id = $1`,
        [id, city]
      );
      req.user.selected_city = city;
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
