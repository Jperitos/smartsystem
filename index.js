const express = require("express");
const http = require('http');
const helmet = require("helmet");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const mongoose = require('mongoose');
const path = require("path");
const session = require('express-session');
const passport = require('passport');
const app = express();
const socketIo = require('socket.io');
const server = http.createServer(app);
const io = socketIo(server);  // Enable real-time updates
const multer = require('multer');
const fs = require('fs');


const { identifier } = require("./middlewares/identification");
const authRouter = require('./routers/authRouter');
const postsRouter = require('./routers/postsRouter');
const { SensoredData, UserInfo } = require('./models/userModel'); 
const { ActivityLog, HistoryLog, User, Bin, BinLive } = require('./models/userModel');
const userRouters = require('./routers/userRouters');
const authenticated = require("./middlewares/Authenticated");
require('./middlewares/passport-setup');
const userdisplay = require("./routers/userRouts");
const { saveBinData } = require('./middlewares/dbHandler');
const imageRouter = require('./routers/imageRouter');
const { getUserNotifications, markNotificationAsRead, sendAssignmentNotification } = require('./middlewares/notificationService');

// Configure multer for file storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Create uploads/profiles directory if it doesn't exist
    const uploadDir = path.join(__dirname, 'public/uploads/profiles');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fileExt = path.extname(file.originalname);
    cb(null, 'profile-' + uniqueSuffix + fileExt);
  }
});

// File filter to accept only images
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 2 * 1024 * 1024 // 2MB max file size
  }, 
  fileFilter: fileFilter
});

app.use(cors());
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net", "https://cdn.socket.io"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "http://localhost:8000", "ws://localhost:8000", "http://localhost:9000", "ws://localhost:9001"]
      
    }
  }
}));



app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET,  // Use the secret from .env
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());  // Use Passport session here

// Your routes and other middleware
app.use(authRouter);
app.set("view engine", "ejs");
app.set("views", __dirname + "/view");
app.use(express.static("Public"));


io.on('connection', (socket) => {
  console.log('🔌 Web client connected');
});

app.get("/", (req, res) => {
    res.redirect("/landing");
});

app.get("/landing", (req, res) => {
    res.render("landing");
});

app.get('/login', (req, res) => {
  res.render('login', { errorMessage: null });
});

app.get("/register", (req, res) => {
  res.render("register"); 
});

app.get("/forgot_password", (req, res) => {
  res.render("forgot_password"); 
});


app.get("/reset_password", (req, res) => {
  res.render("reset_password"); 
});

app.get("/display", (req, res) => {
    res.render("display");
});
app.get("/news", (req, res) => {
    res.render("news");
});
app.get("/image", (req, res) => {
    res.render("image");
});

app.get("/staff/dashboard", identifier, (req, res) => {
  res.render("staff/dashboard");
});


app.get("/janitors/janitor", identifier, (req, res) => {
  res.render("janitors/janitor"); 
});

app.get("/admin/admin", identifier, (req, res) => {
  res.render("admin/admin");
});

mongoose.connect(process.env.MONGO_URI).then(() => {
    console.log("Database connected");
}).catch((err) => {
    console.log(err);
});

app.use('/api/auth', authRouter);
app.use('/api/posts', postsRouter);
app.use('/users', userRouters);
app.use("/auth", authRouter);
app.use('/api', userdisplay);

// Add missing API endpoints that are causing 500 errors

// API endpoint for getting all users (for allStaff.js)
app.get('/api/users', async (req, res) => {
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
    console.error('Error fetching users:', err);
    res.status(500).json({ error: 'Server error fetching users' });
  }
});

// API endpoint for floor images
app.get('/api/images/floors', async (req, res) => {
  try {
    // Fetch floor data from the database
    const { Floor } = require('./models/userModel');
    const floors = await Floor.find().sort({ createdAt: 1 }).lean(); // Sort by creation date
    
    // If no floors in database, return static floor data as fallback
    if (floors.length === 0) {
      console.log('No floors found in database, returning static floor data');
      const staticFloors = [
        { _id: '1', floorName: 'Floor 1', imagePath: '/image/Floor Plan 1.png' },
        { _id: '2', floorName: 'Floor 2', imagePath: '/image/Floor Plan 2.png' },
        { _id: '3', floorName: 'Floor 3', imagePath: '/image/Floor Plan 3.png' },
        { _id: '4', floorName: 'Floor 4', imagePath: '/image/Floor Plan 4.png' },
        { _id: '5', floorName: 'Floor 5', imagePath: '/image/Floor Plan 5.png' },
        { _id: '6', floorName: 'Floor 6', imagePath: '/image/Floor Plan 6.png' }
      ];
      return res.json(staticFloors);
    }
    
    // Return actual database floors
    console.log(`Found ${floors.length} floors in database`);
    res.json(floors);
  } catch (err) {
    console.error('Error fetching floor images:', err);
    res.status(500).json({ error: 'Server error fetching floor images' });
  }
});

