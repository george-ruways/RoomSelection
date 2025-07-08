// Room Selection App with Admin Dashboard
console.log('🚀 Room Selection App Starting...');

// Configuration
const CONFIG = {
    USE_GOOGLE_SHEETS: true,
    GOOGLE_SHEETS_URL: 'https://script.google.com/macros/s/AKfycbzmomiyYY0vDZ41Vp4OJXPYA201tzjKF0F_TwnMAcix8GNU3xOSKpbFSvznbM6MlqUc/exec',
    ADMIN_PASSWORD: 'S7s@210704'
};

// Application state
let appState = {
    currentScreen: 'roomSizeScreen',
    selectedRoomSize: null,
    selectedNames: [],
    availableNames: [],
    usedNames: [],
    roomAvailability: { 2: 0, 3: 0, 4: 0, 5: 0 },
    submissions: [],
    isAdmin: false,
    currentTab: 'settings'
};

// DOM Elements
let elements = {};

// Generate unique ID
function generateUniqueId() {
    return 'RSA_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 9);
}

// Initialize application
async function init() {
    console.log('🔧 Initializing app...');
    
    try {
        // Get DOM elements
        elements = {
            roomSizeScreen: document.getElementById('roomSizeScreen'),
            nameSelectionScreen: document.getElementById('nameSelectionScreen'),
            successScreen: document.getElementById('successScreen'),
            adminScreen: document.getElementById('adminScreen'),
            adminBtn: document.getElementById('adminBtn'),
            roomButtons: document.querySelectorAll('.room-btn'),
            selectionTitle: document.getElementById('selectionTitle'),
            selectionCount: document.getElementById('selectionCount'),
            namesGrid: document.getElementById('namesGrid'),
            backBtn: document.getElementById('backBtn'),
            submitBtn: document.getElementById('submitBtn'),
            successMessage: document.getElementById('successMessage'),
            reservationId: document.getElementById('reservationId'),
            newSelectionBtn: document.getElementById('newSelectionBtn'),
            exitAdminBtn: document.getElementById('exitAdminBtn'),
            tabButtons: document.querySelectorAll('.tab-btn'),
            settingsTab: document.getElementById('settingsTab'),
            submissionsTab: document.getElementById('submissionsTab'),
            namesTab: document.getElementById('namesTab'),
            rooms2Input: document.getElementById('rooms-2'),
            rooms3Input: document.getElementById('rooms-3'),
            rooms4Input: document.getElementById('rooms-4'),
            rooms5Input: document.getElementById('rooms-5'),
            refreshDataBtn: document.getElementById('refreshDataBtn'),
            resetAllBtn: document.getElementById('resetAllBtn'),
            downloadBtn: document.getElementById('downloadBtn'),
            submissionsTable: document.getElementById('submissionsTable'),
            uploadNamesBtn: document.getElementById('uploadNamesBtn'),
            namesFileInput: document.getElementById('namesFileInput'),
            currentNamesList: document.getElementById('currentNamesList'),
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
            available2: document.getElementById('available-2'),
            available3: document.getElementById('available-3'),
            available4: document.getElementById('available-4'),
            available5: document.getElementById('available-5')
        };
        
        setupEventListeners();
        await loadInitialData();
        console.log('✅ App initialized successfully');
        
    } catch (error) {
        console.error('❌ Initialization failed:', error);
        showError('Failed to initialize the application. Please refresh the page.');
    }
}

// Set up event listeners
function setupEventListeners() {
    elements.adminBtn?.addEventListener('click', showAdminLogin);
    elements.exitAdminBtn?.addEventListener('click', exitAdmin);
    
    elements.roomButtons.forEach(button => {
        button.addEventListener('click', handleRoomSizeSelection);
    });
    
    elements.backBtn?.addEventListener('click', goBackToRoomSelection);
    elements.newSelectionBtn?.addEventListener('click', resetToRoomSelection);
    elements.submitBtn?.addEventListener('click', handleSubmitSelection);
    
    elements.tabButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const tab = e.target.dataset.tab;
            if (tab) switchAdminTab(tab);
        });
    });
    
    elements.refreshDataBtn?.addEventListener('click', refreshAllData);
    elements.resetAllBtn?.addEventListener('click', confirmResetAll);
    elements.downloadBtn?.addEventListener('click', downloadSubmissions);
    elements.uploadNamesBtn?.addEventListener('click', () => elements.namesFileInput?.click());
    elements.namesFileInput?.addEventListener('change', handleNamesFileUpload);
    
    elements.confirmYes?.addEventListener('click', confirmSubmission);
    elements.confirmNo?.addEventListener('click', closeConfirmationModal);
    elements.loginBtn?.addEventListener('click', handleAdminLogin);
    elements.cancelLoginBtn?.addEventListener('click', closeAdminLoginModal);
    elements.confirmDelete?.addEventListener('click', handleConfirmDelete);
    elements.cancelDelete?.addEventListener('click', closeDeleteModal);
    elements.errorOk?.addEventListener('click', closeErrorModal);
    elements.successOk?.addEventListener('click', closeSuccessModal);
    
    elements.adminPassword?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleAdminLogin();
    });
    
    [elements.confirmationModal, elements.adminLoginModal, elements.deleteModal, 
     elements.errorModal, elements.successModal].forEach(modal => {
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) modal.classList.remove('show');
            });
        }
    });
}

