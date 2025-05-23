# Floor Image Container Guide

## 📍 Location of `<div id="floorImageContainer1"></div>`

The `floorImageContainer1` div is located in these dashboard files:

### 1. **Staff Dashboard**
**File**: `view/Staff/dashboard.ejs` (Line 364)
```html
<div class="container-map">
  <div class="map-container">
    <div class="box">
      <div id="floorImageContainer1"></div>
    </div>
  </div>
  <div class="floorstat">
    <select class="floor-dropdown" id="floor1">
      <option value="1">Floor 1</option>
      <option value="2">Floor 2</option>
      <!-- ... more options ... -->
    </select>
    <div class="stat">Status</div>
  </div>
</div>
```

### 2. **Janitors Dashboard**
**File**: `view/janitors/janitor.ejs` (Line 150)
```html
<div class="container-map">
  <div class="map-container">
    <div class="box">
      <div id="floorImageContainer1"></div>
    </div>
  </div>
  <!-- Similar structure with floor dropdown -->
</div>
```

### 3. **Admin Dashboard**
**File**: `view/admin/admin.ejs` (Line 80)
```html
<div class="container-map">
  <div class="map-container">
    <div class="box">
      <div id="floorImageContainer1"></div>
    </div>
  </div>
  <!-- Similar structure with floor dropdown -->
</div>
```

## 🗄️ Database Floor Schema

**File**: `models/userModel.js`
```javascript
const floorSchema = new mongoose.Schema({
  floorName: String,        // e.g., "Floor 1", "Floor 2"
  imagePath: String,        // e.g., "floor-images/floor-123456789.jpg"
  createdAt: { type: Date, default: Date.now }
});

const Floor = mongoose.model('Floor', floorSchema);
```

## ⚙️ How It Works

### 1. **JavaScript Controller**
**File**: `Public/js/floorque1.js`

The JavaScript file handles:
- **Fetching floors** from `/api/images/floors` API
- **Displaying images** in `floorImageContainer1`
- **Responding to dropdown changes** (floor selection)

```javascript
// Key functions:
- fetchFloors() // Gets floor data from database
- displayFloorImage(selectedFloor) // Shows the selected floor image
- Event listener for floor dropdown changes
```

### 2. **API Endpoint**
**File**: `index.js` (Updated to use database)

```javascript
app.get('/api/images/floors', async (req, res) => {
  try {
    // Fetch from database
    const { Floor } = require('./models/userModel');
    const floors = await Floor.find().sort({ createdAt: 1 }).lean();
    
    // Fallback to static data if no floors in database
    if (floors.length === 0) {
      // Returns static floor plans from /image/ directory
    }
    
    res.json(floors);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});
```

### 3. **Image Upload System**
**File**: `controllers/createImage.js` & `routers/imageRouter.js`

- **Upload endpoint**: `/api/images/upload-floor-image`
- **Storage**: Images saved to `floor-images/` directory
- **Database**: Floor records created with `floorName` and `imagePath`

## 🔧 How to Use

### To Load Database Images:
1. **Upload images** via `/image` page or API endpoint
2. **Include JavaScript**: `<script src="/js/floorque1.js"></script>`
3. **HTML structure**:
   ```html
   <div id="floorImageContainer1"></div>
   <select id="floor1">
     <option value="1">Floor 1</option>
     <!-- ... -->
   </select>
   ```

### To Add to Display Page:
If you want to add this to `display.ejs`, you would:

1. **Add the HTML**:
   ```html
   <div class="container-map">
     <div class="map-container">
       <div class="box">
         <div id="floorImageContainer1"></div>
       </div>
     </div>
     <div class="floorstat">
       <select class="floor-dropdown" id="floor1">
         <option value="1">Floor 1</option>
         <option value="2">Floor 2</option>
         <!-- ... -->
       </select>
     </div>
   </div>
   ```

2. **Include the JavaScript**:
   ```html
   <script src="/js/floorque1.js"></script>
   ```

3. **Add CSS** (from existing dashboard styles):
   ```css
   .container-map, .map-container, .box, .floorstat { /* ... */ }
   ```

## 📂 File Structure Summary

```
📁 smartsystem/
├── 📁 models/
│   └── userModel.js          # Floor schema definition
├── 📁 controllers/
│   └── createImage.js        # Floor image upload logic
├── 📁 routers/
│   └── imageRouter.js        # Image upload routes
├── 📁 Public/
│   ├── 📁 js/
│   │   └── floorque1.js      # JavaScript for floorImageContainer1
│   └── 📁 image/            # Static floor plan images
├── 📁 floor-images/         # Uploaded floor images from database
├── 📁 view/
│   ├── 📁 Staff/
│   │   └── dashboard.ejs     # Contains floorImageContainer1
│   ├── 📁 janitors/
│   │   └── janitor.ejs       # Contains floorImageContainer1  
│   ├── 📁 admin/
│   │   └── admin.ejs         # Contains floorImageContainer1
│   ├── display.ejs           # Your current display page
│   └── image.ejs             # Floor image upload page
└── index.js                  # API endpoints
```

The system is designed to:
1. **Fallback to static images** if no database floors exist
2. **Load from database** when floors are uploaded
3. **Update dynamically** when floor selection changes
4. **Handle both static and dynamic content** seamlessly 