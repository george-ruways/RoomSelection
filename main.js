// Room Selection App - Main Logic
console.log('🚀 Room Selection App Starting...');

// Configuration
const CONFIG = {
    // Google Sheets integration (set to true when ready to use)
    USE_GOOGLE_SHEETS: true,
    GOOGLE_SHEETS_URL: 'https://script.google.com/macros/s/AKfycbzmomiyYY0vDZ41Vp4OJXPYA201tzjKF0F_TwnMAcix8GNU3xOSKpbFSvznbM6MlqUc/exec',
    
    // Room availability limits
    ROOM_LIMITS: {
        2: 5,
        3: 4,
        4: 3,
        5: 2
    }
};

// Available names for selection
const AVAILABLE_NAMES = [
    'Sarah Johnson', 'Michael Chen', 'Emily Rodriguez', 'David Kim', 'Jessica Wang',
    'Alex Thompson', 'Maria Garcia', 'James Wilson', 'Lisa Anderson', 'Robert Taylor',
    'Amanda Martinez', 'Kevin Lee', 'Rachel Brown', 'Christopher Davis', 'Nicole Miller',
    'Daniel Jackson', 'Ashley Wilson', 'Matthew Garcia', 'Stephanie Lee', 'Brandon Moore',
    'Lauren Taylor', 'Joshua Anderson', 'Megan Thomas', 'Tyler Johnson', 'Samantha White',
    'Andrew Clark', 'Brittany Lewis', 'Ryan Hall', 'Victoria Young', 'Nathan King',
    'Kayla Wright', 'Justin Scott', 'Hannah Green', 'Zachary Adams', 'Alexis Baker',
    'Ethan Nelson', 'Taylor Hill', 'Jordan Carter', 'Morgan Phillips', 'Cameron Evans'
];

// Application state
let appState = {
    currentScreen: 'roomSizeScreen',
    selectedRoomSize: null,
    selectedNames: [],
    usedNames: [],
    roomAvailability: { ...CONFIG.ROOM_LIMITS }
};

// DOM Elements - will be populated after DOM loads
let elements = {};

// Initialize the application
function init() {
    console.log('🔧 Initializing app...');
    
    // Get all DOM elements
    elements = {
        // Screens
        roomSizeScreen: document.getElementById('roomSizeScreen'),
        nameSelectionScreen: document.getElementById('nameSelectionScreen'),
        successScreen: document.getElementById('successScreen'),
        
        // Room size selection
        roomButtons: document.querySelectorAll('.room-btn'),
        
        // Name selection
        selectionTitle: document.getElementById('selectionTitle'),
        selectionCount: document.getElementById('selectionCount'),
        namesGrid: document.getElementById('namesGrid'),
        backBtn: document.getElementById('backBtn'),
        submitBtn: document.getElementById('submitBtn'),
        
        // Success screen
        successMessage: document.getElementById('successMessage'),
        newSelectionBtn: document.getElementById('newSelectionBtn'),
        
        // Modals and overlays
        loadingOverlay: document.getElementById('loadingOverlay'),
        confirmationModal: document.getElementById('confirmationModal'),
        confirmationText: document.getElementById('confirmationText'),
        confirmYes: document.getElementById('confirmYes'),
        confirmNo: document.getElementById('confirmNo'),
        errorModal: document.getElementById('errorModal'),
        errorText: document.getElementById('errorText'),
        errorOk: document.getElementById('errorOk'),
        
        // Room availability displays
        available2: document.getElementById('available-2'),
        available3: document.getElementById('available-3'),
        available4: document.getElementById('available-4'),
        available5: document.getElementById('available-5')
    };
    
    // Verify all elements exist
    const missingElements = Object.entries(elements).filter(([key, element]) => !element);
    if (missingElements.length > 0) {
        console.error('❌ Missing DOM elements:', missingElements.map(([key]) => key));
        showError('Application initialization failed. Please refresh the page.');
        return;
    }
    
    console.log('✅ All DOM elements found');
    
    // Set up event listeners
    setupEventListeners();
    
    // Load initial data
    loadInitialData();
    
    // Update room availability display
    updateRoomAvailabilityDisplay();
    
    console.log('✅ App initialized successfully');
}

