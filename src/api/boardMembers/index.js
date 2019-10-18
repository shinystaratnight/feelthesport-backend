const router = require("express").Router();

router.use(require("./addBoardMember"));
router.use(require("./deleteBoardMember"));
router.use(require("./updateBoardMember"));

module.exports = router;
