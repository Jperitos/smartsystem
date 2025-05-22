const { required, number } = require('joi');
const mongoose = require('mongoose');


const userInfoSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  address: { type: String, required: true },
  contact: { type: String, required: true },
  birthdate: { type: Date, required: true },
  gender: { type: String, enum: ['Male', 'Female'], required: true },
  assign_area: { type: String, required: true }
});

 
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: function () { return !this.googleId; },
    trim: true,
    minLength: [2, "Name must have at least 2 characters!"],
    maxLength: [50, "Name cannot exceed 50 characters!"],
    match: [/^[a-zA-Z\s]+$/, "Name can only contain letters and spaces!"],
  },
  email: {
    type: String,
    required: [true, 'Email is required!'],
    trim: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: function () { return !this.googleId; },
    trim: true,
    select: false,
  },
  u_role: {
    type: String,
    enum: ['admin', 'janitor', 'staff'],
    required: true,
  },
  status: {
    type: String,
    enum: ['inactive', 'active', 'suspended'],
    required: true,
  },
  sessionToken: {
    type: String,
    default: null,
  },
  verified: {
    type: Boolean,
    default: false,
  },
  verificationCode: {
    type: String,
    select: false,
  },
  verificationCodeValidation: {
    type: Number,
    select: false,
  },
  forgotPasswordCode: {
    type: String,
    select: false,
  },
  forgotPasswordCodeValidation: {
    type: Number,
    select: false,
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true,
  },
  avatar: {
    type: String,
  },
  profile_image: {
    type: String,
    default: '/image/profile2.jpg'
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});


userSchema.virtual('info', {
  ref: 'UserInfo',        
  localField: '_id',      
  foreignField: 'user',
  justOne: true           
});


const sensoredDataSchema = new mongoose.Schema({
    data_id: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    height: { type: Number }, 
    weight: { type: Number }, 
    type: {
      type: String,
      enum: ['biodegradable', 'non-biodegradable', 'foodwaste'],
      required: true
    },
    starting_time: { type: Date },      
    fullbin_time: { type: Date },        
    fillLevel: { type: Number },        
  });
  

const activityLogSchema = new mongoose.Schema({
  u_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  bin_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Bin', required: true },
  bin_level: Number,        
  floor: Number,             
  assigned_task: String, 
  date: Date,
  time: String,
  status: String
});

const alertSchema = new mongoose.Schema({
    sensored_id: { type: mongoose.Schema.Types.ObjectId, 
    ref: 'SensoredData' },
    bin_id: { type: mongoose.Schema.Types.ObjectId, 
    ref: 'Bin' },
    status: String
});

const binSchema = new mongoose.Schema({
    sensored_id: { type: mongoose.Schema.Types.ObjectId, 
    ref: 'SensoredData' },
    bin_code: { type: String,
    required: true },
    type: String,
    location: String,
    bin_level: Number,
    capacity: Number,
    last_collected: Date,
    status: String
});

const historyLogSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    user_name: { type: String },
    user_status: { type: String },
    time_in: Date,
    time_out: Date,
    date: Date
});

const notificationSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    bin_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Bin' },
    message: String,
    notif_type: String,
    created_at: Date,
    send_time: Date,
    status: String
});


const binLiveSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  bin1: {
    weight: Number,
    height: Number,
    avg: Number
  },
  bin2: {
    weight: Number,
    height: Number,
    avg: Number
  },
  bin3: {
    weight: Number,
    height: Number,
    avg: Number
  }
});

const floorSchema = new mongoose.Schema({
  floorName: String,
  imagePath: String,
  createdAt: { type: Date, default: Date.now }
});

const BinLive = mongoose.model("BinLive", binLiveSchema);
const UserInfo = mongoose.model("UserInfo", userInfoSchema);
const User = mongoose.model("User", userSchema);
const SensoredData = mongoose.model("SensoredData", sensoredDataSchema);
const ActivityLog = mongoose.model("ActivityLog", activityLogSchema);
const Alert = mongoose.model("Alert", alertSchema);
const Bin = mongoose.model("Bin", binSchema);
const HistoryLog = mongoose.model("HistoryLog", historyLogSchema);
const Notification = mongoose.model("Notification", notificationSchema);
const Floor = mongoose.model('Floor', floorSchema);

module.exports = {
    User,
    UserInfo,
    SensoredData,
    ActivityLog,
    Alert,
    Bin,
    HistoryLog,
    Notification,
    BinLive,
    Floor
};
