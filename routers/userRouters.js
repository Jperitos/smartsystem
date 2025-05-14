// userRouter.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const { getUserProfile, updateUserProfile } = require('../controllers/userController');

const router = express.Router();

// Multer storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads');  // Save uploaded files in the 'uploads' folder
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);  // Add timestamp to filename for uniqueness
  }
});
const upload = multer({ storage });

// Route to fetch the user profile (get)
router.get('/profile/:id', getUserProfile);  // When user requests their profile, this will call the getUserProfile controller

// Route to update the user profile (post)
router.post('/profile/update/:id', upload.single('avatar'), updateUserProfile);  // Allows for file upload with profile update

module.exports = router;
