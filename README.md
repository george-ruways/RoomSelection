# Room Selection App

A modern web application for selecting room participants and submitting data to Google Sheets.

## Features

- ✅ **Room Size Selection**: Choose from 2, 3, 4, or 5 people
- ✅ **Name Selection**: Select exactly the number of names matching room size
- ✅ **Duplicate Prevention**: Prevents selecting the same name multiple times
- ✅ **Used Names Detection**: Shows already used names from Google Sheets
- ✅ **Google Sheets Integration**: Submits selections to Google Sheets via API
- ✅ **Success Confirmation**: Shows success message after submission
- ✅ **Responsive Design**: Works on desktop and mobile devices
- ✅ **Modern UI**: Beautiful gradient design with smooth animations

## Files Structure

```
RoomSelection/
├── index.html          # Main HTML structure
├── styles.css          # Styling and responsive design
├── script.js          # JavaScript functionality
├── README.md          # This file
└── google-apps-script.js # Google Apps Script for Sheets integration
```

## Setup Instructions

### 1. Basic Setup
1. Open `index.html` in a web browser to run the application
2. The app works offline with mock data for testing

### 2. Google Sheets Integration

To connect with Google Sheets:

1. **Create a Google Sheet** with the following columns:
   - Column A: Timestamp
   - Column B: Room Size
   - Column C: Selected Names (comma-separated)
   - Column D: Submission ID

2. **Set up Google Apps Script**:
   - Go to [Google Apps Script](https://script.google.com/)
   - Create a new project
   - Copy the code from `google-apps-script.js`
   - Replace `'YOUR_SPREADSHEET_ID'` with your actual spreadsheet ID
   - Deploy as a web app with access set to "Anyone"

3. **Update the JavaScript**:
   - In `script.js`, replace `'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE'` with your deployed web app URL
   - Uncomment the actual Google Sheets implementation code
   - Comment out or remove the mock API calls

### 3. Customization

#### Available Names
Edit the `availableNames` array in `script.js` to customize the list of selectable names:

```javascript
this.availableNames = [
    'Your Name 1', 'Your Name 2', 'Your Name 3',
    // Add more names as needed
];
```

#### Room Sizes
To modify available room sizes, update both the HTML buttons in `index.html` and the JavaScript event handlers.

#### Styling
Customize colors, fonts, and layout in `styles.css`. The app uses CSS Grid and Flexbox for responsive layout.

## How It Works

1. **Step 1**: User selects a room size (2-5 people)
2. **Step 2**: App displays available names with visual indicators:
   - ✅ Available names (can be selected)
   - ❌ Used names (already in Google Sheets, disabled)
   - 🔵 Selected names (currently chosen)
3. **Step 3**: User selects exactly the required number of names
4. **Step 4**: App submits data to Google Sheets
5. **Step 5**: Success message shows selection summary

## Features in Detail

### Duplicate Prevention
- Names can only be selected once per session
- Visual feedback shows selected state
- Submit button only enables when exact count is reached

### Used Names Detection
- Loads previously used names from Google Sheets on app start
- Marks used names with red styling and "Already Used" badge
- Prevents selection of already used names

### Google Sheets Integration
- Sends structured data including timestamp, room size, names, and unique ID
- Handles API errors gracefully with retry options
- Updates local used names cache after successful submission

### Responsive Design
- Works on desktop, tablet, and mobile devices
- Grid layout adapts to screen size
- Touch-friendly buttons and interactions

## Browser Compatibility

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Troubleshooting

### Google Sheets Not Working
1. Verify the Google Apps Script URL is correct
2. Check that the web app is deployed with public access
3. Ensure CORS is properly configured
4. Check browser console for error messages

### Names Not Loading
1. Check internet connection
2. Verify the Google Apps Script is responding
3. Check browser network tab for API calls

### Mobile Issues
1. Ensure viewport meta tag is present
2. Test touch interactions
3. Check responsive breakpoints

## License

This project is open source and available under the MIT License.
