const mongoose = require("mongoose");
const crypto = require("crypto");
const uuidv1 = require("uuid/v1");

var userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      maxlength: 32,
      trim: true,
    },
    lastname: {
      type: String,
      maxlength: 32,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      required: true,
      unique: true,
    },
    userinfo: {
      type: String,
      trim: true,
    },
    encry_password: {
      type: String,
      required: true,
    },
    salt: String,
    // The higher the number, more the privilege
    role: {
      type: Number,
      default: 0,
    },
    purchases: {
      type: Array,
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

//You can give any name other than password
//Before creating instance of user from new User(req.body), mongoose checks whether virtual "password" is present or not
// If it is present, mongoose calls set function
//else it save the user in db
userSchema
  .virtual("password")
  .set(function (password) {
    console.log("Inside set function", this);
    this._password = password;
    console.log(this._password);
    this.salt = uuidv1();
    this.encry_password = this.securePassword(password);
    console.log(this);
  })
  .get(function () {
    console.log("Inside get function");
    return this._password;
  });

userSchema.methods = {
  authenticate: function (plainpassword) {
    return this.securePassword(plainpassword) === this.encry_password;
  },

  securePassword: function (plainpassword) {
    console.log(plainpassword);
    console.log("Inside securePassword function", this);
    console.log(this.name);
    if (!plainpassword) return "";
    try {
      return crypto
        .createHmac("sha256", this.salt)
        .update(plainpassword)
        .digest("hex");
    } catch (err) {
      return "";
    }
  },
};

module.exports = mongoose.model("User", userSchema);
