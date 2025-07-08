// Room Selection App with Admin Dashboard
console.log('🚀 Room Selection App with Admin Dashboard Starting...');

// Configuration
const CONFIG = {
    // Google Sheets integration - ALWAYS enabled for production
    USE_GOOGLE_SHEETS: true,
    GOOGLE_SHEETS_URL: 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec',
    
    // Admin password
    ADMIN_PASSWORD: 'S7s@210704',
    
    // Default room limits (will be overridden by Google Sheets data)
    DEFAULT_ROOM_LIMITS: {
        2: 0,
        3: 0,
        4: 0,
        5: 0
    }
};

// Application state
let appState = {
    currentScreen: 'roomSizeScreen',
    selectedRoomSize: null,
    selectedNames: [],
    availableNames: [],
    usedNames: [],
    roomAvailability: { ...CONFIG.DEFAULT_ROOM_LIMITS },
    submissions: [],
    isAdmin: false,
    currentTab: 'settings'
};

// DOM Elements
let elements = {};

// Utility function to generate unique ID
function generateUniqueId() {
    return 'RSA_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 9);
}

// Initialize the application
async function init() {
    console.log('🔧 Initializing app...');
    
    try {
        // Get all DOM elements
        elements = {
            // Screens
            roomSizeScreen: document.getElementById('roomSizeScreen'),
            nameSelectionScreen: document.getElementById('nameSelectionScreen'),
            successScreen: document.getElementById('successScreen'),
            adminScreen: document.getElementById('adminScreen'),
            
            // Main UI elements
            adminBtn: document.getElementById('adminBtn'),
            roomButtons: document.querySelectorAll('.room-btn'),
            selectionTitle: document.getElementById('selectionTitle'),
            selectionCount: document.getElementById('selectionCount'),
            namesGrid: document.getElementById('namesGrid'),
            backBtn: document.getElementById('backBtn'),
            submitBtn: document.getElementById('submitBtn'),
            
            // Success screen
            successMessage: document.getElementById('successMessage'),
            reservationId: document.getElementById('reservationId'),
            newSelectionBtn: document.getElementById('newSelectionBtn'),
            
            // Admin elements
            exitAdminBtn: document.getElementById('exitAdminBtn'),
            tabButtons: document.querySelectorAll('.tab-btn'),
            settingsTab: document.getElementById('settingsTab'),
            submissionsTab: document.getElementById('submissionsTab'),
            namesTab: document.getElementById('namesTab'),
            
            // Settings
            rooms2Input: document.getElementById('rooms-2'),
            rooms3Input: document.getElementById('rooms-3'),
            rooms4Input: document.getElementById('rooms-4'),
            rooms5Input: document.getElementById('rooms-5'),
            refreshDataBtn: document.getElementById('refreshDataBtn'),
            resetAllBtn: document.getElementById('resetAllBtn'),
            
            // Submissions
            downloadBtn: document.getElementById('downloadBtn'),
            submissionsTable: document.getElementById('submissionsTable'),
            
            // Names management
            uploadNamesBtn: document.getElementById('uploadNamesBtn'),
            namesFileInput: document.getElementById('namesFileInput'),
            currentNamesList: document.getElementById('currentNamesList'),
            
            // Modals and overlays
            loadingOverlay: document.getElementById('loadingOverlay'),
            loadingText: document.getElementById('loadingText'),
            confirmationModal: document.getElementById('confirmationModal'),
            confirmationText: document.getElementById('confirmationText'),
            confirmYes: document.getElementById('confirmYes'),
            confirmNo: document.getElementById('confirmNo'),
            adminLoginModal: document.getElementById('adminLoginModal'),
            adminPassword: document.getElementById('adminPassword'),
            loginBtn: document.getElementById('loginBtn'),
            cancelLoginBtn: document.getElementById('cancelLoginBtn'),
            deleteModal: document.getElementById('deleteModal'),
            deleteText: document.getElementById('deleteText'),
            confirmDelete: document.getElementById('confirmDelete'),
            cancelDelete: document.getElementById('cancelDelete'),
            errorModal: document.getElementById('errorModal'),
            errorText: document.getElementById('errorText'),
            errorOk: document.getElementById('errorOk'),
            successModal: document.getElementById('successModal'),
            successModalText: document.getElementById('successModalText'),
            successOk: document.getElementById('successOk'),
            
            // Room availability displays
            available2: document.getElementById('available-2'),
            available3: document.getElementById('available-3'),
            available4: document.getElementById('available-4'),
            available5: document.getElementById('available-5')
        };
        
        // Verify critical elements exist
        const criticalElements = [
            'roomSizeScreen', 'nameSelectionScreen', 'successScreen', 'adminScreen',
            'adminBtn', 'submitBtn', 'loadingOverlay', 'errorModal'
        ];
        
        const missingElements = criticalElements.filter(key => !elements[key]);
        if (missingElements.length > 0) {
            throw new Error(`Missing critical DOM elements: ${missingElements.join(', ')}`);
        }
        
        console.log('✅ All DOM elements found');
        
        // Set up event listeners
        setupEventListeners();
        
        // Load initial data from Google Sheets
        await loadInitialData();
        
        console.log('✅ App initialized successfully');
        
    } catch (error) {
        console.error('❌ Initialization failed:', error);
        showError('Failed to initialize the application. Please refresh the page.');
    }
}

