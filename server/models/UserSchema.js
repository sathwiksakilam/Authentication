const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const secretkey = "asdsaasunglwlwldltnternuigshwrtw"; // Make sure to keep your secret key in environment variables

const userSchema = new mongoose.Schema({
  fname: {
    type: String,
    required: true,
    trim: true, // remove spaces from left and right side
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate(value) {
      if (!validator.isEmail(value)) {
        throw new Error("Not a valid email");
      }
    },
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  cpassword: {
    type: String,
    required: true,
    minlength: 6,
  },
  tokens: [
    {
      token: {
        type: String,
        required: true,
      },
    },
  ],
});

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 12);
    this.cpassword = this.password; // Keep cpassword same as password after hashing
  }
  next(); // Proceed to save the data
});

// Token generation
userSchema.methods.generateAuthToken = async function () {
  try {
    let token = jwt.sign({ _id: this._id.toString() }, secretkey, {
      expiresIn: "1d",
    });
    this.tokens = this.tokens.concat({ token });
    await this.save();
    return token;
  } catch (err) {
    console.log(err);
    throw new Error("Token generation failed");
  }
};

// Create mongoose model
module.exports = mongoose.model("Users", userSchema);
