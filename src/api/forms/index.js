const router = require("express").Router();

router.use(require("./addFormField"));
// router.use(require("./deleteFormField"));
router.use(require("./addForm"));
// router.use(require("./deleteForm"));

module.exports = router;
