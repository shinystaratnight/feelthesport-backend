const router = require("express").Router();

router.use(require("./addMain"));
router.use(require("./updateMain"));

module.exports = router;
