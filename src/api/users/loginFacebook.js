const passport = require("passport");
const router = require("express").Router();
const facebookStrategy = require('../../auth/facebook');
const successLoginReturn = require("../../helpers/successLoginReturn");

router.post("/users/login/facebook",facebookStrategy(), passport.authenticate("facebook-token"), (req, res) => {
  let return_data = successLoginReturn (req);
  res.json(return_data);
});

module.exports = router;
