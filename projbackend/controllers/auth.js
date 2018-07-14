const User = require("../models/user");
const { validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const expressJwt = require("express-jwt");

exports.signup = (req, res) => {
  console.log("Inside signup function");
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      error: errors.array()[0].msg,
    });
  }

  const user = new User(req.body);
  console.log("After signup function");
  user
    .save()
    .then((user) => {
      console.log("Inside then function");
      res.json({
        name: user.name,
        email: user.email,
        id: user._id,
      });
    })
    .catch((err) => {
      console.log("Inside catch function");
      return res.status(400).json({
        error: "Not able to save user in DB",
      });
    });
};

exports.signin = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      error: errors.array()[0].msg,
    });
  }

  const { email, password } = req.body;
  User.findOne({ email })
    .exec()
    .then((user) => {
      console.log("Inside then function ", user);

      if (!user) {
        return res.status(400).json({
          error: "User email does not exists",
        });
      }

      if (!user.authenticate(password)) {
        return res.status(401).json({
          error: "Email and password do not match",
        });
      }

      //create token
      const token = jwt.sign({ _id: user._id }, process.env.SECRET);

      //put token in cookie
      // res.cookie("token", token, {
      //   expires: new Date(Date.now() + 8 * 3600000),
      //   httpOnly: true,
      // });

      //send response to front end
      const { _id, name, email, role } = user;
      return res.json({ token, user: { _id, name, email, role } });
    })
    .catch((err) => {
      console.log("Inside catch function", err);
      res.status(400).json({
        error: "Server error",
      });
    });
};

exports.signout = (req, res) => {
  // res.clearCookie("token");
  res.json({
    message: "User signout successfully",
  });
};

//protected routes
//used for authorization
exports.isSignedIn = expressJwt({
  secret: process.env.SECRET,
  requestProperty: "auth",
});

//custom middlewares
exports.isAuthenticated = (req, res, next) => {
  console.log("isAuthenticated", req.auth);
  let checker = req.profile && req.auth && req.profile._id == req.auth._id;
  if (!checker) {
    return res.status(403).json({
      error: "ACCESS DENIED",
    });
  }
  next();
};

exports.isAdmin = (req, res, next) => {
  if (req.profile.role === 0) {
    return res.status(403).json({
      error: "You are not ADMIN, Access denied",
    });
  }
  next();
};
