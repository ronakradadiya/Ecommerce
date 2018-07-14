const express = require("express");
const router = express.Router();
const { check } = require("express-validator");
const { signout, signup, signin, isSignedIn } = require("../controllers/auth");

//Put the field name in check() from req.body
router.post(
  "/signup",
  [
    check("name")
      .isLength({ min: 3 })
      .withMessage("name must be at least 5 chars long"),

    check("email").isEmail().withMessage("email is required"),

    check("password")
      .isLength({ min: 3 })
      .withMessage("password should be at least 3 char"),
  ],
  signup
);

router.post(
  "/signin",
  [
    check("email").isEmail().withMessage("email is required"),

    check("password")
      .isLength({ min: 3 })
      .withMessage("password field is required"),
  ],
  signin
);

router.get("/signout", signout);

router.get("/testroute", isSignedIn, (req, res) => {
  console.log(req.auth);
  res.send("A protected route");
});

module.exports = router;
