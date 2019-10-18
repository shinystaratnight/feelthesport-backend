const router = require("express").Router();

router.use(require("./addMembership"));
router.use(require("./addMembershipPeriod"));
router.use(require("./updateMembershipForm"));

module.exports = router;
