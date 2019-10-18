const router = require("express").Router();

router.use(require("./addOrganizer"));
router.use(require("./deleteOrganizer"));

module.exports = router;
