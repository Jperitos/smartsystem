
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
const { SensoredData } = require('./models/userModel'); 
const { ActivityLog, HistoryLog, User, Bin, BinLive } = require('./models/userModel');
const userRouters = require('./routers/userRouters');
const authenticated = require("./middlewares/Authenticated");
require('./middlewares/passport-setup');
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

app.get("/staff/dashboard", identifier, (req, res) => {
  res.render("staff/dashboard");
});


app.get("/janitors/janitordash", (req, res) => {
  res.render("janitors/janitordash"); 
});

app.get("/admin/admin", (req, res) => {
  res.render("admin/admin");
});

mongoose.connect(process.env.MONGO_URI).then(() => {
    console.log("Database connected");
}).catch((err) => {
    console.log(err);
});

app.use('/api/auth', authRouter);
app.use('/api/posts', postsRouter);
app.use('/api/users', userRouters);
app.use("/auth", authRouter);
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



// Socket.IO connection handler
io.on('connection', (socket) => {
  console.log('🔌 Web client connected');
});

