const router = require("express").Router();

router.use(require("./addCity"));
router.use(require("./deleteCity"));

module.exports = router;