// Set up all event listeners
function setupEventListeners() {
    console.log('🎯 Setting up event listeners...');
    
    // Room size selection
    elements.roomButtons.forEach(button => {
        button.addEventListener('click', handleRoomSizeSelection);
    });
    
    // Navigation
    elements.backBtn.addEventListener('click', goBackToRoomSelection);
    elements.newSelectionBtn.addEventListener('click', resetToRoomSelection);
    
    // Submission
    elements.submitBtn.addEventListener('click', handleSubmitSelection);
    
    // Modal controls
    elements.confirmYes.addEventListener('click', confirmSubmission);
    elements.confirmNo.addEventListener('click', closeConfirmationModal);
    elements.errorOk.addEventListener('click', closeErrorModal);
    
    // Close modals when clicking outside
    elements.confirmationModal.addEventListener('click', (e) => {
        if (e.target === elements.confirmationModal) {
            closeConfirmationModal();
        }
    });
    
    elements.errorModal.addEventListener('click', (e) => {
        if (e.target === elements.errorModal) {
            closeErrorModal();
        }
    });
    
    console.log('✅ Event listeners set up');
}

// Load initial data (room availability, used names)
async function loadInitialData() {
    console.log('📊 Loading initial data...');
    
    if (CONFIG.USE_GOOGLE_SHEETS) {
        try {
            console.log('🌐 Loading data from Google Sheets...');
            const response = await fetch(`${CONFIG.GOOGLE_SHEETS_URL}?action=getData`);
            const data = await response.json();
            
            if (data.success) {
                // Update room availability
                if (data.roomAvailability) {
                    appState.roomAvailability = { ...data.roomAvailability };
                }
                
                // Update used names
                if (data.usedNames) {
                    appState.usedNames = [...data.usedNames];
                }
                
                console.log('✅ Data loaded from Google Sheets');
            } else {
                console.warn('⚠️ Failed to load data from Google Sheets, using defaults');
            }
        } catch (error) {
            console.warn('⚠️ Error loading from Google Sheets:', error);
            console.log('📱 Using local data instead');
        }
    } else {
        console.log('📱 Using local data (Google Sheets disabled)');
    }
    
    updateRoomAvailabilityDisplay();
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
    
    elements.namesGrid.innerHTML = '';
    
    AVAILABLE_NAMES.forEach(name => {
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
    
    console.log(`✅ Generated ${AVAILABLE_NAMES.length} name buttons`);
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
    showLoading();
    
    try {
        // Simulate or perform actual submission
        const success = await submitToGoogleSheets();
        
        if (success) {
            // Update local state
            appState.usedNames.push(...appState.selectedNames);
            appState.roomAvailability[appState.selectedRoomSize]--;
            
            // Show success
            showSuccess();
            updateRoomAvailabilityDisplay();
        } else {
            showError('Failed to submit your selection. Please try again.');
        }
    } catch (error) {
        console.error('❌ Submission error:', error);
        showError('An error occurred while submitting. Please try again.');
    } finally {
        hideLoading();
    }
}

// Submit to Google Sheets
async function submitToGoogleSheets() {
    if (!CONFIG.USE_GOOGLE_SHEETS) {
        console.log('📱 Simulating submission (Google Sheets disabled)');
        await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate delay
        return true;
    }
    
    try {
        console.log('🌐 Submitting to Google Sheets...');
        
        const response = await fetch(CONFIG.GOOGLE_SHEETS_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'addRoom',
                roomSize: appState.selectedRoomSize,
                names: appState.selectedNames,
                timestamp: new Date().toISOString()
            })
        });
        
        const result = await response.json();
        console.log('📊 Google Sheets response:', result);
        
        return result.success;
    } catch (error) {
        console.error('❌ Google Sheets submission error:', error);
        return false;
    }
}

// Show success screen
function showSuccess() {
    console.log('🎉 Showing success screen');
    
    const namesList = appState.selectedNames.join(', ');
    elements.successMessage.textContent = 
        `Room for ${appState.selectedRoomSize} people reserved for: ${namesList}`;
    
    showScreen('successScreen');
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
    Object.values(elements).forEach(element => {
        if (element && element.classList && element.classList.contains('screen')) {
            element.classList.remove('active');
        }
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
    elements.confirmationModal.classList.remove('show');
    console.log('📱 Confirmation modal closed');
}

function closeErrorModal() {
    elements.errorModal.classList.remove('show');
    console.log('📱 Error modal closed');
}

// Loading state
function showLoading() {
    elements.loadingOverlay.classList.add('show');
    console.log('⏳ Loading overlay shown');
}

function hideLoading() {
    elements.loadingOverlay.classList.remove('show');
    console.log('⏳ Loading overlay hidden');
}

// Error handling
function showError(message) {
    console.error('❌ Error:', message);
    elements.errorText.textContent = message;
    showModal('errorModal');
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
                    button.style.opacity = '0.5';
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

// Export for debugging
window.roomSelectionApp = {
    appState,
    elements,
    CONFIG,
    showError,
    resetToRoomSelection
};

console.log('📱 Room Selection App script loaded');
