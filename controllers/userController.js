// userController.js
const { User, UserInfo } = require('../models/userModel');

// Function to get user profile
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('info'); // Populates the info field with related data

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Return the user data
    res.json(user); // You could send data to render in the view or just send it as a response
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Function to update user profile
exports.updateUserProfile = async (req, res) => {
  try {
    const { name, gender, contact, address, email, birthdate } = req.body;
    const avatar = req.file ? `/uploads/${req.file.filename}` : null;

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Update base User fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (avatar) user.avatar = avatar;

    // Update associated UserInfo (ensure UserInfo exists)
    let userInfo = await UserInfo.findById(user.info);
    if (!userInfo) {
      // If userInfo doesn't exist, create a new one
      userInfo = new UserInfo({
        user: user._id,
        contact,
        address,
        gender,
        birthdate
      });
      await userInfo.save();
      user.info = userInfo._id;
    } else {
      // Update existing userInfo
      if (contact) userInfo.contact = contact;
      if (address) userInfo.address = address;
      if (gender) userInfo.gender = gender;
      if (birthdate) userInfo.birthdate = birthdate;
      await userInfo.save();
    }

    await user.save();
    const updatedUser = await User.findById(user._id).populate('info');

    res.json({ message: 'Profile updated successfully', user: updatedUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
