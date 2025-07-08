/**
 * Google Apps Script Backend for Room Selection App
 * This script handles all data operations for the room selection system
 */

// Configuration
const CONFIG = {
  SHEET_NAME: 'RoomSelections',
  SETTINGS_SHEET: 'Settings',
  NAMES_SHEET: 'AvailableNames',
  
  // Default room limits
  DEFAULT_ROOM_LIMITS: {
    2: 5,
    3: 4,
    4: 3,
    5: 2
  },
  
  // Default available names
  DEFAULT_NAMES: [
    'Sarah Johnson', 'Michael Chen', 'Emily Rodriguez', 'David Kim', 'Jessica Wang',
    'Alex Thompson', 'Maria Garcia', 'James Wilson', 'Lisa Anderson', 'Robert Taylor',
    'Amanda Martinez', 'Kevin Lee', 'Rachel Brown', 'Christopher Davis', 'Nicole Miller',
    'Daniel Jackson', 'Ashley Wilson', 'Matthew Garcia', 'Stephanie Lee', 'Brandon Moore',
    'Lauren Taylor', 'Joshua Anderson', 'Megan Thomas', 'Tyler Johnson', 'Samantha White',
    'Andrew Clark', 'Brittany Lewis', 'Ryan Hall', 'Victoria Young', 'Nathan King',
    'Kayla Wright', 'Justin Scott', 'Hannah Green', 'Zachary Adams', 'Alexis Baker',
    'Ethan Nelson', 'Taylor Hill', 'Jordan Carter', 'Morgan Phillips', 'Cameron Evans'
  ]
};

/**
 * Main function to handle all HTTP requests
 */
function doGet(e) {
  const action = e.parameter.action;
  
  try {
    switch (action) {
      case 'getAllData':
        return ContentService
          .createTextOutput(JSON.stringify(getAllData()))
          .setMimeType(ContentService.MimeType.JSON);
          
      case 'downloadSubmissions':
        return downloadSubmissionsAsExcel();
        
      default:
        return ContentService
          .createTextOutput(JSON.stringify({
            success: false,
            error: 'Invalid action'
          }))
          .setMimeType(ContentService.MimeType.JSON);
    }
  } catch (error) {
    console.error('Error in doGet:', error);
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Handle POST requests
 */
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action;
    
    let result;
    
    switch (action) {
      case 'addSubmission':
        result = addSubmission(data);
        break;
        
      case 'deleteSubmission':
        result = deleteSubmission(data.id);
        break;
        
      case 'updateRoomLimit':
        result = updateRoomLimit(data.roomSize, data.limit);
        break;
        
      case 'resetAllData':
        result = resetAllData();
        break;
        
      case 'updateAvailableNames':
        result = updateAvailableNames(data.names);
        break;
        
      default:
        result = {
          success: false,
          error: 'Invalid action'
        };
    }
    
    return ContentService
      .createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    console.error('Error in doPost:', error);
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Initialize the spreadsheet with required sheets and data
 */
function initializeSpreadsheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // Create main submissions sheet
  let submissionsSheet = ss.getSheetByName(CONFIG.SHEET_NAME);
  if (!submissionsSheet) {
    submissionsSheet = ss.insertSheet(CONFIG.SHEET_NAME);
    submissionsSheet.getRange(1, 1, 1, 6).setValues([
      ['ID', 'Room Size', 'Names', 'Timestamp', 'Date', 'Status']
    ]);
    submissionsSheet.getRange(1, 1, 1, 6).setFontWeight('bold');
  }
  
  // Create settings sheet
  let settingsSheet = ss.getSheetByName(CONFIG.SETTINGS_SHEET);
  if (!settingsSheet) {
    settingsSheet = ss.insertSheet(CONFIG.SETTINGS_SHEET);
    settingsSheet.getRange(1, 1, 1, 2).setValues([['Setting', 'Value']]);
    settingsSheet.getRange(1, 1, 1, 2).setFontWeight('bold');
    
    // Initialize room limits
    const roomLimitsData = Object.entries(CONFIG.DEFAULT_ROOM_LIMITS).map(([size, limit]) => 
      [`room_limit_${size}`, limit]
    );
    settingsSheet.getRange(2, 1, roomLimitsData.length, 2).setValues(roomLimitsData);
  }
  
  // Create names sheet
  let namesSheet = ss.getSheetByName(CONFIG.NAMES_SHEET);
  if (!namesSheet) {
    namesSheet = ss.insertSheet(CONFIG.NAMES_SHEET);
    namesSheet.getRange(1, 1, 1, 2).setValues([['Name', 'Status']]);
    namesSheet.getRange(1, 1, 1, 2).setFontWeight('bold');
    
    // Initialize with default names
    const namesData = CONFIG.DEFAULT_NAMES.map(name => [name, 'available']);
    namesSheet.getRange(2, 1, namesData.length, 2).setValues(namesData);
  }
}

/**
 * Get all application data
 */
function getAllData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // Ensure sheets exist
  initializeSpreadsheet();
  
  const data = {
    success: true,
    roomLimits: getRoomLimits(),
    availableNames: getAvailableNames(),
    usedNames: getUsedNames(),
    submissions: getSubmissions()
  };
  
  console.log('getAllData result:', data);
  return data;
}

