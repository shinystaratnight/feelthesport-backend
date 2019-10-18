const router = require("express").Router();
const database = require("../../database");
const validate = require("../../helpers/validate");
const Joi = require("joi");

const schema = Joi.object()
  .keys({
    name: Joi.string()
      .min(3)
      .max(100)
      .required(),
    description: Joi.string()
      .min(3)
      .max(30)
      .required(),
    city: Joi.string().required(),
    area: Joi.string().required(),
    image: Joi.string()
      .uri()
      .optional()
  })
  .required();

// Restrict next route to admins and managers
router.post("/arena/", validate(schema), async (req, res) => {
  const client = await database.connect();
  try {
    const { name, description, city, area, image } = req.body;

    await client.query(
      `INSERT INTO arenas (name, description, city, area, image)
      VALUES ($1, $2, $3, $4, $5)`,
      [name, description, city, area, image]
    );

    res.status(200).send("added arena");
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal Server Error");
  } finally {
    client.release();
  }
});

module.exports = router;
