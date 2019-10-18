const router = require("express").Router();

router.use(require("./addCoaching"));
router.use(require("./addCoachingPeriod"));
router.use(require("./updateCoachingForm"));

module.exports = router;
