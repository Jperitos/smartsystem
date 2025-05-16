const express = require('express');
const router = express.Router();
const { User, UserInfo } = require('../models/userModel');

router.get('/users', async (req, res) => {
  try {
    
    const users = await User.find().lean().exec();
    const userIds = users.map(u => u._id);
    const userInfos = await UserInfo.find({ user: { $in: userIds } }).lean().exec();

    
    const userInfoMap = {};
    userInfos.forEach(info => {
      userInfoMap[info.user.toString()] = info;
    });

    
    const usersWithInfo = users.map(user => ({
      ...user,
      info: userInfoMap[user._id.toString()] || null
    }));

    res.json(usersWithInfo);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error fetching users' });
  }
});

module.exports = router;