// Fallback endpoint for current user (for testing notifications without authentication)
app.get('/api/current-user', async (req, res) => {
  try {
    // For testing purposes, return a sample janitor user
    // In production, this should use proper authentication
    const sampleUser = await User.findOne({ u_role: 'janitor' }).lean();
    
    if (!sampleUser) {
      // Create a sample user if none exists
      const newUser = new User({
        name: 'Test Janitor',
        email: 'janitor@test.com',
        u_role: 'janitor',
        status: 'active',
        verified: true
      });
      const savedUser = await newUser.save();
      return res.json(savedUser);
    }
    
    res.json(sampleUser);
  } catch (err) {
    console.error('Error getting current user:', err);
    res.status(500).json({ error: 'Server error getting current user' });
  }
});

// Test endpoint to create sample assignment notification
app.post('/api/test-assignment-notification', async (req, res) => {
  try {
    console.log('Creating test assignment notification...');
    
    // Get or create a test janitor user
    let testUser = await User.findOne({ u_role: 'janitor' });
    if (!testUser) {
      testUser = new User({
        name: 'Test Janitor',
        email: 'janitor@test.com',
        u_role: 'janitor',
        status: 'active',
        verified: true
      });
      await testUser.save();
      console.log('Created test user:', testUser.name);
    }
    
    // Get or create a test bin
    let testBin = await Bin.findOne();
    if (!testBin) {
      testBin = new Bin({
        bin_code: 'S1Bin1',
        type: 'biodegradable',
        location: 'Floor 1 North',
        bin_level: 75,
        capacity: 100,
        status: 'active'
      });
      await testBin.save();
      console.log('Created test bin:', testBin.bin_code);
    }
    
    // Create test assignment with realistic data
    const testBinLevel = Math.floor(Math.random() * 50) + 50; // Random level between 50-100%
    const floor = Math.floor(Math.random() * 6) + 1; // Random floor 1-6
    const taskDescriptions = [
      'Empty and clean the bin',
      'Replace bin liner and sanitize',
      'Full bin collection required',
      'Regular maintenance check',
      'Emergency bin collection'
    ];
    const randomTask = taskDescriptions[Math.floor(Math.random() * taskDescriptions.length)];
    
    console.log('Creating activity log with:', {
      bin_id: testBin._id,
      u_id: testUser._id,
      bin_level: testBinLevel,
      floor: floor,
      assigned_task: randomTask
    });
    
    // Create activity log directly (this will automatically trigger notification via the POST endpoint logic)
    const newActivityLog = new ActivityLog({
      bin_id: testBin._id,
      u_id: testUser._id,
      bin_level: testBinLevel,
      floor: floor,
      assigned_task: randomTask,
      date: new Date(),
      time: new Date().toTimeString().split(' ')[0],
      status: 'assigned'
    });
    
    await newActivityLog.save();
    console.log('Activity log saved:', newActivityLog._id);
    
    // Send notification manually since we're bypassing the POST endpoint
    try {
      console.log('🔔 Sending task assignment notification to user:', testUser._id);
      
      await sendAssignmentNotification(
        testUser._id, 
        testBin._id, 
        randomTask, 
        floor, 
        testBinLevel
      );
      
      console.log('✅ Task assignment notification sent successfully');
    } catch (notifErr) {
      console.warn('⚠️ Failed to send task assignment notification:', notifErr.message);
    }
    
    res.json({ 
      success: true, 
      message: 'Test assignment notification created',
      data: {
        assignedTo: testUser.name,
        binCode: testBin.bin_code,
        floor: floor,
        binLevel: `${testBinLevel}%`,
        task: randomTask,
        activityLogId: newActivityLog._id
      }
    });
  } catch (error) {
    console.error('Error creating test assignment notification:', error);
    res.status(500).json({ error: 'Failed to create test notification', details: error.message });
  }
});

server.listen(process.env.PORT || 8000, () => {
  console.log("Server running at http://localhost:8000");
});



