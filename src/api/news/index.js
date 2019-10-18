const router = require("express").Router();

router.use(require("./addNews"));
router.use(require("./deleteNews"));
router.use(require("./updateNews"));

module.exports = router;
