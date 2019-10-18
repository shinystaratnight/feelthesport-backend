const router = require("express").Router();
const database = require("../../database");
const validate = require("../../helpers/validate");
const Joi = require("joi");

const schema = Joi.object()
  .keys({
    achievementsId: Joi.number()
      .integer()
      .min(1)
      .required()
  })
  .required();

router.delete(
  "/achievements",
  validate(schema),
  validate(schema),
  async (req, res) => {
    const client = await database.connect();
    try {
      const { achievementsId } = req.body;

      await client.query(`DELETE FROM achievements WHERE id = $1`, [
        achievementsId
      ]);

      res.send("deleted achievements");
    } catch (error) {
      console.error(error);
      return res.status(500).send("Internal Server Error");
    } finally {
      client.release();
    }
  }
);

module.exports = router;
