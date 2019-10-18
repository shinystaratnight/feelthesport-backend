const router = require("express").Router();

router.use(require("./addArena"));
router.use(require("./deleteArena"));
router.use(require("./getArenaById"));
router.use(require("./addArenaSports"));
router.use(require("./arenaAbout"));
router.use(require("./updateArenaPartners"));
router.use(require("./updateArenaDays"));
router.use(require("./updateArenaFacilities"));
router.use(require("./addArenaGalleryImage"));
router.use(require("./deleteArenaGalleryImage"));
router.use(require("./addArenaPartner"));
router.use(require("./deleteArenaPartner"));
router.use(require("./updateArenaAddress"));
// router.use(require("./arenaNews"));

module.exports = router;
