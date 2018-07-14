const uuidv1 = require("uuid/v1");
const crypto = require("crypto");
const User = require("../models/user");
const { Order } = require("../models/order");

exports.getUserById = (req, res, next, id) => {
  User.findById(id)
    .then((user) => {
      console.log("getuserbyid");
      console.log(user);
      if (!user) {
        return res.status(400).json({
          error: "No user found in DB",
        });
      }
      req.profile = user;
      next();
    })
    .catch((err) => {
      return res.status(400).json({
        error: "No user found in db",
      });
    });
  console.log("end of line");
};

exports.getUser = (req, res) => {
  console.log("getuser");
  req.profile.salt = undefined;
  req.profile.encry_password = undefined;
  req.profile.createdAt = undefined;
  req.profile.updatedAt = undefined;
  return res.json(req.profile);
};

exports.updateUser = (req, res) => {
  if (req.body.password) {
    req.body.salt = uuidv1();
    req.body.encry_password = crypto
      .createHmac("sha256", req.body.salt)
      .update(req.body.password)
      .digest("hex");
  }

  User.findByIdAndUpdate(
    { _id: req.profile._id },
    { $set: req.body },
    { new: true, useFindAndModify: false }
  )
    .then((user) => {
      req.profile = user;
      req.profile.salt = undefined;
      req.profile.encry_password = undefined;
      req.profile.createdAt = undefined;
      req.profile.updatedAt = undefined;
      return res.json(req.profile);
    })
    .catch((err) => {
      return res.status(400).json({
        error: "You are not authorized to update this user",
      });
    });
};

exports.userPurchaseList = (req, res) => {
  Order.find({ user: req.profile._id })
    .exec()
    .populate("user", "_id name")
    .then((order) => {
      return res.json(order);
    })
    .catch((err) => {
      return res.status(400).json({
        error: "No order in this account",
      });
    });
};

exports.pushOrderInPurchaseList = (req, res, next) => {
  let purchases = [];
  req.body.order.products.forEach((product) => {
    purchases.push({
      _id: product._id,
      name: product.name,
      description: product.description,
      category: product.category,
      quantity: product.quantity,
      amount: req.body.order.amount,
      transaction_id: req.body.order.transaction_id,
    });
  });
  //store this in DB
  User.findOneAndUpdate(
    { _id: req.profile._id },
    { $push: { purchases: purchases } },
    //from database send the new object from database instead of old one
    { new: true, useFindAndModify: false }
  )
    .then((purchases) => {
      console.log("PRCHASS");
      return;
    })
    .catch((err) => {
      return res.status(400).json({
        error: "Unable to save Purchase list",
      });
    });

  next();
};
