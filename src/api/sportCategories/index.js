const router = require("express").Router();

router.use(require("./addSportCategory"));
router.use(require("./deleteSportCategory"));

module.exports = router;
