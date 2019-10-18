const router = require("express").Router();

router.use(require("./getAcademies"));
router.use(require("./initAcademies"));

module.exports = router;
