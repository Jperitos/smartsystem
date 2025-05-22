const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const { SensoredData, User, Bin, Notification } = require('../models/userModel');

const MONGO_URI = "mongodb+srv://jamesarpilang04:KnCcxkCLH8KVIBy4@cluster0.yammk.mongodb.net/authExample?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB via Mongoose (dbHandler)');
  })
  .catch(err => {
    console.error('❌ MongoDB connection error (dbHandler):', err);
  });

// In-memory state tracking for bins
const savedBins = {
  bin1: { started: false, full: false },
  bin2: { started: false, full: false },
  bin3: { started: false, full: false },
};

function getHeightPercentage(distance) {
  const minDistance = 11;
  const maxDistance = 35;
  if (distance == null) return 0;
  if (distance <= minDistance) return 100;
  if (distance >= maxDistance) return 0;
  return Math.round(((maxDistance - distance) / (maxDistance - minDistance)) * 100);
}

function getWeightPercentage(weight) {
  const maxWeight = 150;
  if (typeof weight !== 'number' || weight <= 0) return 0;
  return Math.min((weight / maxWeight) * 100, 100);
}

// Notification sending function
async function sendBinNotification(binKey, fillLevel) {
  try {
    const janitor = await User.findOne({ u_role: 'janitor' });
    if (!janitor) {
      console.warn('⚠️ No janitorial user found, notification not sent.');
      return;
    }

    const bin = await Bin.findOne({ bin_code: binKey });
    if (!bin) {
      console.warn(`⚠️ Bin with key "${binKey}" not found, notification not sent.`);
      return;
    }

    let notifType, message;

    if (fillLevel >= 85 && fillLevel <= 94) {
      notifType = 'Almost Full Alert';
      message = `${binKey.toUpperCase()} is almost full at ${fillLevel.toFixed(1)}%. Please prepare to empty it soon.`;
    } else if (fillLevel >= 95 && fillLevel <= 100) {
      notifType = 'Full Bin Alert';
      message = `${binKey.toUpperCase()} is FULL at ${fillLevel.toFixed(1)}%! Please empty it ASAP.`;
    } else {
      // No notification needed outside these ranges
      return;
    }

    const notification = new Notification({
      user_id: janitor._id,
      bin_id: bin._id,
      message,
      notif_type: notifType,
      created_at: new Date(),
      send_time: null,
      status: 'pending',
    });

    await notification.save();
    console.log(`🔔 Notification sent to janitorial staff: ${notifType} for ${binKey}`);

  } catch (err) {
    console.error('❌ Error sending notification:', err.message);
  }
}

// Updated saveBinData to accept and use userId and binId
async function saveBinData(binKey, binData, binType) {
  const weightPct = getWeightPercentage(binData.weight);
  const heightPct = getHeightPercentage(binData.height);
  const avg = (weightPct + heightPct) / 2;

  console.log(`${binKey.toUpperCase()} avg fill: ${avg.toFixed(1)}%`);

  try {
    if (avg >= 85 && avg <= 94) {
      if (!savedBins[binKey].started) {
        savedBins[binKey].started = true;
        savedBins[binKey].full = false;

        const newEntry = new SensoredData({
          data_id: uuidv4(),
          height: binData.height,
          weight: binData.weight,
          type: binType,
          starting_time: new Date(),
          fillLevel: avg,
        });
        await newEntry.save();
        console.log(`💾 Saved starting fill for ${binKey}`);

        // Send almost full notification
        await sendBinNotification(binKey, avg);
      }
    } else if (avg >= 95 && avg <= 100) {
      if (!savedBins[binKey].full) {
        savedBins[binKey].full = true;

        const newEntry = new SensoredData({
          data_id: uuidv4(),
          height: binData.height,
          weight: binData.weight,
          type: binType,
          fullbin_time: new Date(),
          fillLevel: avg,
        });
        await newEntry.save();
        console.log(`💾 Saved FULL bin alert for ${binKey}`);

        // Send full bin notification
        await sendBinNotification(binKey, avg);
      }
    } else {
      // Reset flags if below 85%
      savedBins[binKey].started = false;
      savedBins[binKey].full = false;
    }
  } catch (saveErr) {
    console.error(`❌ Error saving data for ${binKey}:`, saveErr.message);
  }
}

module.exports = { saveBinData };