// Set up all event listeners
function setupEventListeners() {
    console.log('🎯 Setting up event listeners...');
    
    // Admin access
    elements.adminBtn?.addEventListener('click', showAdminLogin);
    elements.exitAdminBtn?.addEventListener('click', exitAdmin);
    
    // Room size selection
    elements.roomButtons.forEach(button => {
        button.addEventListener('click', handleRoomSizeSelection);
    });
    
    // Navigation
    elements.backBtn?.addEventListener('click', goBackToRoomSelection);
    elements.newSelectionBtn?.addEventListener('click', resetToRoomSelection);
    
    // Submission
    elements.submitBtn?.addEventListener('click', handleSubmitSelection);
    
    // Admin tabs
    elements.tabButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const tab = e.target.dataset.tab;
            if (tab) switchAdminTab(tab);
        });
    });
    
    // Admin actions
    elements.refreshDataBtn?.addEventListener('click', refreshAllData);
    elements.resetAllBtn?.addEventListener('click', confirmResetAll);
    elements.downloadBtn?.addEventListener('click', downloadSubmissions);
    elements.uploadNamesBtn?.addEventListener('click', () => elements.namesFileInput?.click());
    elements.namesFileInput?.addEventListener('change', handleNamesFileUpload);
    
    // Modal controls
    elements.confirmYes?.addEventListener('click', confirmSubmission);
    elements.confirmNo?.addEventListener('click', closeConfirmationModal);
    elements.loginBtn?.addEventListener('click', handleAdminLogin);
    elements.cancelLoginBtn?.addEventListener('click', closeAdminLoginModal);
    elements.confirmDelete?.addEventListener('click', handleConfirmDelete);
    elements.cancelDelete?.addEventListener('click', closeDeleteModal);
    elements.errorOk?.addEventListener('click', closeErrorModal);
    elements.successOk?.addEventListener('click', closeSuccessModal);
    
    // Enter key for password
    elements.adminPassword?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleAdminLogin();
        }
    });
    
    // Close modals when clicking outside
    [elements.confirmationModal, elements.adminLoginModal, elements.deleteModal, 
     elements.errorModal, elements.successModal].forEach(modal => {
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('show');
                }
            });
        }
    });
    
    console.log('✅ Event listeners set up');
}

