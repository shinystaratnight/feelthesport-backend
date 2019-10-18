const readChunk = require("read-chunk");
const fileType = require("file-type");

module.exports = (req, res, next) => {
  console.log("HELLLOOOL: ", req.file);

  const buffer = readChunk(req.file.path, 0, fileType.minimumBytes);

  console.log("FILE: ", fileType(buffer));
  // console.log("123");
  // console.log(req.file);
  // console.log("123");
  // // if (req.file) console.log("abc: ", req.body);
  // // console.log(req);
  // const validatedBody = Joi.validate(
  //   req.headers["content-type"] === "application/json"
  //     ? req.body
  //     : req.body.json,
  //   schema
  // );
  // if (validatedBody.error) return res.status(400).send("Bad Request");
  next();
};
