const router = require("express").Router();

router.use(require("./addCourtType"));
router.use(require("./deleteCourtType"));

module.exports = router;
