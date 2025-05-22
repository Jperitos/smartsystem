const {Floor} = require('../models/userModel');

async function uploadFloorImage(req, res) {
  try {
    if (!req.file) {
      return res.status(400).send('No image file uploaded.');
    }

    const imagePath = req.file.path; // e.g., floor-images/floor-123456789.jpg
    const floorName = req.body.floorName || 'Unnamed Floor';

    // Save new floor document with image path
    const newFloor = new Floor({
      floorName,
      imagePath
    });

    await newFloor.save();

    res.status(200).json({
      message: 'Floor image uploaded and saved successfully.',
      floor: newFloor
    });
  } catch (error) {
    console.error('Error uploading floor image:', error);
    res.status(500).send('Server error uploading floor image.');
  }
}

module.exports = { uploadFloorImage };
