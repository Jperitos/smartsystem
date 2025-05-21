
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


const { identifier } = require("./middlewares/identification");
const authRouter = require('./routers/authRouter');
const postsRouter = require('./routers/postsRouter');
const { SensoredData, UserInfo } = require('./models/userModel'); 
const { ActivityLog, HistoryLog, User, Bin, BinLive } = require('./models/userModel');
const userRouters = require('./routers/userRouters');
const authenticated = require("./middlewares/Authenticated");
require('./middlewares/passport-setup');
const userdisplay = require("./routers/userRouts");



app.use(cors());
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
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
app.use(express.static("public"));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));


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


server.listen(process.env.PORT || 8000, () => {
  console.log("Server running at http://localhost:8000");
});



app.get('/api/activity-logs', async (req, res) => {
  try {
    const logs = await ActivityLog.find()
      .populate('u_id', 'name')
      .populate('bin_id', 'bin_code location');
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



// GET History Logs
app.get('/api/history-logs', async (req, res) => {
  try {
    const logs = await HistoryLog.find()
      .populate('user_id', 'name');
    res.json(logs);
  } catch (err) {
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

