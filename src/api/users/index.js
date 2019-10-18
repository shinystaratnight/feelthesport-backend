const router = require("express").Router();

router.use(require("./register"));
router.use(require("./login"));
router.use(require("./loginFacebook"));
router.use(require("./loginGoogle"));
router.use(require("./logout"));
router.use(require("./validateSession"));
router.use(require("./updateUserAvatar"));
router.use(require("./updateSelectedCity"));
router.use(require("./updateSelectedSport"));
router.use(require("./verifyMobileOTP"));
router.use(require("./verifyEmailOTP"));
router.use(require("./sendVerifyMobileOTP"));
router.use(require("./sendVerifyEmailOTP"));
router.use(require("./sendOTP"));
router.use(require("./verifyOTP"));

module.exports = router;
