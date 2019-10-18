const router = require("express").Router();

router.use(require("./addTransaction"));
router.use(require("./getTransaction"));

module.exports = router;
