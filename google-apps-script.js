/**
 * Google Apps Script for Room Selection App
 * This script handles data submission to Google Sheets
 */

// Replace with your actual Google Sheets ID
const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID';
const SHEET_NAME = 'Room Selections';

/**
 * Main function to handle POST requests from the web app
 */
function doPost(e) {
  try {
    // Parse the incoming JSON data
    const data = JSON.parse(e.postData.contents);
    
    switch(data.action) {
      case 'addSubmission':
        return addSubmission(data.data);
      case 'getUsedNames':
        return getUsedNames();
      case 'getRoomUsage':
        return getRoomUsage();
      default:
        return ContentService
          .createTextOutput(JSON.stringify({error: 'Invalid action'}))
          .setMimeType(ContentService.MimeType.JSON);
    }
  } catch (error) {
    Logger.log('Error in doPost: ' + error.toString());
    return ContentService
      .createTextOutput(JSON.stringify({error: 'Server error: ' + error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Handle GET requests (for CORS preflight)
 */
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({status: 'OK', message: 'Room Selection API is running'}))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Add a new room selection submission to the Google Sheet
 */
function addSubmission(submissionData) {
  try {
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = spreadsheet.getSheetByName(SHEET_NAME);
    
    // Create sheet if it doesn't exist
    if (!sheet) {
      sheet = spreadsheet.insertSheet(SHEET_NAME);
      // Add headers
      sheet.getRange(1, 1, 1, 5).setValues([
        ['Timestamp', 'Room Size', 'Selected Names', 'Submission ID', 'Date Added']
      ]);
      sheet.getRange(1, 1, 1, 5).setFontWeight('bold');
    }
    
    // Prepare the data row
    const timestamp = new Date(submissionData.timestamp);
    const roomSize = submissionData.roomSize;
    const selectedNames = submissionData.selectedNames.join(', ');
    const submissionId = submissionData.submissionId;
    const dateAdded = new Date();
    
    // Add the new row
    sheet.appendRow([timestamp, roomSize, selectedNames, submissionId, dateAdded]);
    
    // Auto-resize columns for better readability
    sheet.autoResizeColumns(1, 5);
    
    Logger.log('Successfully added submission: ' + submissionId);
    
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        message: 'Submission added successfully',
        submissionId: submissionId
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    Logger.log('Error adding submission: ' + error.toString());
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: 'Failed to add submission: ' + error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Get all used names from previous submissions
 */
function getUsedNames() {
  try {
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = spreadsheet.getSheetByName(SHEET_NAME);
    
    if (!sheet) {
      return ContentService
        .createTextOutput(JSON.stringify({
          success: true,
          usedNames: []
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // Get all data from the sheet
    const data = sheet.getDataRange().getValues();
    const usedNames = new Set();
    
    // Skip header row and process each submission
    for (let i = 1; i < data.length; i++) {
      const selectedNamesString = data[i][2]; // Column C contains selected names
      if (selectedNamesString) {
        const names = selectedNamesString.split(', ');
        names.forEach(name => usedNames.add(name.trim()));
      }
    }
    
    Logger.log('Retrieved used names: ' + Array.from(usedNames).length + ' unique names');
    
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        usedNames: Array.from(usedNames)
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    Logger.log('Error getting used names: ' + error.toString());
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: 'Failed to get used names: ' + error.toString(),
        usedNames: []
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Get room usage statistics from submissions
 */
function getRoomUsage() {
  try {
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = spreadsheet.getSheetByName(SHEET_NAME);
    
    if (!sheet) {
      return ContentService
        .createTextOutput(JSON.stringify({
          success: true,
          roomUsage: { 2: 0, 3: 0, 4: 0, 5: 0 }
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // Get all data from the sheet
    const data = sheet.getDataRange().getValues();
    const roomUsage = { 2: 0, 3: 0, 4: 0, 5: 0 };
    
    // Skip header row and count room sizes
    for (let i = 1; i < data.length; i++) {
      const roomSize = data[i][1]; // Column B contains room size
      if (roomSize && roomUsage.hasOwnProperty(roomSize)) {
        roomUsage[roomSize]++;
      }
    }
    
    Logger.log('Retrieved room usage: ' + JSON.stringify(roomUsage));
    
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        roomUsage: roomUsage
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    Logger.log('Error getting room usage: ' + error.toString());
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: 'Failed to get room usage: ' + error.toString(),
        roomUsage: { 2: 0, 3: 0, 4: 0, 5: 0 }
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Helper function to set up CORS headers (if needed)
 */
function setCorsHeaders() {
  // Note: Google Apps Script automatically handles CORS for web apps
  // This function is here for reference if manual CORS handling is needed
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400'
  };
}

/**
 * Test function to verify the script setup
 * Run this function manually to test your configuration
 */
function testSetup() {
  try {
    // Test spreadsheet access
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    Logger.log('✅ Spreadsheet access successful: ' + spreadsheet.getName());
    
    // Test sheet creation/access
    let sheet = spreadsheet.getSheetByName(SHEET_NAME);
    if (!sheet) {
      sheet = spreadsheet.insertSheet(SHEET_NAME);
      Logger.log('✅ Created new sheet: ' + SHEET_NAME);
    } else {
      Logger.log('✅ Sheet access successful: ' + SHEET_NAME);
    }
    
    // Test adding a sample submission
    const testData = {
      roomSize: 3,
      selectedNames: ['Test User 1', 'Test User 2', 'Test User 3'],
      timestamp: new Date().toISOString(),
      submissionId: 'test_' + Date.now()
    };
    
    const result = addSubmission(testData);
    Logger.log('✅ Test submission result: ' + result.getContent());
    
    // Test getting room usage
    const roomUsageResult = getRoomUsage();
    Logger.log('✅ Room usage result: ' + roomUsageResult.getContent());
    
    Logger.log('🎉 All tests passed! The setup is working correctly.');
    
  } catch (error) {
    Logger.log('❌ Test failed: ' + error.toString());
    Logger.log('Please check your SPREADSHEET_ID and permissions.');
  }
}
