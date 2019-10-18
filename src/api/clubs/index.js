const router = require("express").Router();

router.use(require("./getClubs"));
router.use(require("./initClubs"));

module.exports = router;