// Load initial data from Google Sheets
async function loadInitialData() {
    console.log('📊 Loading initial data from Google Sheets...');
    
    showLoading('Loading application data...');
    
    try {
        const response = await fetch(`${CONFIG.GOOGLE_SHEETS_URL}?action=getAllData`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('📊 Received data:', data);
        
        if (data.success) {
            // Update room availability
            if (data.roomLimits) {
                appState.roomAvailability = { ...data.roomLimits };
            }
            
            // Update available names
            if (data.availableNames && Array.isArray(data.availableNames)) {
                appState.availableNames = [...data.availableNames];
            }
            
            // Update used names
            if (data.usedNames && Array.isArray(data.usedNames)) {
                appState.usedNames = [...data.usedNames];
            }
            
            // Update submissions
            if (data.submissions && Array.isArray(data.submissions)) {
                appState.submissions = [...data.submissions];
            }
            
            console.log('✅ Data loaded successfully');
        } else {
            throw new Error(data.error || 'Failed to load data');
        }
        
    } catch (error) {
        console.error('❌ Error loading initial data:', error);
        showError('Failed to load application data. Please check your internet connection and try again.');
        return;
    } finally {
        hideLoading();
    }
    
    // Update UI with loaded data
    updateRoomAvailabilityDisplay();
    
    if (appState.isAdmin) {
        updateAdminDashboard();
    }
}

// Handle room size selection
function handleRoomSizeSelection(event) {
    const roomSize = parseInt(event.currentTarget.dataset.size);
    console.log(`🏠 Room size selected: ${roomSize}`);
    
    // Check if room is available
    if (appState.roomAvailability[roomSize] <= 0) {
        showError(`Sorry, no rooms available for ${roomSize} people.`);
        return;
    }
    
    // Check if enough names are available
    const availableForSelection = appState.availableNames.filter(name => !appState.usedNames.includes(name));
    if (availableForSelection.length < roomSize) {
        showError(`Sorry, only ${availableForSelection.length} people available. Cannot select ${roomSize} people.`);
        return;
    }
    
    // Set selected room size
    appState.selectedRoomSize = roomSize;
    appState.selectedNames = [];
    
    // Update UI and show name selection
    showNameSelection();
}

// Show name selection screen
function showNameSelection() {
    console.log(`👥 Showing name selection for ${appState.selectedRoomSize} people`);
    
    // Update title and counter
    elements.selectionTitle.textContent = `Select ${appState.selectedRoomSize} People`;
    updateSelectionCounter();
    
    // Generate names grid
    generateNamesGrid();
    
    // Switch to name selection screen
    showScreen('nameSelectionScreen');
}

// Generate the names grid
function generateNamesGrid() {
    console.log('📝 Generating names grid...');
    
    if (!elements.namesGrid) return;
    
    elements.namesGrid.innerHTML = '';
    
    if (appState.availableNames.length === 0) {
        elements.namesGrid.innerHTML = '<p style="text-align: center; color: #666; grid-column: 1/-1;">No names available. Please contact admin.</p>';
        return;
    }
    
    appState.availableNames.forEach(name => {
        const button = document.createElement('button');
        button.className = 'name-btn';
        button.textContent = name;
        button.dataset.name = name;
        
        // Check if name is already used
        if (appState.usedNames.includes(name)) {
            button.classList.add('used');
            button.disabled = true;
            button.title = 'This person is already assigned to a room';
        } else {
            button.addEventListener('click', () => toggleNameSelection(name, button));
        }
        
        elements.namesGrid.appendChild(button);
    });
    
    console.log(`✅ Generated ${appState.availableNames.length} name buttons`);
}

// Toggle name selection
function toggleNameSelection(name, button) {
    console.log(`🔄 Toggling selection for: ${name}`);
    
    if (appState.selectedNames.includes(name)) {
        // Remove from selection
        appState.selectedNames = appState.selectedNames.filter(n => n !== name);
        button.classList.remove('selected');
        console.log(`➖ Removed ${name} from selection`);
    } else {
        // Check if we can add more names
        if (appState.selectedNames.length >= appState.selectedRoomSize) {
            showError(`You can only select ${appState.selectedRoomSize} people for this room size.`);
            return;
        }
        
        // Add to selection
        appState.selectedNames.push(name);
        button.classList.add('selected');
        console.log(`➕ Added ${name} to selection`);
    }
    
    updateSelectionCounter();
    updateSubmitButton();
}

// Update selection counter
function updateSelectionCounter() {
    if (!elements.selectionCount) return;
    
    const count = appState.selectedNames.length;
    const total = appState.selectedRoomSize;
    elements.selectionCount.textContent = `Selected: ${count}/${total}`;
    
    // Update styling based on completion
    if (count === total) {
        elements.selectionCount.style.color = '#28a745';
        elements.selectionCount.style.fontWeight = 'bold';
    } else {
        elements.selectionCount.style.color = '#666';
        elements.selectionCount.style.fontWeight = 'normal';
    }
}

// Update submit button state
function updateSubmitButton() {
    if (!elements.submitBtn) return;
    
    const canSubmit = appState.selectedNames.length === appState.selectedRoomSize;
    elements.submitBtn.disabled = !canSubmit;
    
    if (canSubmit) {
        elements.submitBtn.textContent = 'Submit Selection';
        console.log('✅ Submit button enabled');
    } else {
        elements.submitBtn.textContent = `Select ${appState.selectedRoomSize - appState.selectedNames.length} more`;
    }
}

// Handle submit button click
function handleSubmitSelection() {
    if (appState.selectedNames.length !== appState.selectedRoomSize) {
        showError('Please select the exact number of people required.');
        return;
    }
    
    console.log('📋 Showing confirmation dialog...');
    
    // Show confirmation modal
    const namesList = appState.selectedNames.join(', ');
    elements.confirmationText.textContent = 
        `Reserve a room for ${appState.selectedRoomSize} people with: ${namesList}?`;
    
    showModal('confirmationModal');
}

// Confirm and submit the selection
async function confirmSubmission() {
    console.log('✅ Submission confirmed, processing...');
    
    closeConfirmationModal();
    showLoading('Submitting your selection...');
    
    try {
        const submissionId = generateUniqueId();
        const timestamp = new Date().toISOString();
        
        const submissionData = {
            action: 'addSubmission',
            id: submissionId,
            roomSize: appState.selectedRoomSize,
            names: appState.selectedNames,
            timestamp: timestamp
        };
        
        console.log('📤 Sending submission:', submissionData);
        
        const response = await fetch(CONFIG.GOOGLE_SHEETS_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(submissionData)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('📊 Submission response:', result);
        
        if (result.success) {
            // Update local state
            appState.usedNames.push(...appState.selectedNames);
            appState.roomAvailability[appState.selectedRoomSize]--;
            
            // Add to submissions
            appState.submissions.push({
                id: submissionId,
                roomSize: appState.selectedRoomSize,
                names: appState.selectedNames,
                timestamp: timestamp
            });
            
            // Show success
            showSuccess(submissionId);
            updateRoomAvailabilityDisplay();
            
            if (appState.isAdmin) {
                updateAdminDashboard();
            }
        } else {
            throw new Error(result.error || 'Submission failed');
        }
        
    } catch (error) {
        console.error('❌ Submission error:', error);
        showError('Failed to submit your selection. Please check your internet connection and try again.');
    } finally {
        hideLoading();
    }
}

// Show success screen
function showSuccess(submissionId) {
    console.log('🎉 Showing success screen');
    
    const namesList = appState.selectedNames.join(', ');
    elements.successMessage.textContent = 
        `Room for ${appState.selectedRoomSize} people reserved for: ${namesList}`;
    
    elements.reservationId.textContent = `Reservation ID: ${submissionId}`;
    
    showScreen('successScreen');
}

// Admin functionality
function showAdminLogin() {
    console.log('🔐 Showing admin login');
    showModal('adminLoginModal');
    elements.adminPassword.value = '';
    elements.adminPassword.focus();
}

function handleAdminLogin() {
    const password = elements.adminPassword.value;
    
    if (password === CONFIG.ADMIN_PASSWORD) {
        console.log('✅ Admin login successful');
        appState.isAdmin = true;
        closeAdminLoginModal();
        showAdminDashboard();
        elements.adminPassword.value = '';
    } else {
        console.log('❌ Admin login failed');
        showError('Invalid admin password.');
        elements.adminPassword.value = '';
        elements.adminPassword.focus();
    }
}

function showAdminDashboard() {
    console.log('🛠️ Showing admin dashboard');
    showScreen('adminScreen');
    updateAdminDashboard();
}

function exitAdmin() {
    console.log('🚪 Exiting admin mode');
    appState.isAdmin = false;
    showScreen('roomSizeScreen');
}

function switchAdminTab(tabName) {
    console.log(`📋 Switching to admin tab: ${tabName}`);
    
    appState.currentTab = tabName;
    
    // Update tab buttons
    elements.tabButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.tab === tabName) {
            btn.classList.add('active');
        }
    });
    
    // Update tab content
    [elements.settingsTab, elements.submissionsTab, elements.namesTab].forEach(tab => {
        if (tab) tab.classList.remove('active');
    });
    
    const activeTab = document.getElementById(`${tabName}Tab`);
    if (activeTab) {
        activeTab.classList.add('active');
    }
    
    // Load tab-specific data
    if (tabName === 'submissions') {
        updateSubmissionsTable();
    } else if (tabName === 'names') {
        updateNamesList();
    }
}

