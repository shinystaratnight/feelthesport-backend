const router = require("express").Router();
const authenticate = require("../../helpers/authenticate");
const passport = require('passport');

router.post("/users/logout", passport.authenticate('jwt'), (req, res) => {
  req.logout();
  res.json({"message": "Logout Successful"});
});

module.exports = router;
