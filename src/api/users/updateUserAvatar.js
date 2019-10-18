const router = require("express").Router();
const database = require("../../database");
const validate = require("../../helpers/validate");
const imageUpload = require("../../helpers/imageUpload");
const validateImageType = require("../../helpers/validateImageType");
const Joi = require("joi");
// const multer = require("multer");
// const imageUpload = multer({ dest: "uploads/" });

const schema = Joi.object()
  .keys({
    userId: Joi.number()
      .integer()
      .min(1)
      .required()
  })
  .required();

router.put(
  "/api/userAvatar",
  imageUpload,
  validateImageType,
  validate(schema),
  async (req, res) => {
    const client = await database.connect();
    try {
      // const { userId, avatar } = req.body;

      // await client.query(
      //   `UPDATE users SET avatar = $2, updated_at = NOW()
      // WHERE id = $1`,
      //   [userId, avatar]
      // );

      res.send("updated user avatar");
    } catch (error) {
      console.log("djskhgfkdgskfhgdkshgkfhdgs");
      console.error(error);
      return res.status(500).send("Internal Server Error");
    } finally {
      client.release();
    }
  }
);

module.exports = router;