function updateAdminDashboard() {
    console.log('🔄 Updating admin dashboard');
    
    // Update room settings inputs
    Object.entries(appState.roomAvailability).forEach(([size, count]) => {
        const input = document.getElementById(`rooms-${size}`);
        if (input) {
            input.value = count;
        }
    });
    
    // Update current tab
    if (appState.currentTab === 'submissions') {
        updateSubmissionsTable();
    } else if (appState.currentTab === 'names') {
        updateNamesList();
    }
}

function updateSubmissionsTable() {
    console.log('📊 Updating submissions table');
    
    if (!elements.submissionsTable) return;
    
    elements.submissionsTable.innerHTML = '';
    
    if (appState.submissions.length === 0) {
        elements.submissionsTable.innerHTML = '<p style="text-align: center; color: #666;">No submissions yet.</p>';
        return;
    }
    
    // Sort submissions by timestamp (newest first)
    const sortedSubmissions = [...appState.submissions].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    sortedSubmissions.forEach(submission => {
        const item = document.createElement('div');
        item.className = 'submission-item';
        
        const date = new Date(submission.timestamp).toLocaleString();
        const names = submission.names.join(', ');
        
        item.innerHTML = `
            <div class="submission-info">
                <h4>Room for ${submission.roomSize} people</h4>
                <p><strong>People:</strong> ${names}</p>
                <p><strong>Date:</strong> ${date}</p>
                <span class="submission-id">${submission.id}</span>
            </div>
            <button class="delete-btn" onclick="confirmDeleteSubmission('${submission.id}')">
                🗑️ Delete
            </button>
        `;
        
        elements.submissionsTable.appendChild(item);
    });
}

