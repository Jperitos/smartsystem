const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { User } = require('../models/userModel');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../Public/uploads/profiles');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'profile-' + uniqueSuffix + ext);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function (req, file, cb) {
    // Accept only image files
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  }
});

// Route to update user profile
router.post('/update', upload.single('avatar'), async (req, res) => {
  try {
    if (!req.session.user || !req.session.user._id) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const userId = req.session.user._id;
    
    // Get the user from the database
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update basic user information
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    
    // Create or update user info object
    if (!user.info) {
      user.info = {};
    }
    
    user.info.gender = req.body.gender || user.info.gender;
    user.info.birthdate = req.body.birthdate || user.info.birthdate;
    user.info.contact = req.body.contact || user.info.contact;
    user.info.address = req.body.address || user.info.address;

    // Update avatar if a file was uploaded
    if (req.file) {
      // Delete old avatar file if it exists
      if (user.avatar && user.avatar.startsWith('/uploads/profiles/')) {
        const oldAvatarPath = path.join(__dirname, '../Public', user.avatar);
        if (fs.existsSync(oldAvatarPath)) {
          fs.unlinkSync(oldAvatarPath);
        }
      }

      // Set the new avatar path relative to the Public directory
      const relativePath = '/uploads/profiles/' + req.file.filename;
      user.avatar = relativePath;
    }

    // Save the updated user to the database
    await user.save();

    // Update the session with the latest user data
    req.session.user = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar
    };

    // Return success response
    res.status(200).json({ 
      message: 'Profile updated successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        info: user.info
      }
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Server error updating profile' });
  }
});

// Route to get current user profile
router.get('/me', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  res.json(req.session.user);
});

module.exports = router; 