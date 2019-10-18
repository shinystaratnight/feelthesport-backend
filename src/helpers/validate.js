const Joi = require("joi");

module.exports = schema => (req, res, next) => {
  const validatedBody = Joi.validate(
    req.headers["content-type"].includes("application/json")
      ? req.body
      : req.body.json,
    schema
  );

  console.log(validatedBody.error);
  if (validatedBody.error) return res.status(400).send("Bad Request");
  next();
};
