const router = require("express").Router();
const database = require("../../database");
const validate = require("../../helpers/validate");
const Joi = require("joi");

const schema = Joi.object()
  .keys({
    eventCategoryId: Joi.number()
      .integer()
      .min(1)
      .required()
  })
  .required();

router.delete("/eventCategories", validate(schema), async (req, res) => {
  const client = await database.connect();
  try {
    const { eventCategoryId } = req.body;

    await client.query(`DELETE FROM event_categories WHERE id = $1`, [
      eventCategoryId
    ]);

    res.send("deleted event category");
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal Server Error");
  } finally {
    client.release();
  }
});

module.exports = router;