// Load initial data from Google Sheets
async function loadInitialData() {
    console.log('📊 Loading initial data...');
    showLoading('Loading application data...');
    
    try {
        const response = await fetch(`${CONFIG.GOOGLE_SHEETS_URL}?action=getAllData`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
            if (data.roomLimits) appState.roomAvailability = { ...data.roomLimits };
            if (data.availableNames) appState.availableNames = [...data.availableNames];
            if (data.usedNames) appState.usedNames = [...data.usedNames];
            if (data.submissions) appState.submissions = [...data.submissions];
            console.log('✅ Data loaded successfully');
        } else {
            throw new Error(data.error || 'Failed to load data');
        }
        
    } catch (error) {
        console.error('❌ Error loading data:', error);
        showError('Failed to load application data. Please check your internet connection and try again.');
        return;
    } finally {
        hideLoading();
    }
    
    updateRoomAvailabilityDisplay();
    if (appState.isAdmin) updateAdminDashboard();
}

// Handle room size selection
function handleRoomSizeSelection(event) {
    const roomSize = parseInt(event.currentTarget.dataset.size);
    console.log(`🏠 Room size selected: ${roomSize}`);
    
    if (appState.roomAvailability[roomSize] <= 0) {
        showError(`Sorry, no rooms available for ${roomSize} people.`);
        return;
    }
    
    const availableForSelection = appState.availableNames.filter(name => !appState.usedNames.includes(name));
    if (availableForSelection.length < roomSize) {
        showError(`Sorry, only ${availableForSelection.length} people available. Cannot select ${roomSize} people.`);
        return;
    }
    
    appState.selectedRoomSize = roomSize;
    appState.selectedNames = [];
    showNameSelection();
}

// Show name selection screen
function showNameSelection() {
    console.log(`👥 Showing name selection for ${appState.selectedRoomSize} people`);
    
    elements.selectionTitle.textContent = `Select ${appState.selectedRoomSize} People`;
    updateSelectionCounter();
    generateNamesGrid();
    showScreen('nameSelectionScreen');
}

// Generate names grid
function generateNamesGrid() {
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
        
        if (appState.usedNames.includes(name)) {
            button.classList.add('used');
            button.disabled = true;
            button.title = 'This person is already assigned to a room';
        } else {
            button.addEventListener('click', () => toggleNameSelection(name, button));
        }
        
        elements.namesGrid.appendChild(button);
    });
}

