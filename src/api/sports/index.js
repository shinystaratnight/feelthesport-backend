const router = require("express").Router();

router.use(require("./addSport"));
router.use(require("./deleteSport"));

module.exports = router;
