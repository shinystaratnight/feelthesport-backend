const passport = require("passport");
const router = require("express").Router();
const successLoginReturn = require("../../helpers/successLoginReturn");

router.post("/users/login", passport.authenticate("local"), (req, res) => {
  let return_data = successLoginReturn(req);
  res.json(return_data);
});

module.exports = router;
