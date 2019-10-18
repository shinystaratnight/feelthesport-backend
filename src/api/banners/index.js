const router = require("express").Router();

router.use(require("./addBanner"));
router.use(require("./deleteBanner"));
router.use(require("./updateBanner"));

module.exports = router;