function updateNamesList() {
    console.log('📝 Updating names list');
    
    if (!elements.currentNamesList) return;
    
    elements.currentNamesList.innerHTML = '';
    
    if (appState.availableNames.length === 0) {
        elements.currentNamesList.innerHTML = '<p style="text-align: center; color: #666;">No names available. Upload names using the button above.</p>';
        return;
    }
    
    appState.availableNames.forEach(name => {
        const item = document.createElement('div');
        item.className = `name-item ${appState.usedNames.includes(name) ? 'used' : ''}`;
        
        const status = appState.usedNames.includes(name) ? 'used' : 'available';
        const statusText = status === 'used' ? 'Used' : 'Available';
        
        item.innerHTML = `
            <span>${name}</span>
            <span class="name-status ${status}">${statusText}</span>
        `;
        
        elements.currentNamesList.appendChild(item);
    });
}

// Admin actions
async function updateRoomLimit(roomSize) {
    const input = document.getElementById(`rooms-${roomSize}`);
    if (!input) return;
    
    const newLimit = parseInt(input.value) || 0;
    
    console.log(`🏠 Updating room limit for ${roomSize} people to ${newLimit}`);
    
    showLoading('Updating room availability...');
    
    try {
        const response = await fetch(CONFIG.GOOGLE_SHEETS_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'updateRoomLimit',
                roomSize: roomSize,
                limit: newLimit
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.success) {
            appState.roomAvailability[roomSize] = newLimit;
            updateRoomAvailabilityDisplay();
            showSuccessMessage(`Room limit for ${roomSize} people updated to ${newLimit}`);
        } else {
            throw new Error(result.error || 'Failed to update room limit');
        }
        
    } catch (error) {
        console.error('❌ Error updating room limit:', error);
        showError('Failed to update room limit. Please try again.');
        // Reset input to previous value
        input.value = appState.roomAvailability[roomSize];
    } finally {
        hideLoading();
    }
}

