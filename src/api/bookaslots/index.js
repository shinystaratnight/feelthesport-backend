const router = require("express").Router();

router.use(require("./addBookaslot"));
router.use(require("./getBookaslotById"));

module.exports = router;