/**
 * Get room limits from settings
 */
function getRoomLimits() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const settingsSheet = ss.getSheetByName(CONFIG.SETTINGS_SHEET);
  
  if (!settingsSheet) {
    return CONFIG.DEFAULT_ROOM_LIMITS;
  }
  
  const data = settingsSheet.getDataRange().getValues();
  const limits = { ...CONFIG.DEFAULT_ROOM_LIMITS };
  
  for (let i = 1; i < data.length; i++) {
    const [setting, value] = data[i];
    if (setting && setting.startsWith('room_limit_')) {
      const roomSize = setting.replace('room_limit_', '');
      limits[roomSize] = parseInt(value) || 0;
    }
  }
  
  return limits;
}

/**
 * Get available names
 */
function getAvailableNames() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const namesSheet = ss.getSheetByName(CONFIG.NAMES_SHEET);
  
  if (!namesSheet) {
    return CONFIG.DEFAULT_NAMES;
  }
  
  const data = namesSheet.getDataRange().getValues();
  const names = [];
  
  for (let i = 1; i < data.length; i++) {
    const [name, status] = data[i];
    if (name && name.trim()) {
      names.push(name.trim());
    }
  }
  
  return names.length > 0 ? names : CONFIG.DEFAULT_NAMES;
}

/**
 * Get used names from submissions
 */
function getUsedNames() {
  const submissions = getSubmissions();
  const usedNames = new Set();
  
  submissions.forEach(submission => {
    if (submission.names && Array.isArray(submission.names)) {
      submission.names.forEach(name => usedNames.add(name));
    }
  });
  
  return Array.from(usedNames);
}

/**
 * Get all submissions
 */
function getSubmissions() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const submissionsSheet = ss.getSheetByName(CONFIG.SHEET_NAME);
  
  if (!submissionsSheet) {
    return [];
  }
  
  const data = submissionsSheet.getDataRange().getValues();
  const submissions = [];
  
  for (let i = 1; i < data.length; i++) {
    const [id, roomSize, namesStr, timestamp, date, status] = data[i];
    
    if (id && roomSize && namesStr) {
      try {
        const names = typeof namesStr === 'string' 
          ? namesStr.split(',').map(name => name.trim())
          : [];
          
        submissions.push({
          id: id,
          roomSize: parseInt(roomSize),
          names: names,
          timestamp: timestamp,
          date: date,
          status: status || 'active'
        });
      } catch (error) {
        console.error('Error parsing submission row:', error, data[i]);
      }
    }
  }
  
  return submissions;
}

/**
 * Add a new submission
 */
