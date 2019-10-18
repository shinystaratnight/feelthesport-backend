const router = require("express").Router();

router.use(require("./addAchievements"));
router.use(require("./deleteAchievements"));
router.use(require("./updateAchievements"));

module.exports = router;
