const router = require("express").Router();

router.use(require("./addEvent"));
router.use(require("./deleteEvent"));
router.use(require("./addEventCategory"));
router.use(require("./deleteEventCategory"));
router.use(require("./setEventGallery"));
router.use(require("./setEventTermsAndConditions"));
router.use(require("./getEvent"));
router.use(require("./updateEventForm"));
router.use(require("./getEvents"));
router.use(require("./initEvents"));

module.exports = router;
