const router = require("express").Router();

router.use(require("./addComplex"));
router.use(require("./deleteComplex"));
router.use(require("./setComplexPhone"));
router.use(require("./setComplexEmail"));
router.use(require("./setComplexSocialMedia"));

module.exports = router;