async function refreshAllData() {
    console.log('🔄 Refreshing all data');
    
    showLoading('Refreshing data...');
    
    try {
        await loadInitialData();
        showSuccessMessage('Data refreshed successfully');
    } catch (error) {
        console.error('❌ Error refreshing data:', error);
        showError('Failed to refresh data. Please try again.');
    } finally {
        hideLoading();
    }
}

function confirmResetAll() {
    if (confirm('⚠️ This will delete ALL submissions and reset room availability. Are you sure?')) {
        resetAllData();
    }
}

async function resetAllData() {
    console.log('🗑️ Resetting all data');
    
    showLoading('Resetting all data...');
    
    try {
        const response = await fetch(CONFIG.GOOGLE_SHEETS_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'resetAllData'
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.success) {
            // Reset local state
            appState.submissions = [];
            appState.usedNames = [];
            appState.roomAvailability = { ...CONFIG.DEFAULT_ROOM_LIMITS };
            
            updateRoomAvailabilityDisplay();
            updateAdminDashboard();
            showSuccessMessage('All data has been reset successfully');
        } else {
            throw new Error(result.error || 'Failed to reset data');
        }
        
    } catch (error) {
        console.error('❌ Error resetting data:', error);
        showError('Failed to reset data. Please try again.');
    } finally {
        hideLoading();
    }
}

