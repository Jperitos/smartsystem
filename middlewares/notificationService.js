const { Notification, User, Bin } = require('../models/userModel');

// Function to send assignment notification to staff
async function sendAssignmentNotification(staffId, binId, assignedTask, floor, binLevel) {
  try {
    // Get staff and bin details
    const staff = await User.findById(staffId);
    
    // Handle both ObjectId and bin code formats for binId
    let bin = null;
    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(binId);
    
    if (isValidObjectId) {
      // If it's a valid ObjectId, find by ID
      bin = await Bin.findById(binId);
    } else {
      // If it's not an ObjectId, treat it as a bin code
      bin = await Bin.findOne({ bin_code: binId });
    }
    
    if (!staff) {
      console.warn('⚠️ Staff member not found, notification not sent.');
      return;
    }

    // Create notification message with static bin level data from assignment time
    const binCode = bin ? bin.bin_code : binId; // Use binId as fallback if bin not found
    const taskDescription = assignedTask || 'Empty and clean the bin';
    const staticBinLevel = binLevel !== null && binLevel !== undefined ? `${binLevel}%` : 'Not specified';
    
    const message = `🗑️ NEW TASK ASSIGNMENT
    
You have been assigned to clear bin ${binCode} on Floor ${floor}.

Task Details:
• Bin Code: ${binCode}
• Bin Location: Floor ${floor}
• Bin Level at Assignment: ${staticBinLevel}
• Task: ${taskDescription}
• Assigned Time: ${new Date().toLocaleString()}

Please proceed to the bin location and complete the assigned task. Update your task status when completed.`;
    
    // Create new notification
    const notification = new Notification({
      user_id: staffId,
      bin_id: bin ? bin._id : null, // Store the actual bin ObjectId if found, null otherwise
      message: message,
      notif_type: 'Task Assignment',
      created_at: new Date(),
      send_time: new Date(),
      status: 'sent'
    });

    await notification.save();
    console.log(`🔔 Assignment notification sent to ${staff.name}: Task for ${binCode} on Floor ${floor} (Bin Level: ${staticBinLevel})`);
    
    return notification;
  } catch (err) {
    console.error('❌ Error sending assignment notification:', err.message);
    throw err;
  }
}

// Function to get notifications for a specific user
async function getUserNotifications(userId) {
  try {
    const notifications = await Notification.find({ user_id: userId })
      .populate('bin_id', 'bin_code location type')
      .sort({ created_at: -1 })
      .lean();
    
    return notifications;
  } catch (err) {
    console.error('❌ Error fetching user notifications:', err.message);
    throw err;
  }
}

// Function to mark notification as read
async function markNotificationAsRead(notificationId) {
  try {
    await Notification.findByIdAndUpdate(notificationId, {
      status: 'read'
    });
    console.log(`✅ Notification ${notificationId} marked as read`);
  } catch (err) {
    console.error('❌ Error marking notification as read:', err.message);
    throw err;
  }
}

module.exports = {
  sendAssignmentNotification,
  getUserNotifications,
  markNotificationAsRead
};
