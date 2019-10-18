const router = require("express").Router();

router.use(require("./getReviews"));
router.use(require("./addReview"));
router.use(require("./deleteReview"));
router.use(require("./addReply"));
router.use(require("./deleteReply"));
router.use(require("./updateReply"));

module.exports = router;
