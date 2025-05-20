const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const {SensoredData} = require('../models/userModel');
const MONGO_URI = "mongodb+srv://jamesarpilang04:KnCcxkCLH8KVIBy4@cluster0.yammk.mongodb.net/authExample?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('✅ Connected to MongoDB via Mongoose (dbHandler)');
}).catch(err => {
  console.error('❌ MongoDB connection error (dbHandler):', err);
});

// In-memory state tracking for bins
const savedBins = {
  bin1: { started: false, full: false },
  bin2: { started: false, full: false },
  bin3: { started: false, full: false },
};

// Define or import these helper functions if not already in this file
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
