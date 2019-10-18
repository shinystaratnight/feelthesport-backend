const router = require("express").Router();

router.use(require("./addBooking"));
router.use(require("./deleteBooking"));
router.use(require("./updateBooking"));
router.use(require("./getBookingById"));

module.exports = router;