function addSubmission(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const submissionsSheet = ss.getSheetByName(CONFIG.SHEET_NAME);
  
  if (!submissionsSheet) {
    initializeSpreadsheet();
    return addSubmission(data);
  }
  
  try {
    const { id, roomSize, names, timestamp } = data;
    
    // Validate data
    if (!id || !roomSize || !names || !Array.isArray(names) || names.length === 0) {
      throw new Error('Invalid submission data');
    }
    
    // Check room availability
    const currentLimits = getRoomLimits();
    const currentSubmissions = getSubmissions();
    const usedRooms = currentSubmissions.filter(s => s.roomSize === roomSize).length;
    
    if (usedRooms >= currentLimits[roomSize]) {
      throw new Error(`No rooms available for ${roomSize} people`);
    }
    
    // Check name availability
    const usedNames = getUsedNames();
    const conflictingNames = names.filter(name => usedNames.includes(name));
    if (conflictingNames.length > 0) {
      throw new Error(`Names already in use: ${conflictingNames.join(', ')}`);
    }
    
    // Add submission
    const date = new Date(timestamp).toLocaleDateString();
    const namesStr = names.join(', ');
    
    submissionsSheet.appendRow([
      id,
      roomSize,
      namesStr,
      timestamp,
      date,
      'active'
    ]);
    
    console.log('Submission added:', { id, roomSize, names });
    
    return {
      success: true,
      message: 'Submission added successfully'
    };
    
  } catch (error) {
    console.error('Error adding submission:', error);
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Delete a submission
 */
function deleteSubmission(submissionId) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const submissionsSheet = ss.getSheetByName(CONFIG.SHEET_NAME);
  
  if (!submissionsSheet) {
    return {
      success: false,
      error: 'Submissions sheet not found'
    };
  }
  
  try {
    const data = submissionsSheet.getDataRange().getValues();
    let rowToDelete = -1;
    
    // Find the submission
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === submissionId) {
        rowToDelete = i + 1; // +1 because sheets are 1-indexed
        break;
      }
    }
    
    if (rowToDelete === -1) {
      return {
        success: false,
        error: 'Submission not found'
      };
    }
    
    // Delete the row
    submissionsSheet.deleteRow(rowToDelete);
    
    console.log('Submission deleted:', submissionId);
    
    return {
      success: true,
      message: 'Submission deleted successfully'
    };
    
  } catch (error) {
    console.error('Error deleting submission:', error);
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Update room limit
 */
function updateRoomLimit(roomSize, limit) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const settingsSheet = ss.getSheetByName(CONFIG.SETTINGS_SHEET);
  
  if (!settingsSheet) {
    initializeSpreadsheet();
    return updateRoomLimit(roomSize, limit);
  }
  
  try {
    const settingName = `room_limit_${roomSize}`;
    const data = settingsSheet.getDataRange().getValues();
    let rowToUpdate = -1;
    
    // Find existing setting
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === settingName) {
        rowToUpdate = i + 1;
        break;
      }
    }
    
    if (rowToUpdate === -1) {
      // Add new setting
      settingsSheet.appendRow([settingName, limit]);
    } else {
      // Update existing setting
      settingsSheet.getRange(rowToUpdate, 2).setValue(limit);
    }
    
    console.log('Room limit updated:', { roomSize, limit });
    
    return {
      success: true,
      message: `Room limit for ${roomSize} people updated to ${limit}`
    };
    
  } catch (error) {
    console.error('Error updating room limit:', error);
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Reset all data
 */
function resetAllData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  try {
    // Clear submissions
    const submissionsSheet = ss.getSheetByName(CONFIG.SHEET_NAME);
    if (submissionsSheet) {
      const lastRow = submissionsSheet.getLastRow();
      if (lastRow > 1) {
        submissionsSheet.getRange(2, 1, lastRow - 1, 6).clearContent();
      }
    }
    
    // Reset room limits to defaults
    const settingsSheet = ss.getSheetByName(CONFIG.SETTINGS_SHEET);
    if (settingsSheet) {
      const data = settingsSheet.getDataRange().getValues();
      for (let i = 1; i < data.length; i++) {
        const [setting] = data[i];
        if (setting && setting.startsWith('room_limit_')) {
          const roomSize = setting.replace('room_limit_', '');
          const defaultLimit = CONFIG.DEFAULT_ROOM_LIMITS[roomSize] || 0;
          settingsSheet.getRange(i + 1, 2).setValue(defaultLimit);
        }
      }
    }
    
    console.log('All data reset');
    
    return {
      success: true,
      message: 'All data has been reset successfully'
    };
    
  } catch (error) {
    console.error('Error resetting data:', error);
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Update available names
 */
function updateAvailableNames(names) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const namesSheet = ss.getSheetByName(CONFIG.NAMES_SHEET);
  
  if (!namesSheet) {
    initializeSpreadsheet();
    return updateAvailableNames(names);
  }
  
  try {
    // Clear existing names (keep header)
    const lastRow = namesSheet.getLastRow();
    if (lastRow > 1) {
      namesSheet.getRange(2, 1, lastRow - 1, 2).clearContent();
    }
    
    // Add new names
    if (names && Array.isArray(names) && names.length > 0) {
      const namesData = names.map(name => [name.trim(), 'available']);
      namesSheet.getRange(2, 1, namesData.length, 2).setValues(namesData);
    }
    
    console.log('Available names updated:', names.length, 'names');
    
    return {
      success: true,
      message: `${names.length} names updated successfully`
    };
    
  } catch (error) {
    console.error('Error updating names:', error);
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Download submissions as Excel file
 */
function downloadSubmissionsAsExcel() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const submissionsSheet = ss.getSheetByName(CONFIG.SHEET_NAME);
  
  if (!submissionsSheet) {
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: 'No submissions found'
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  try {
    // Create a temporary spreadsheet for export
    const tempSS = SpreadsheetApp.create('Room_Submissions_Export');
    const tempSheet = tempSS.getSheets()[0];
    
    // Copy data
    const data = submissionsSheet.getDataRange().getValues();
    if (data.length > 0) {
      tempSheet.getRange(1, 1, data.length, data[0].length).setValues(data);
      
      // Format header
      tempSheet.getRange(1, 1, 1, data[0].length).setFontWeight('bold');
      tempSheet.autoResizeColumns(1, data[0].length);
    }
    
    // Convert to blob
    const blob = DriveApp.getFileById(tempSS.getId()).getBlob();
    
    // Clean up
    DriveApp.getFileById(tempSS.getId()).setTrashed(true);
    
    return HtmlService.createHtmlOutput('')
      .setContent(Utilities.base64Encode(blob.getBytes()))
      .setMimeType('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      
  } catch (error) {
    console.error('Error creating Excel download:', error);
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Test function to verify the script works
 */
function testScript() {
  console.log('Testing Room Selection Script...');
  
  // Initialize if needed
  initializeSpreadsheet();
  
  // Test getting data
  const data = getAllData();
  console.log('Test data retrieved:', data);
  
  // Test adding a submission
  const testSubmission = {
    id: 'TEST_' + Date.now(),
    roomSize: 2,
    names: ['Test User 1', 'Test User 2'],
    timestamp: new Date().toISOString()
  };
  
  const addResult = addSubmission(testSubmission);
  console.log('Test submission result:', addResult);
  
  // Test deleting the submission
  if (addResult.success) {
    const deleteResult = deleteSubmission(testSubmission.id);
    console.log('Test deletion result:', deleteResult);
  }
  
  console.log('Script test completed successfully!');
}

/**
 * Initialize the script (run this once after deployment)
 */
function initializeScript() {
  console.log('Initializing Room Selection Script...');
  initializeSpreadsheet();
  console.log('Script initialized successfully!');
}
