const router = require("express").Router();

router.use(require("./addCartItem"));
router.use(require("./deleteCartItem"));
router.use(require("./getCart"));
router.use(require("./addOrder"));
router.use(require("./updateCartPoints"));
router.use(require("./updateCartOffer"));

module.exports = router;
