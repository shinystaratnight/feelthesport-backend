const passport = require("passport");
const router = require("express").Router();
const googleStrategy = require('../../auth/google');
const successLoginReturn = require("../../helpers/successLoginReturn");

router.post("/users/login/google", googleStrategy(), passport.authenticate('google-token'), (req, res) => {
  let return_data = successLoginReturn (req);
  res.json(return_data);
});

module.exports = router;
