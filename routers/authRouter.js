const express = require("express");
const passport = require('passport');
const authController = require('../controllers/authController');
const { identifier } = require("../middlewares/identification");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { HistoryLog, User, UserInfo } = require("../models/userModel"); 
const auth = require('../middlewares/auth');

router.get('/register', (req, res) => {
    res.render("register"); 
});

router.get('/login', (req, res) => {
    res.render("login"); 
});

router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

// Google Callback
router.get("/google/callback", passport.authenticate("google", { failureRedirect: "/login" }),
  async (req, res) => {
    const user = req.user;
    const sessionToken = require("crypto").randomBytes(64).toString("hex");
    user.sessionToken = sessionToken;

    await user.save();

    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        role: user.u_role,
        sessionToken,
      },
      process.env.TOKEN_SECRET,
      { expiresIn: "8h" }
    );
    res.cookie("Authorization", "Bearer " + token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production"
    });

   
    await HistoryLog.create({
      user_id: user._id,
      user_name: user.name,
      user_status: user.status,
      date: new Date(),
      time_in: new Date()
    });
    let redirectUrl;
    switch (user.u_role.toLowerCase()) {
      case "admin":
        redirectUrl = "/admin/admin";
        break;
      case "staff":
        redirectUrl = "/staff/dashboard";
        break;
      case "janitor":
        redirectUrl = "/janitors/janitordash";
        break;
      default:
        redirectUrl = "/landing";
    }

    res.redirect(redirectUrl);
  }
);





router.post('/register', authController.signup);
router.post('/login', authController.signin);

router.post('/signout', identifier, authController.signout);

router.patch('/send-verification-code',identifier, authController.sendVerificationCode);
router.patch('/verify-verification-code',identifier, authController.verifyVerificationCode);
router.patch('/change-password',identifier, authController.changePassword);

router.patch('/send-forgot-password-code', authController.sendForgotPasswordCode);
router.patch('/verify-forgot-password-code', authController.verifyForgotPasswordCode);



router.get("/settings/info", auth, async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId).lean(); 
    const userInfo = await UserInfo.findOne({ userId }).lean();

    if (!user) return res.status(404).json({ message: "User not found" });
    console.log("User Email:", user.email); 
    res.json({
      name: user.name,
      email: user.email,
      role: user.u_role,
      avatar: user.avatar,
      gender: userInfo?.gender,
      birthdate: userInfo?.birthdate,
      contact: userInfo?.contact,
      address: userInfo?.address
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});


module.exports = router;