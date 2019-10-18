const router = require("express").Router();
const database = require("../../database");
const validate = require("../../helpers/validate");
const Joi = require("joi");

const schema = Joi.object()
  .keys({
    sportCategory: Joi.string().required()
  })
  .required();

router.delete(
  "/sportCategories",
  validate(schema),
  validate(schema),
  async (req, res) => {
    const client = await database.connect();
    try {
      const { sportCategory } = req.body;

      await client.query(`DELETE FROM sport_categories WHERE category = $1`, [
        sportCategory
      ]);

      res.send("deleted sport category");
    } catch (error) {
      console.error(error);
      return res.status(500).send("Internal Server Error");
    } finally {
      client.release();
    }
  }
);

module.exports = router;
