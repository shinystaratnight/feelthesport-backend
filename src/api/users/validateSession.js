const router = require("express").Router();
const passport = require('passport');
const successLoginReturn = require("../../helpers/successLoginReturn");

router.get("/users/validateSession", passport.authenticate('jwt'), (req, res) => {
  let return_data = successLoginReturn(req);
  res.json(return_data);
});

module.exports = router;