app.get('/api/activity-logs', async (req, res) => {
  try {
    console.log('Fetching all activity logs...');
    
    // Fetch activity logs with populated user and bin data, sorted by date (newest first)
    const logs = await ActivityLog.find()
      .populate('u_id', 'name email u_role')
      .populate('bin_id', 'bin_code location type status')
      .sort({ date: -1, time: -1 }) // Sort by date and time (newest first)
      .lean(); // Use lean() for better performance
    
    console.log(`Found ${logs.length} activity logs`);
    
    // Enhance the logs with additional formatting if needed
    const enhancedLogs = logs.map(log => ({
      ...log,
      // Ensure date is in proper format
      date: log.date ? new Date(log.date) : null,
      // Ensure time is in proper format
      time: log.time || null,
      // Add user info fallbacks
      user_name: log.u_id?.name || 'Unknown User',
      user_email: log.u_id?.email || '',
      user_role: log.u_id?.u_role || '',
      // Add bin info fallbacks
      bin_code: log.bin_id?.bin_code || `Bin-${log.bin_id?._id?.toString().slice(-6) || 'Unknown'}`,
      bin_location: log.bin_id?.location || 'Unknown Location',
      bin_type: log.bin_id?.type || 'Unknown Type'
    }));
    
    res.json(enhancedLogs);
  } catch (err) {
    console.error('Error fetching activity logs:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST endpoint for creating new activity logs
app.post('/api/activity-logs', async (req, res) => {
  try {
    const { bin_id, u_id, bin_level, floor, assigned_task, date, time, status } = req.body;
    
    // Validate required fields
    if (!bin_id || !u_id) {
      return res.status(400).json({ error: 'bin_id and u_id are required fields' });
    }
    
    console.log('Received assignment data:', req.body);
    
    // Handle string IDs vs MongoDB ObjectIds
    let processedBinId = bin_id;
    let processedUId = u_id;
    
    // If bin_id is not a valid ObjectId format, search by bin_code instead
    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(bin_id);
    if (!isValidObjectId) {
      try {
        // Try to find the bin by its code
        const bin = await Bin.findOne({ bin_code: bin_id });
        if (bin) {
          processedBinId = bin._id;
        } else {
          // Create a new bin if it doesn't exist
          const newBin = new Bin({
            bin_code: bin_id,
            bin_level: bin_level || 0,
            type: 'unknown',
            status: 'active'
          });
          const savedBin = await newBin.save();
          processedBinId = savedBin._id;
        }
      } catch (err) {
        console.error('Error processing bin_id:', err);
        return res.status(400).json({ error: 'Invalid bin ID format' });
      }
    }
    
    // Create new activity log
    const newActivityLog = new ActivityLog({
      bin_id: processedBinId,
      u_id: processedUId,
      bin_level: bin_level || 0,
      floor: floor || 1,
      assigned_task: assigned_task || '',
      date: date ? new Date(date) : new Date(),
      time: time || new Date().toTimeString().split(' ')[0],
      status: status || 'assigned'
    });
    
    console.log('Saving activity log:', newActivityLog);
    
    // Save to database
    const savedLog = await newActivityLog.save();
    
    // Update the bin's data
    try {
      await Bin.findByIdAndUpdate(processedBinId, {
        $set: { 
          last_collected: new Date(),
          assigned_to: processedUId,
          bin_level: bin_level || 0
        }
      });
    } catch (binErr) {
      console.warn('Could not update bin data:', binErr);
      // Continue even if bin update fails
    }
    
    // AUTOMATICALLY SEND NOTIFICATION TO ASSIGNED USER
    try {
      console.log('🔔 Sending task assignment notification to user:', processedUId);
      
      await sendAssignmentNotification(
        processedUId, 
        processedBinId, 
        assigned_task || 'Empty and clean the bin', 
        floor || 1, 
        bin_level || 0
      );
      
      console.log('✅ Task assignment notification sent successfully');
    } catch (notifErr) {
      console.warn('⚠️ Failed to send task assignment notification:', notifErr.message);
      // Don't fail the activity log creation if notification fails
    }
    
    res.status(201).json(savedLog);
  } catch (error) {
    console.error('Error saving activity log:', error);
    res.status(500).json({ error: 'Failed to save assignment', details: error.message });
  }
});

app.use('/floor-images', express.static(path.join(__dirname, 'floor-images')));

// Use the image router
app.use('/api/images', imageRouter);

// GET History Logs
app.get('/api/history-logs', async (req, res) => {
  try {
    console.log('Fetching all history logs...');
    
    // Fetch history logs with populated user data, sorted by date (newest first)
    const logs = await HistoryLog.find()
      .populate('user_id', 'name email u_role')
      .sort({ date: -1 }) // Sort by date (newest first)
      .lean(); // Use lean() for better performance
    
    console.log(`Found ${logs.length} history logs`);
    
    // Enhance the logs with additional formatting if needed
    const enhancedLogs = logs.map(log => ({
      ...log,
      // Ensure date is in proper format
      date: log.date ? new Date(log.date) : null,
      // Add user info fallbacks
      user_name: log.user_name || log.user_id?.name || 'Unknown User',
      user_email: log.user_id?.email || '',
      user_role: log.user_status || log.user_id?.u_role || 'Unknown Role'
    }));
    
    res.json(enhancedLogs);
  } catch (err) {
    console.error('Error fetching history logs:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/history', async (req, res) => {
  const history = await BinLive.find().sort({ timestamp: -1 }).limit(50);
  res.json(history);
});

app.get('/api/bin-data', async (req, res) => {
  try {
    const data = await SensoredData.find({ fillLevel: { $gte: 85 } }).sort({ timestamp: -1 }).lean();
    res.json(data);
  } catch (err) {
    console.error('Error fetching bin data:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/staff', async (req, res) => {
  try {

    const janitors = await User.find({ u_role: 'janitor' }).select('_id name');

    const userIds = janitors.map(u => u._id);

    const userInfos = await UserInfo.find({ user: { $in: userIds } }).select('user assign_area');

    const assignAreaMap = {};
    userInfos.forEach(info => {
      assignAreaMap[info.user.toString()] = info.assign_area;
    });
    const janitorsWithArea = janitors.map(janitor => ({
      _id: janitor._id,
      name: janitor.name,
      assign_area: assignAreaMap[janitor._id.toString()] || null,
    }));

    res.json(janitorsWithArea);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch staff' });
  }
});

app.get('/api/bin/:binId', async (req, res) => {
  try {
    const bin = await Bin.findById(req.params.binId);
    if (!bin) return res.status(404).json({ error: 'Bin not found' });
    res.json(bin);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch bin info' });
  }
});

app.get('/api/activity-log/latest', async (req, res) => {
  const { bin_id } = req.query;
  if (!bin_id) return res.status(400).json({ error: 'bin_id required' });

  try {
    const latestLog = await ActivityLog.findOne({ bin_id })
      .sort({ date: -1, time: -1 }) // latest
      .lean();

    if (!latestLog) return res.status(404).json({ error: 'No activity log found' });

    res.json({
      date: latestLog.date.toISOString().slice(0, 10),
      time: latestLog.time
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});




// Socket.IO connection handler
io.on('connection', (socket) => {
  console.log('🔌 Web client connected');
});

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'Public/uploads')));

// Profile update endpoint with image upload
app.post('/api/update-profile', upload.single('profile_image'), async (req, res) => {
  try {
    const { user_id, name, gender, birthdate, contact, address, email } = req.body;
    
    console.log('Profile update request received:', req.body);
    if (req.file) {
      console.log('Image file received:', req.file.filename);
    }
    
    if (!user_id) {
      return res.status(400).json({ message: 'User ID is required' });
    }
    
    // Find the user
    const user = await User.findById(user_id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Update user basic info
    if (name) user.name = name;
    if (email) user.email = email;
    
    // Update profile image if uploaded
    let imagePath = '';
    if (req.file) {
      // Create relative path to image for storage in DB
      imagePath = `/uploads/profiles/${req.file.filename}`;
      
      // Update the user's profile image path
      user.profile_image = imagePath;
    }
    
    // Get or create user info document
    let userInfo = await UserInfo.findOne({ user: user_id });
    
    // If userInfo doesn't exist and we have the required fields, create it
    if (!userInfo) {
      if (!gender || !birthdate || !contact || !address) {
        return res.status(400).json({ 
          message: 'Missing required fields for profile creation',
          details: 'Gender, birthdate, contact, and address are required for new profiles'
        });
      }
      
      userInfo = new UserInfo({ 
        user: user_id,
        gender,
        birthdate: new Date(birthdate),
        contact,
        address,
        assign_area: 'First floor' // Default value
      });
    } else {
      // Update existing userInfo fields
      if (gender) userInfo.gender = gender;
      if (birthdate) userInfo.birthdate = new Date(birthdate);
      if (contact) userInfo.contact = contact;
      if (address) userInfo.address = address;
    }
    
    // Save both documents
    await Promise.all([user.save(), userInfo.save()]);
    
    console.log('Profile updated successfully for user:', user.name);
    
    res.status(200).json({ 
      message: 'Profile updated successfully',
      imagePath: imagePath || user.profile_image || null,
      name: user.name,
      email: user.email,
      userInfo: {
        gender: userInfo.gender,
        birthdate: userInfo.birthdate,
        contact: userInfo.contact,
        address: userInfo.address,
        assign_area: userInfo.assign_area
      }
    });
    
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Failed to update profile', error: error.message });
  }
});

// Test endpoint to create sample activity logs for demonstration
app.post('/api/activity-logs/sample', async (req, res) => {
  try {
    console.log('Creating sample activity logs...');
    
    // Find a sample user and bin (or create them if they don't exist)
    let sampleUser = await User.findOne({ u_role: 'janitor' });
    if (!sampleUser) {
      sampleUser = new User({
        name: 'Sample Janitor',
        email: 'janitor@test.com',
        password: 'password123',
        u_role: 'janitor',
        status: 'active',
        verified: true
      });
      await sampleUser.save();
    }
    
    let sampleBin = await Bin.findOne();
    if (!sampleBin) {
      sampleBin = new Bin({
        bin_code: 'BIN001',
        type: 'biodegradable',
        location: 'Floor 1',
        bin_level: 75,
        capacity: 100,
        status: 'active'
      });
      await sampleBin.save();
    }
    
    // Create some sample activity logs
    const sampleLogs = [
      {
        u_id: sampleUser._id,
        bin_id: sampleBin._id,
        bin_level: 85,
        floor: 1,
        assigned_task: 'Empty biodegradable bin',
        date: new Date(),
        time: '08:30',
        status: 'completed'
      },
      {
        u_id: sampleUser._id,
        bin_id: sampleBin._id,
        bin_level: 65,
        floor: 1,
        assigned_task: 'Regular maintenance check',
        date: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
        time: '14:15',
        status: 'assigned'
      },
      {
        u_id: sampleUser._id,
        bin_id: sampleBin._id,
        bin_level: 90,
        floor: 1,
        assigned_task: 'Emergency bin collection',
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        time: '10:45',
        status: 'in-progress'
      }
    ];
    
    // Save the sample logs
    const savedLogs = await ActivityLog.insertMany(sampleLogs);
    
    console.log(`Created ${savedLogs.length} sample activity logs`);
    res.json({ 
      message: `Successfully created ${savedLogs.length} sample activity logs`,
      logs: savedLogs 
    });
    
  } catch (error) {
    console.error('Error creating sample activity logs:', error);
    res.status(500).json({ error: 'Failed to create sample data', details: error.message });
  }
});

// Test endpoint to get activity logs count
app.get('/api/activity-logs/count', async (req, res) => {
  try {
    const count = await ActivityLog.countDocuments();
    res.json({ total_logs: count });
  } catch (err) {
    console.error('Error counting activity logs:', err);
    res.status(500).json({ error: err.message });
  }
});

// Notification API endpoints
app.get('/api/notifications', async (req, res) => {
  try {
    const { user_id } = req.query;
    
    let notifications;
    if (user_id) {
      // Get notifications for specific user
      notifications = await getUserNotifications(user_id);
    } else {
      // Get all notifications (for admin view)
      const { Notification } = require('./models/userModel');
      notifications = await Notification.find()
        .populate('user_id', 'name email u_role')
        .populate('bin_id', 'bin_code location type')
        .sort({ created_at: -1 })
        .lean();
    }
    
    res.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications', details: error.message });
  }
});

// Mark notification as read
app.put('/api/notifications/:id/read', async (req, res) => {
  try {
    await markNotificationAsRead(req.params.id);
    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: 'Failed to mark notification as read', details: error.message });
  }
});

// Mark all notifications as read for a user
app.put('/api/notifications/mark-all-read', async (req, res) => {
  try {
    const { user_id } = req.body;
    
    if (!user_id) {
      return res.status(400).json({ error: 'user_id is required' });
    }
    
    const { Notification } = require('./models/userModel');
    await Notification.updateMany(
      { user_id: user_id, status: 'sent' },
      { status: 'read' }
    );
    
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ error: 'Failed to mark all notifications as read', details: error.message });
  }
});

// Send assignment notification to staff
app.post('/api/send-assignment-notification', async (req, res) => {
  try {
    const { staffId, binId, assignedTask, floor } = req.body;
    
    if (!staffId || !binId || !floor) {
      return res.status(400).json({ error: 'staffId, binId, and floor are required' });
    }
    
    console.log('Sending assignment notification:', req.body);
    
    const notification = await sendAssignmentNotification(staffId, binId, assignedTask, floor);
    
    res.status(201).json({ 
      message: 'Assignment notification sent successfully',
      notification: notification
    });
  } catch (error) {
    console.error('Error sending assignment notification:', error);
    res.status(500).json({ error: 'Failed to send assignment notification', details: error.message });
  }
});

// PUT endpoint for updating activity log status
app.put('/api/activity-logs/:id', async (req, res) => {
  try {
    const logId = req.params.id;
    const { status, notes, end_time, start_time, completion_date } = req.body;
    
    console.log(`Updating activity log ${logId} with:`, { status, notes, end_time, start_time });
    
    // Validate the status
    const validStatuses = ['assigned', 'inprogress', 'in-progress', 'completed', 'done', 'pending'];
    if (status && !validStatuses.includes(status.toLowerCase())) {
      return res.status(400).json({ error: `Invalid status value. Must be one of: ${validStatuses.join(', ')}` });
    }
    
    // Get the current activity log to check previous status
    const currentLog = await ActivityLog.findById(logId);
    if (!currentLog) {
      return res.status(404).json({ error: 'Activity log not found' });
    }
    
    // Prepare update object
    const updateData = {};
    if (status) updateData.status = status.toLowerCase();
    if (notes) updateData.notes = notes;
    
    // Handle timestamps based on status changes
    const newStatus = (status || '').toLowerCase();
    const currentStatus = (currentLog.status || '').toLowerCase();
    
    // Add start timestamp if changing to in-progress
    if (newStatus === 'inprogress' && currentStatus !== 'inprogress') {
      updateData.start_time = start_time || new Date().toTimeString().split(' ')[0];
      console.log('Task started at:', updateData.start_time);
    }
    
    // Handle end time for completed tasks
    if (newStatus === 'completed' || newStatus === 'done') {
      // Use provided end_time or generate current time
      updateData.end_time = end_time || new Date().toTimeString().split(' ')[0];
      updateData.completion_date = completion_date || new Date();
      console.log('Task completed at:', updateData.end_time);
    }
    
    // Update last modified timestamp
    updateData.updated_at = new Date();
    
    // Update the activity log
    const updatedLog = await ActivityLog.findByIdAndUpdate(
      logId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate('u_id', 'name email u_role')
     .populate('bin_id', 'bin_code location type status');
    
    if (!updatedLog) {
      return res.status(404).json({ error: 'Activity log not found after update' });
    }
    
    // Log the successful update
    console.log('Activity log updated successfully:', {
      id: updatedLog._id,
      status: updatedLog.status,
      user: updatedLog.u_id?.name,
      bin: updatedLog.bin_id?.bin_code,
      start_time: updatedLog.start_time,
      end_time: updatedLog.end_time
    });
    
    // If task is completed, optionally update the bin status
    if (newStatus === 'completed' || newStatus === 'done') {
      try {
        if (updatedLog.bin_id) {
          await Bin.findByIdAndUpdate(updatedLog.bin_id._id, {
            $set: { 
              last_collected: new Date(),
              bin_level: 0, // Reset bin level after collection
              status: 'active'
            }
          });
          console.log('Bin status updated after completion');
        }
      } catch (binErr) {
        console.warn('Could not update bin status:', binErr.message);
        // Don't fail the activity log update if bin update fails
      }
    }
    
    // Return the updated log with enhanced response
    res.json({
      ...updatedLog.toObject(),
      message: 'Activity log updated successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error updating activity log:', error);
    res.status(500).json({ 
      error: 'Failed to update activity log', 
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Get user's current notifications count (for badge display)
app.get('/api/notifications/count', async (req, res) => {
  try {
    const { user_id } = req.query;
    
    if (!user_id) {
      return res.status(400).json({ error: 'user_id is required' });
    }
    
    const { Notification } = require('./models/userModel');
    const unreadCount = await Notification.countDocuments({ 
      user_id: user_id, 
      status: 'sent' 
    });
    
    res.json({ unreadCount });
  } catch (error) {
    console.error('Error getting notification count:', error);
    res.status(500).json({ error: 'Failed to get notification count', details: error.message });
  }
});