async function downloadSubmissions() {
    console.log('📥 Downloading submissions');
    
    if (appState.submissions.length === 0) {
        showError('No submissions to download.');
        return;
    }
    
    showLoading('Preparing download...');
    
    try {
        const response = await fetch(`${CONFIG.GOOGLE_SHEETS_URL}?action=downloadSubmissions`, {
            method: 'GET'
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const blob = await response.blob();
        
        // Create download link
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `room_submissions_${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        showSuccessMessage('Submissions downloaded successfully');
        
    } catch (error) {
        console.error('❌ Error downloading submissions:', error);
        showError('Failed to download submissions. Please try again.');
    } finally {
        hideLoading();
    }
}

function handleNamesFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    console.log('📤 Uploading names file:', file.name);
    
    // For now, show a message that this feature needs backend implementation
    showError('Names upload feature requires backend implementation. Please manually update the Google Sheets with available names.');
    
    // Reset file input
    event.target.value = '';
}

function confirmDeleteSubmission(submissionId) {
    console.log(`🗑️ Confirming deletion of submission: ${submissionId}`);
    
    const submission = appState.submissions.find(s => s.id === submissionId);
    if (!submission) return;
    
    elements.deleteText.textContent = `Are you sure you want to delete the reservation for ${submission.roomSize} people (${submission.names.join(', ')})?`;
    elements.confirmDelete.onclick = () => deleteSubmission(submissionId);
    
    showModal('deleteModal');
}

async function deleteSubmission(submissionId) {
    console.log(`🗑️ Deleting submission: ${submissionId}`);
    
    closeDeleteModal();
    showLoading('Deleting submission...');
    
    try {
        const response = await fetch(CONFIG.GOOGLE_SHEETS_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'deleteSubmission',
                id: submissionId
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.success) {
            // Find and remove submission from local state
            const submissionIndex = appState.submissions.findIndex(s => s.id === submissionId);
            if (submissionIndex > -1) {
                const submission = appState.submissions[submissionIndex];
                
                // Remove used names
                submission.names.forEach(name => {
                    const nameIndex = appState.usedNames.indexOf(name);
                    if (nameIndex > -1) {
                        appState.usedNames.splice(nameIndex, 1);
                    }
                });
                
                // Increase room availability
                appState.roomAvailability[submission.roomSize]++;
                
                // Remove submission
                appState.submissions.splice(submissionIndex, 1);
            }
            
            updateRoomAvailabilityDisplay();
            updateAdminDashboard();
            showSuccessMessage('Submission deleted successfully');
        } else {
            throw new Error(result.error || 'Failed to delete submission');
        }
        
    } catch (error) {
        console.error('❌ Error deleting submission:', error);
        showError('Failed to delete submission. Please try again.');
    } finally {
        hideLoading();
    }
}

function handleConfirmDelete() {
    // This will be set dynamically by confirmDeleteSubmission
    console.log('Confirm delete clicked');
}

// Navigation functions
function goBackToRoomSelection() {
    console.log('🔙 Going back to room selection');
    resetSelection();
    showScreen('roomSizeScreen');
}

function resetToRoomSelection() {
    console.log('🔄 Resetting to room selection');
    resetSelection();
    showScreen('roomSizeScreen');
}

function resetSelection() {
    appState.selectedRoomSize = null;
    appState.selectedNames = [];
}

// Screen management
function showScreen(screenId) {
    console.log(`🖥️ Switching to screen: ${screenId}`);
    
    // Hide all screens
    [elements.roomSizeScreen, elements.nameSelectionScreen, elements.successScreen, elements.adminScreen].forEach(screen => {
        if (screen) screen.classList.remove('active');
    });
    
    // Show target screen
    const targetScreen = elements[screenId];
    if (targetScreen) {
        targetScreen.classList.add('active');
        appState.currentScreen = screenId;
    } else {
        console.error(`❌ Screen not found: ${screenId}`);
    }
}

// Modal management
function showModal(modalId) {
    const modal = elements[modalId];
    if (modal) {
        modal.classList.add('show');
        console.log(`📱 Modal shown: ${modalId}`);
    }
}

function closeConfirmationModal() {
    elements.confirmationModal?.classList.remove('show');
    console.log('📱 Confirmation modal closed');
}

function closeAdminLoginModal() {
    elements.adminLoginModal?.classList.remove('show');
    console.log('📱 Admin login modal closed');
}

function closeDeleteModal() {
    elements.deleteModal?.classList.remove('show');
    console.log('📱 Delete modal closed');
}

function closeErrorModal() {
    elements.errorModal?.classList.remove('show');
    console.log('📱 Error modal closed');
}

function closeSuccessModal() {
    elements.successModal?.classList.remove('show');
    console.log('📱 Success modal closed');
}

// Loading state
function showLoading(message = 'Loading...') {
    if (elements.loadingOverlay && elements.loadingText) {
        elements.loadingText.textContent = message;
        elements.loadingOverlay.classList.add('show');
        console.log(`⏳ Loading shown: ${message}`);
    }
}

function hideLoading() {
    elements.loadingOverlay?.classList.remove('show');
    console.log('⏳ Loading hidden');
}

// Error and success handling
function showError(message) {
    console.error('❌ Error:', message);
    if (elements.errorText && elements.errorModal) {
        elements.errorText.textContent = message;
        showModal('errorModal');
    }
}

function showSuccessMessage(message) {
    console.log('✅ Success:', message);
    if (elements.successModalText && elements.successModal) {
        elements.successModalText.textContent = message;
        showModal('successModal');
    }
}

// Update room availability display
function updateRoomAvailabilityDisplay() {
    console.log('🔄 Updating room availability display');
    
    Object.entries(appState.roomAvailability).forEach(([size, available]) => {
        const element = elements[`available${size}`];
        if (element) {
            element.textContent = `Available: ${available}`;
            
            // Update button state
            const button = document.querySelector(`[data-size="${size}"]`);
            if (button) {
                button.disabled = available <= 0;
                if (available <= 0) {
                    button.style.opacity = '0.6';
                    button.style.cursor = 'not-allowed';
                } else {
                    button.style.opacity = '1';
                    button.style.cursor = 'pointer';
                }
            }
        }
    });
}

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// Global error handler
window.addEventListener('error', (event) => {
    console.error('💥 Global error:', event.error);
    showError('An unexpected error occurred. Please refresh the page and try again.');
});

// Export for debugging and global access
window.roomSelectionApp = {
    appState,
    elements,
    CONFIG,
    showError,
    showSuccessMessage,
    resetToRoomSelection,
    updateRoomLimit
};

console.log('📱 Room Selection App with Admin Dashboard loaded');
