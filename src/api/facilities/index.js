const router = require("express").Router();

router.use(require("./addFacility"));
router.use(require("./deleteFacility"));

module.exports = router;
