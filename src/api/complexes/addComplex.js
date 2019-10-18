const router = require("express").Router();
const database = require("../../database");
const validate = require("../../helpers/validate");
const Joi = require("joi");

const schema = Joi.object()
  .keys({
    arenaId: Joi.number()
      .integer()
      .min(1)
      .optional(),
    name: Joi.string()
      .min(3)
      .max(100)
      .optional(),
    city: Joi.string().optional(),
    area: Joi.string().optional(),
    address: Joi.string()
      .min(6)
      .optional()
  })
  .without("arenaId", ["name", "city", "area", "address"])
  .and("name", "city", "area", "address")
  .required();

router.post("/complexes", validate(schema), async (req, res) => {
  const client = await database.connect();
  try {
    const { arenaId, name, city, area, address } = req.body;

    if (arenaId) {
      await client.query(
        `INSERT INTO complexes (arena) VALUES
        ($1)`,
        [arenaId]
      );
    } else {
      await client.query(
        `INSERT INTO complexes (name, city, area, address) VALUES
        ($1, $2, $3, $4)`,
        [name, city, area, address]
      );
    }

    res.send("added complex");
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal Server Error");
  } finally {
    client.release();
  }
});

module.exports = router;
