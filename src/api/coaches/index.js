const router = require("express").Router();

router.use(require("./addCoach"));
router.use(require("./deleteCoach"));
router.use(require("./updateCoach"));

module.exports = router;
