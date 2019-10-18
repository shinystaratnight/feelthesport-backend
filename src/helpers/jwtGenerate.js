const jwt = require("jsonwebtoken");
module.exports = function (data) {
  const opts = {}
  opts.expiresIn = 7776000; // token expires in 3 months
  const secret = process.env.JWT_SECRET; // normally stored in process.env.secret
  return jwt.sign({ ...data }, secret, opts);
}
