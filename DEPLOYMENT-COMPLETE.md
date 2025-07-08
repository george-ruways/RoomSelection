# Room Selection App - Complete Deployment Guide

## 🚀 Overview
This is a complete room selection application with admin dashboard that integrates with Google Sheets for data storage and management.

## 📋 Features
- **User Features:**
  - Room size selection (2, 3, 4, 5 people)
  - Name selection from admin-managed list
  - Exact count enforcement
  - Duplicate prevention
  - Success confirmation with unique reservation ID

- **Admin Features:**
  - Password-protected admin dashboard (`S7s@210704`)
  - Real-time room availability management
  - View and delete submissions
  - Download submissions as Excel
  - Manage available names
  - Reset all data functionality

## 🛠️ Deployment Steps

### Step 1: Set Up Google Sheets Backend

1. **Create Google Apps Script Project:**
   - Go to [script.google.com](https://script.google.com)
   - Click "New Project"
   - Replace the default code with `google-apps-script-rebuild.js`
   - Save the project with a meaningful name (e.g., "Room Selection Backend")

2. **Deploy as Web App:**
   - Click "Deploy" → "New deployment"
   - Type: Web app
   - Description: "Room Selection API"
   - Execute as: Me
   - Who has access: Anyone
   - Click "Deploy"
   - **Copy the Web App URL** (you'll need this for the frontend)

3. **Initialize the Spreadsheet:**
   - In the Apps Script editor, run the `initializeScript()` function
   - This creates the required sheets: RoomSelections, Settings, AvailableNames
   - Check that a new Google Spreadsheet was created with these sheets

### Step 2: Configure Frontend

1. **Update Configuration:**
   - Open `main-rebuild.js`
   - Replace `YOUR_SCRIPT_ID` in `GOOGLE_SHEETS_URL` with your actual Web App URL
   - Example: `https://script.google.com/macros/s/AKfycbz.../exec`

2. **Replace Files:**
   ```bash
   # In your RoomSelection directory
   cp index-rebuild.html index.html
   cp styles-rebuild.css styles.css
   cp main-rebuild.js main.js
   ```

### Step 3: Deploy Frontend

1. **Web Server Deployment:**
   - Upload `index.html`, `styles.css`, and `main.js` to your web hosting
   - Ensure all files are in the same directory
   - Test the deployment URL

2. **Local Testing:**
   ```bash
   # For testing locally
   python -m http.server 8000
   # Visit http://localhost:8000
   ```

## 🔧 Configuration Options

### Google Apps Script Configuration
In `google-apps-script-rebuild.js`, you can modify:

```javascript
const CONFIG = {
  // Default room limits
  DEFAULT_ROOM_LIMITS: {
    2: 5,  // 5 rooms for 2 people
    3: 4,  // 4 rooms for 3 people
    4: 3,  // 3 rooms for 4 people
    5: 2   // 2 rooms for 5 people
  },
  
  // Add/modify default names
  DEFAULT_NAMES: [
    'Name 1', 'Name 2', 'Name 3'
    // Add more names as needed
  ]
};
```

### Frontend Configuration
In `main-rebuild.js`, you can modify:

```javascript
const CONFIG = {
  // Admin password
  ADMIN_PASSWORD: 'S7s@210704',
  
  // Google Sheets URL (from deployment)
  GOOGLE_SHEETS_URL: 'YOUR_WEB_APP_URL_HERE'
};
```

## 👤 Admin Dashboard Usage

### Accessing Admin Dashboard
1. Click the "🔑 Admin" button in the top-right corner
2. Enter password: `S7s@210704`
3. Click "Login"

### Admin Features

#### Settings Tab
- **Room Availability:** Set the number of available rooms for each size
- **Data Management:** Refresh all data or reset everything

#### Submissions Tab
- **View Submissions:** See all room reservations with details
- **Download Excel:** Export all submissions as spreadsheet
- **Delete Submissions:** Remove individual reservations (frees up rooms and names)

#### Manage Names Tab
- **View Names:** See all available names and their status
- **Upload Names:** (Future feature) Upload names from Excel file

## 📊 Data Structure

### Google Sheets Structure

#### RoomSelections Sheet
| Column A | Column B | Column C | Column D | Column E | Column F |
|----------|----------|----------|----------|----------|----------|
| ID | Room Size | Names | Timestamp | Date | Status |

#### Settings Sheet
| Column A | Column B |
|----------|----------|
| Setting | Value |
| room_limit_2 | 5 |
| room_limit_3 | 4 |
| room_limit_4 | 3 |
| room_limit_5 | 2 |

#### AvailableNames Sheet
| Column A | Column B |
|----------|----------|
| Name | Status |
| John Doe | available |
| Jane Smith | available |

## 🔒 Security Features

1. **Admin Password Protection:** Only users with correct password can access admin features
2. **CORS Protection:** Google Apps Script handles cross-origin requests securely
3. **Data Validation:** All inputs are validated before processing
4. **Unique IDs:** Each submission gets a unique identifier for tracking

## 🐛 Troubleshooting

### Common Issues

1. **"Failed to submit" Error:**
   - Check Google Apps Script URL is correct
   - Verify the script is deployed as "Anyone" access
   - Check browser console for detailed errors

2. **Empty Names Grid:**
   - Run `initializeScript()` in Google Apps Script
   - Check AvailableNames sheet has data
   - Verify Google Sheets permissions

3. **Admin Login Not Working:**
   - Check password is exactly: `S7s@210704`
   - Clear browser cache
   - Check console for JavaScript errors

4. **Room Availability Not Updating:**
   - Check Settings sheet has room limits
   - Run "Refresh All Data" from admin dashboard
   - Verify Google Apps Script deployment

### Debug Mode
Open browser console (F12) to see detailed logs:
- All actions are logged with 🚀, ✅, ❌ prefixes
- Error messages include specific details
- Network requests show Google Sheets communication

## 📱 Mobile Responsiveness

The app is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile phones
- Different screen orientations

## 🔄 Data Synchronization

- **Real-time Updates:** All changes sync immediately with Google Sheets
- **Used Names:** Automatically tracked across submissions
- **Room Availability:** Updates in real-time as rooms are booked/cancelled
- **Admin Dashboard:** Shows live data from Google Sheets

## 📈 Monitoring & Analytics

### Google Apps Script Execution Logs
- View logs in Google Apps Script editor
- Monitor API calls and errors
- Track performance metrics

### Browser Console Logs
- All user actions logged
- Error tracking and debugging
- Performance monitoring

## 🚀 Production Considerations

1. **Backup Strategy:**
   - Google Sheets automatically saves data
   - Consider regular exports for additional backup
   - Document admin password securely

2. **Performance:**
   - Google Apps Script has daily execution limits
   - Consider caching for high-traffic scenarios
   - Monitor quota usage in Google Cloud Console

3. **Scaling:**
   - Current setup handles moderate traffic well
   - For high-volume usage, consider database migration
   - Monitor Google Sheets API limits

4. **Maintenance:**
   - Regular data cleanup through admin dashboard
   - Monitor for spam submissions
   - Update available names as needed

## 📞 Support

For technical issues:
1. Check browser console for errors
2. Verify Google Apps Script deployment
3. Test with different browsers
4. Check Google Sheets permissions

The application is designed to be robust and self-healing, with comprehensive error handling and user feedback.