// Toggle name selection
function toggleNameSelection(name, button) {
    if (appState.selectedNames.includes(name)) {
        appState.selectedNames = appState.selectedNames.filter(n => n !== name);
        button.classList.remove('selected');
    } else {
        if (appState.selectedNames.length >= appState.selectedRoomSize) {
            showError(`You can only select ${appState.selectedRoomSize} people for this room size.`);
            return;
        }
        appState.selectedNames.push(name);
        button.classList.add('selected');
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
    
    if (count === total) {
        elements.selectionCount.style.color = '#28a745';
        elements.selectionCount.style.fontWeight = 'bold';
    } else {
        elements.selectionCount.style.color = '#666';
        elements.selectionCount.style.fontWeight = 'normal';
    }
}

// Update submit button
function updateSubmitButton() {
    if (!elements.submitBtn) return;
    
    const canSubmit = appState.selectedNames.length === appState.selectedRoomSize;
    elements.submitBtn.disabled = !canSubmit;
    
    if (canSubmit) {
        elements.submitBtn.textContent = 'Submit Selection';
    } else {
        elements.submitBtn.textContent = `Select ${appState.selectedRoomSize - appState.selectedNames.length} more`;
    }
}

// Handle submit selection
function handleSubmitSelection() {
    if (appState.selectedNames.length !== appState.selectedRoomSize) {
        showError('Please select the exact number of people required.');
        return;
    }
    
    const namesList = appState.selectedNames.join(', ');
    elements.confirmationText.textContent = 
        `Reserve a room for ${appState.selectedRoomSize} people with: ${namesList}?`;
    
    showModal('confirmationModal');
}

// Confirm submission
async function confirmSubmission() {
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
        
        const response = await fetch(CONFIG.GOOGLE_SHEETS_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(submissionData)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.success) {
            appState.usedNames.push(...appState.selectedNames);
            appState.roomAvailability[appState.selectedRoomSize]--;
            
            appState.submissions.push({
                id: submissionId,
                roomSize: appState.selectedRoomSize,
                names: appState.selectedNames,
                timestamp: timestamp
            });
            
            showSuccess(submissionId);
            updateRoomAvailabilityDisplay();
            
            if (appState.isAdmin) updateAdminDashboard();
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
    const namesList = appState.selectedNames.join(', ');
    elements.successMessage.textContent = 
        `Room for ${appState.selectedRoomSize} people reserved for: ${namesList}`;
    
    elements.reservationId.textContent = `Reservation ID: ${submissionId}`;
    showScreen('successScreen');
}

// Admin functions
function showAdminLogin() {
    showModal('adminLoginModal');
    elements.adminPassword.value = '';
    elements.adminPassword.focus();
}

function handleAdminLogin() {
    const password = elements.adminPassword.value;
    
    if (password === CONFIG.ADMIN_PASSWORD) {
        appState.isAdmin = true;
        closeAdminLoginModal();
        showAdminDashboard();
        elements.adminPassword.value = '';
    } else {
        showError('Invalid admin password.');
        elements.adminPassword.value = '';
        elements.adminPassword.focus();
    }
}

function showAdminDashboard() {
    showScreen('adminScreen');
    updateAdminDashboard();
}

function exitAdmin() {
    appState.isAdmin = false;
    showScreen('roomSizeScreen');
}

function switchAdminTab(tabName) {
    appState.currentTab = tabName;
    
    elements.tabButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.tab === tabName) btn.classList.add('active');
    });
    
    [elements.settingsTab, elements.submissionsTab, elements.namesTab].forEach(tab => {
        if (tab) tab.classList.remove('active');
    });
    
    const activeTab = document.getElementById(`${tabName}Tab`);
    if (activeTab) activeTab.classList.add('active');
    
    if (tabName === 'submissions') updateSubmissionsTable();
    else if (tabName === 'names') updateNamesList();
}

function updateAdminDashboard() {
    Object.entries(appState.roomAvailability).forEach(([size, count]) => {
        const input = document.getElementById(`rooms-${size}`);
        if (input) input.value = count;
    });
    
    if (appState.currentTab === 'submissions') updateSubmissionsTable();
    else if (appState.currentTab === 'names') updateNamesList();
}

function updateSubmissionsTable() {
    if (!elements.submissionsTable) return;
    
    elements.submissionsTable.innerHTML = '';
    
    if (appState.submissions.length === 0) {
        elements.submissionsTable.innerHTML = '<p style="text-align: center; color: #666;">No submissions yet.</p>';
        return;
    }
    
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
    showLoading('Updating room availability...');
    
    try {
        const response = await fetch(CONFIG.GOOGLE_SHEETS_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'updateRoomLimit',
                roomSize: roomSize,
                limit: newLimit
            })
        });
        
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
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
        input.value = appState.roomAvailability[roomSize];
    } finally {
        hideLoading();
    }
}

async function refreshAllData() {
    showLoading('Refreshing data...');
    
    try {
        await loadInitialData();
        showSuccessMessage('Data refreshed successfully');
    } catch (error) {
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
    showLoading('Resetting all data...');
    
    try {
        const response = await fetch(CONFIG.GOOGLE_SHEETS_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'resetAllData' })
        });
        
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const result = await response.json();
        
        if (result.success) {
            appState.submissions = [];
            appState.usedNames = [];
            appState.roomAvailability = { 2: 0, 3: 0, 4: 0, 5: 0 };
            
            updateRoomAvailabilityDisplay();
            updateAdminDashboard();
            showSuccessMessage('All data has been reset successfully');
        } else {
            throw new Error(result.error || 'Failed to reset data');
        }
        
    } catch (error) {
        showError('Failed to reset data. Please try again.');
    } finally {
        hideLoading();
    }
}

async function downloadSubmissions() {
    if (appState.submissions.length === 0) {
        showError('No submissions to download.');
        return;
    }
    
    showLoading('Preparing download...');
    
    try {
        const response = await fetch(`${CONFIG.GOOGLE_SHEETS_URL}?action=downloadSubmissions`);
        
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const blob = await response.blob();
        
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
        showError('Failed to download submissions. Please try again.');
    } finally {
        hideLoading();
    }
}

function handleNamesFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    showError('Names upload feature requires backend implementation. Please manually update the Google Sheets with available names.');
    event.target.value = '';
}

function confirmDeleteSubmission(submissionId) {
    const submission = appState.submissions.find(s => s.id === submissionId);
    if (!submission) return;
    
    elements.deleteText.textContent = `Are you sure you want to delete the reservation for ${submission.roomSize} people (${submission.names.join(', ')})?`;
    elements.confirmDelete.onclick = () => deleteSubmission(submissionId);
    
    showModal('deleteModal');
}

async function deleteSubmission(submissionId) {
    closeDeleteModal();
    showLoading('Deleting submission...');
    
    try {
        const response = await fetch(CONFIG.GOOGLE_SHEETS_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'deleteSubmission',
                id: submissionId
            })
        });
        
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const result = await response.json();
        
        if (result.success) {
            const submissionIndex = appState.submissions.findIndex(s => s.id === submissionId);
            if (submissionIndex > -1) {
                const submission = appState.submissions[submissionIndex];
                
                submission.names.forEach(name => {
                    const nameIndex = appState.usedNames.indexOf(name);
                    if (nameIndex > -1) appState.usedNames.splice(nameIndex, 1);
                });
                
                appState.roomAvailability[submission.roomSize]++;
                appState.submissions.splice(submissionIndex, 1);
            }
            
            updateRoomAvailabilityDisplay();
            updateAdminDashboard();
            showSuccessMessage('Submission deleted successfully');
        } else {
            throw new Error(result.error || 'Failed to delete submission');
        }
        
    } catch (error) {
        showError('Failed to delete submission. Please try again.');
    } finally {
        hideLoading();
    }
}

function handleConfirmDelete() {
    console.log('Confirm delete clicked');
}

// Navigation
function goBackToRoomSelection() {
    resetSelection();
    showScreen('roomSizeScreen');
}

function resetToRoomSelection() {
    resetSelection();
    showScreen('roomSizeScreen');
}

function resetSelection() {
    appState.selectedRoomSize = null;
    appState.selectedNames = [];
}

// Screen management
function showScreen(screenId) {
    [elements.roomSizeScreen, elements.nameSelectionScreen, elements.successScreen, elements.adminScreen].forEach(screen => {
        if (screen) screen.classList.remove('active');
    });
    
    const targetScreen = elements[screenId];
    if (targetScreen) {
        targetScreen.classList.add('active');
        appState.currentScreen = screenId;
    }
}

// Modal management
function showModal(modalId) {
    const modal = elements[modalId];
    if (modal) modal.classList.add('show');
}

function closeConfirmationModal() {
    elements.confirmationModal?.classList.remove('show');
}

function closeAdminLoginModal() {
    elements.adminLoginModal?.classList.remove('show');
}

function closeDeleteModal() {
    elements.deleteModal?.classList.remove('show');
}

function closeErrorModal() {
    elements.errorModal?.classList.remove('show');
}

function closeSuccessModal() {
    elements.successModal?.classList.remove('show');
}

// Loading and messages
function showLoading(message = 'Loading...') {
    if (elements.loadingOverlay && elements.loadingText) {
        elements.loadingText.textContent = message;
        elements.loadingOverlay.classList.add('show');
    }
}

function hideLoading() {
    elements.loadingOverlay?.classList.remove('show');
}

function showError(message) {
    console.error('❌ Error:', message);
    if (elements.errorText && elements.errorModal) {
        elements.errorText.textContent = message;
        showModal('errorModal');
    }
}

function showSuccessMessage(message) {
    if (elements.successModalText && elements.successModal) {
        elements.successModalText.textContent = message;
        showModal('successModal');
    }
}

// Update room availability display
function updateRoomAvailabilityDisplay() {
    Object.entries(appState.roomAvailability).forEach(([size, available]) => {
        const element = elements[`available${size}`];
        if (element) {
            element.textContent = `Available: ${available}`;
            
            const button = document.querySelector(`[data-size="${size}"]`);
            if (button) {
                button.disabled = available <= 0;
                button.style.opacity = available <= 0 ? '0.6' : '1';
                button.style.cursor = available <= 0 ? 'not-allowed' : 'pointer';
            }
        }
    });
}

// Initialize
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

// Export for debugging
window.roomSelectionApp = {
    appState,
    elements,
    CONFIG,
    showError,
    showSuccessMessage,
    resetToRoomSelection,
    updateRoomLimit
};

console.log('📱 Room Selection App loaded');
