const router = require("express").Router();

router.use(require("./getBooknplays"));
router.use(require("./initBooknplay"));

module.exports = router;
