const express = require('express');
const multer = require('multer');
const path = require('path');
const { uploadFloorImage } = require('../controllers/createImage');
const { Floor} = require("../models/userModel");

const router = express.Router();

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'floor-images/');
  },
  filename: function(req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, 'floor-' + Date.now() + ext);
  }
});

const upload = multer({ storage });

// Upload floor image route
router.post('/upload-floor-image', upload.single('floorImage'), uploadFloorImage);

// New route: Get all floors with image paths
router.get('/floors', async (req, res) => {
  try {
    const floors = await Floor.find();
    res.json(floors);
  } catch (error) {
    console.error('Error fetching floors:', error);
    res.status(500).send('Server error fetching floors');
  }
});

module.exports = router;