# Google Sheets Integration Setup Guide

## 📋 Step 1: Create Your Google Sheet

1. **Go to Google Sheets**: Visit [sheets.google.com](https://sheets.google.com)
2. **Create a new sheet**: Click "Blank" or use the + button
3. **Name your sheet**: "Room Selection Data" (or any name you prefer)
4. **Set up columns** in Row 1:
   - A1: `Timestamp`
   - B1: `Room Size` 
   - C1: `Selected Names`
   - D1: `Submission ID`
   - E1: `Date Added`

5. **Get your Sheet ID**: 
   - Look at the URL: `https://docs.google.com/spreadsheets/d/SHEET_ID_HERE/edit`
   - Copy the long string between `/d/` and `/edit`
   - Example: `1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms`

## 🔧 Step 2: Set Up Google Apps Script

1. **Open Google Apps Script**: Visit [script.google.com](https://script.google.com)
2. **Create new project**: Click "New project"
3. **Replace the default code** with the code from `google-apps-script.js`
4. **Update the SPREADSHEET_ID**:
   ```javascript
   const SPREADSHEET_ID = 'YOUR_ACTUAL_SHEET_ID_HERE';
   ```
5. **Save the project**: Ctrl+S or File → Save
6. **Name your project**: "Room Selection API" (or similar)

## 🚀 Step 3: Deploy as Web App

1. **Click Deploy**: Blue "Deploy" button → "New deployment"
2. **Choose type**: Click gear icon → select "Web app"
3. **Fill deployment settings**:
   - **Description**: "Room Selection API v1"
   - **Execute as**: "Me (your email)"
   - **Who has access**: "Anyone" (required for public access)
4. **Click Deploy**
5. **Authorize permissions**: 
   - Click "Authorize access"
   - Choose your Google account
   - Click "Advanced" → "Go to [project name] (unsafe)"
   - Click "Allow"
6. **Copy the Web App URL**: It looks like:
   ```
   https://script.google.com/macros/s/ABC123.../exec
   ```

## 🔄 Step 4: Update Your App Code

Update `script.js` in your Room Selection App:

### Replace the Google Sheets Configuration:
```javascript
// Find this section in script.js (around line 20)
this.googleSheetsConfig = {
    // Replace with your actual Google Apps Script Web App URL
    scriptUrl: 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec',
    apiUrl: 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec'
};
```

### Enable Real Google Sheets Integration:
```javascript
// In the submitToGoogleSheets method, replace the mock API call with:
async submitToGoogleSheets(data) {
    const response = await fetch(this.googleSheetsConfig.scriptUrl, {
        method: 'POST',
        mode: 'cors',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            action: 'addSubmission',
            data: data
        })
    });

    if (!response.ok) {
        throw new Error('Failed to submit to Google Sheets');
    }

    return await response.json();
}

// In the loadUsedNames method, replace the mock data with:
async loadUsedNames() {
    try {
        const response = await fetch(this.googleSheetsConfig.scriptUrl, {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'getUsedNames'
            })
        });

        if (response.ok) {
            const data = await response.json();
            this.usedNames = new Set(data.usedNames || []);
        }
    } catch (error) {
        console.error('Error loading used names:', error);
    }
}

// In the loadRoomUsage method, replace the mock data with:
async loadRoomUsage() {
    try {
        const response = await fetch(this.googleSheetsConfig.scriptUrl, {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'getRoomUsage'
            })
        });

        if (response.ok) {
            const data = await response.json();
            if (data.success) {
                Object.keys(data.roomUsage).forEach(size => {
                    this.roomLimits[size].used = data.roomUsage[size];
                });
            }
        }
    } catch (error) {
        console.error('Error loading room usage:', error);
    }
}
```

## 🧪 Step 5: Test the Integration

1. **Test the Google Apps Script**:
   - In Google Apps Script editor
   - Select function: `testSetup`
   - Click "Run"
   - Check "Execution transcript" for success messages

2. **Test your web app**:
   - Make a test submission
   - Check your Google Sheet for new data
   - Verify room availability updates

## 🔍 Step 6: Troubleshooting

### Common Issues:

**❌ CORS Error**: 
- Make sure web app access is set to "Anyone"
- Redeploy if you changed settings

**❌ Permission Denied**:
- Re-run authorization process
- Check Google Apps Script permissions

**❌ Data Not Appearing**:
- Verify SPREADSHEET_ID is correct
- Check Google Apps Script logs for errors

**❌ Script Not Found**:
- Make sure you deployed as "Web app"
- Use the correct deployment URL

### Debug Steps:
1. Open browser Developer Tools (F12)
2. Check Console tab for error messages
3. Check Network tab for failed API calls
4. Verify Google Apps Script execution logs

## 📊 Expected Result

Once connected, your app will:
- ✅ Save submissions to Google Sheets in real-time
- ✅ Load previously used names on app start
- ✅ Track room availability across sessions
- ✅ Show accurate room counts and disable full room sizes
- ✅ Work from any device with internet access

## 🔄 Making Updates

After initial setup, you can:
- **Update the script**: Edit in Google Apps Script → Save (no redeployment needed)
- **Update room limits**: Modify the `roomLimits` object in your app
- **Add features**: Extend both the web app and Google Apps Script

Your Room Selection App will now be fully integrated with Google Sheets! 🎉
