const express = require("express");
const router = new express.Router();
const userdb = require("../models/UserSchema");
const bcrypt = require("bcryptjs");
const authenticate = require("../middleware/Authenticate");

// For user registration
router.post("/register", async (req, res) => {
  // console.log(req.body);
  const { fname, email, password, cpassword } = req.body;
  if (!fname || !email || !password || !cpassword) {
    res.status(422).json({ error: "fill all the details" });
  }

  try {
    const preuser = await userdb.findOne({ email: email });
    if (preuser) {
      res.status(422).json({ error: "This email already exists" });
    } else if (password != cpassword) {
      res.status(422).json({ error: "Password and cpassword not match" });
    } else {
      const finalUser = new userdb({
        fname: fname,
        email: email,
        password: password,
        cpassword: cpassword,
      });
      // here password is hashed
      const storeData = await finalUser.save();
      res.status(201).json(storeData);
      // console.log(storeData);
    }
  } catch (err) {
    res.status(422).json(err);
    console.log("catch block error");
  }
  // res.status(201).json({ message: "User registered" });  // Added response to avoid hanging request
});

//user login

router.post("/login", async (req, res) => {
  // console.log(req.body);
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(422).json({ error: "fill all the details" });
  }
  try {
    const userValid = await userdb.findOne({ email: email });
    if (userValid) {
      const isMatch = await bcrypt.compare(password, userValid.password);
      if (!isMatch) {
        res.status(400).json({ error: "Invalid details" });
      } else {
        // token generate
        const token = await userValid.generateAuthToken();
        // cookie generate
        res.cookie("usercookie", token, {
          expires: new Date(Date.now() + 9000000),
          httpOnly: true,
        });
        const result = {
          userValid,
          token,
        };
        res.status(201).json({ status: 201, result });
      }
    }
  } catch (err) {
    res.status(401).json(err);
    console.log("catch block in login");
  }
});

//user valid
router.get("/validuser", authenticate, async (req, res) => {
  try {
    const ValidUserOne = await userdb.findOne({ _id: req.userId });
    res.status(201).json({ status: 201, ValidUserOne });
  } catch (err) {
    res.status(401).json({ status: 401, err });
    console.log("valid user error");
  }
});

router.get("/logout", authenticate, async (req, res) => {
  try {
    req.rootUser.tokens = req.rootUser.tokens.filter((curelem) => {
      return curelem.token !== req.token;
    });

    res.clearCookie("usercookie", { path: "/" });

    req.rootUser.save();

    res.status(201).json({ status: 201 });
  } catch (error) {
    res.status(401).json({ status: 401, error });
  }
});

module.exports = router;
