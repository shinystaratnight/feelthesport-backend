const router = require("express").Router();

router.use(require("./siteInfo"));
router.use(require("./main"));
router.use(require("./cities"));
router.use(require("./areas"));
router.use(require("./sportCategories"));
router.use(require("./sports"));
router.use(require("./facilities"));
router.use(require("./courtTypes"));
router.use(require("./banners"));
router.use(require("./quotes"));
router.use(require("./offers"));
router.use(require("./arenas"));
router.use(require("./users"));
router.use(require("./news"));
router.use(require("./achievements"));
router.use(require("./coaches"));
router.use(require("./boardMembers"));
router.use(require("./reviews"));
router.use(require("./bookings"));
router.use(require("./carts"));
router.use(require("./organizers"));
router.use(require("./complexes"));
router.use(require("./events"));
router.use(require("./forms"));
router.use(require("./bookaslots"));
router.use(require("./memberships"));
router.use(require("./coachings"));
router.use(require("./timeSlots"));
router.use(require("./booknplay"));
router.use(require("./filters"));
router.use(require("./clubs"));
router.use(require("./academies"));
router.use(require("./transactions"));

module.exports = router;