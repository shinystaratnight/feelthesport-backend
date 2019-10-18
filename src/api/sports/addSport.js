const router = require("express").Router();
const database = require("../../database");
const validate = require("../../helpers/validate");
const Joi = require("joi");

const schema = Joi.object()
  .keys({
    sport: Joi.string().required(),
    sportCategory: Joi.string().required(),
    icon: Joi.string()
      .uri()
      .required()
  })
  .required();

router.post("/sports", validate(schema), async (req, res) => {
  const client = await database.connect();
  try {
    const { sport, sportCategory, icon } = req.body;

    await client.query(
      `INSERT INTO sports (sport, category, icon) VALUES ($1, $2, $3)`,
      [sport, sportCategory, icon]
    );

    res.send("added sport");
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal Server Error");
  } finally {
    client.release();
  }
});

module.exports = router;
