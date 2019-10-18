const router = require("express").Router();

router.use(require("./addQuote"));
router.use(require("./deleteQuote"));

module.exports = router;
