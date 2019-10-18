const router = require("express").Router();

router.use(require("./addArea"));
router.use(require("./deleteArea"));

module.exports = router;
