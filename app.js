// Room Selection App - Clean Implementation

class RoomSelectionApp {
    constructor() {
        // Initialize properties
        this.selectedRoomSize = 0;
        this.selectedNames = [];
        this.usedNames = new Set();

        // Real names database
        this.availableNames = [
            'Emma Thompson', 'Liam Anderson', 'Olivia Martinez', 'Noah Wilson',
            'Ava Garcia', 'William Rodriguez', 'Sophia Lopez', 'James Hernandez',
            'Isabella Gonzalez', 'Benjamin Perez', 'Charlotte Sanchez', 'Lucas Torres',
            'Amelia Rivera', 'Henry Cooper', 'Mia Reed', 'Alexander Bailey',
            'Harper Bell', 'Sebastian Murphy', 'Evelyn Rivera', 'Jack Foster',
            'Abigail Gray', 'Owen Powell', 'Emily Jenkins', 'Caleb Perry',
            'Madison Hughes', 'Aiden Wood', 'Ella Barnes', 'Matthew Fisher',
            'Scarlett Russell', 'Daniel Griffin', 'Grace Butler', 'Joseph Coleman',
            'Chloe Hughes', 'Samuel Patterson', 'Victoria Price', 'David Jenkins',
            'Zoey Watson', 'Anthony Brooks', 'Lily Kelly', 'Christopher Cox',
            'Natalie Reed', 'Andrew Torres', 'Audrey Morris', 'Joshua Bailey',
            'Maya Phillips', 'Ryan Stewart', 'Leah Cook', 'Nathan Rogers',
            'Hannah Evans', 'Christian Wright'
        ];

        // Room limits
        this.roomLimits = {
            2: { max: 10, used: 0 },
            3: { max: 8, used: 0 },
            4: { max: 6, used: 0 },
            5: { max: 4, used: 0 }
        };

        // Google Sheets configuration
        this.googleSheetsEnabled = false; // Set to true when configured
        this.googleSheetsUrl = 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE';

        // Initialize the app
        this.init();
    }

    init() {
        console.log('Initializing Room Selection App...');
        this.setupEventListeners();
        this.loadData();
        console.log('App initialized successfully');
    }

    setupEventListeners() {
        // Room size buttons
        document.querySelectorAll('.room-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const size = parseInt(e.currentTarget.dataset.size);
                this.selectRoomSize(size);
            });
        });

        // Navigation buttons
        document.getElementById('back-btn').addEventListener('click', () => this.goBack());
        document.getElementById('submit-btn').addEventListener('click', () => this.showConfirmation());
        
        // Confirmation modal buttons
        document.getElementById('cancel-btn').addEventListener('click', () => this.hideConfirmation());
        document.getElementById('confirm-btn').addEventListener('click', () => this.submitSelection());
        
        // Other buttons
        document.getElementById('new-selection-btn').addEventListener('click', () => this.resetApp());
        document.getElementById('retry-btn').addEventListener('click', () => this.hideError());

        // Close modal when clicking overlay
        document.getElementById('confirmation-modal').addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-overlay')) {
                this.hideConfirmation();
            }
        });
    }

    loadData() {
        // Load used names and room usage
        if (this.googleSheetsEnabled) {
            this.loadFromGoogleSheets();
        } else {
            // Mock data for testing
            this.usedNames = new Set(['Emma Thompson', 'Liam Anderson', 'Olivia Martinez']);
            this.roomLimits[2].used = 3;
            this.roomLimits[3].used = 2;
            this.roomLimits[4].used = 1;
            this.roomLimits[5].used = 0;
        }
        this.updateRoomAvailability();
    }

    selectRoomSize(size) {
        console.log('Room size selected:', size);
        
        // Check availability
        if (this.roomLimits[size].used >= this.roomLimits[size].max) {
            this.showNotification(`Sorry, no more rooms of size ${size} are available.`);
            return;
        }

        this.selectedRoomSize = size;
        this.selectedNames = [];

        // Update UI
        document.querySelectorAll('.room-btn').forEach(btn => btn.classList.remove('selected'));
        document.querySelector(`[data-size="${size}"]`).classList.add('selected');

        // Show name selection
        this.showNameSelection();
    }

    showNameSelection() {
        console.log('Showing name selection for room size:', this.selectedRoomSize);
        
        // Hide room selection, show name selection
        document.getElementById('room-size-step').classList.add('hidden');
        document.getElementById('name-selection-step').classList.remove('hidden');
        
        // Update required count
        document.getElementById('required-count').textContent = this.selectedRoomSize;
        
        // Render names
        this.renderNameGrid();
        this.updateSelectionCounter();
    }

    renderNameGrid() {
        const nameGrid = document.getElementById('name-grid');
        nameGrid.innerHTML = '';

        console.log('Rendering', this.availableNames.length, 'names');

        this.availableNames.forEach(name => {
            const nameElement = document.createElement('div');
            nameElement.className = 'name-option';
            nameElement.textContent = name;

            // Check if name is already used
            if (this.usedNames.has(name)) {
                nameElement.classList.add('used');
                nameElement.title = 'This name has already been used';
            } else {
                nameElement.addEventListener('click', () => {
                    this.toggleNameSelection(name, nameElement);
                });
            }

            nameGrid.appendChild(nameElement);
        });

        console.log('Names rendered successfully');
    }

    toggleNameSelection(name, element) {
        if (element.classList.contains('selected')) {
            // Deselect
            element.classList.remove('selected');
            this.selectedNames = this.selectedNames.filter(n => n !== name);
        } else {
            // Check if we can select more
            if (this.selectedNames.length < this.selectedRoomSize) {
                element.classList.add('selected');
                this.selectedNames.push(name);
            } else {
                this.showNotification('You have already selected the maximum number of people.');
                return;
            }
        }

        this.updateSelectionCounter();
        this.updateSubmitButton();
    }

    updateSelectionCounter() {
        document.getElementById('selected-count').textContent = this.selectedNames.length;
    }

    updateSubmitButton() {
        const submitBtn = document.getElementById('submit-btn');
        submitBtn.disabled = this.selectedNames.length !== this.selectedRoomSize;
    }

    updateRoomAvailability() {
        document.querySelectorAll('.room-btn').forEach(btn => {
            const size = parseInt(btn.dataset.size);
            const available = this.roomLimits[size].max - this.roomLimits[size].used;
            
            // Update button text
            const roomText = btn.querySelector('.room-text');
            roomText.innerHTML = `${size} People<br><small>(${available} left)</small>`;
            
            // Update button state
            if (available <= 0) {
                btn.classList.add('disabled');
                btn.disabled = true;
            } else {
                btn.classList.remove('disabled');
                btn.disabled = false;
                
                if (available <= 2) {
                    btn.classList.add('limited');
                } else {
                    btn.classList.remove('limited');
                }
            }
        });
    }

    showConfirmation() {
        document.getElementById('confirm-room-size').textContent = this.selectedRoomSize;
        
        const participantsList = document.getElementById('confirm-participants');
        participantsList.innerHTML = this.selectedNames.map(name => `<li>• ${name}</li>`).join('');
        
        document.getElementById('confirmation-modal').classList.remove('hidden');
    }

    hideConfirmation() {
        document.getElementById('confirmation-modal').classList.add('hidden');
    }

    async submitSelection() {
        this.hideConfirmation();
        this.showLoading();

        try {
            const submissionData = {
                roomSize: this.selectedRoomSize,
                selectedNames: this.selectedNames,
                timestamp: new Date().toISOString(),
                submissionId: this.generateSubmissionId()
            };

            // Submit to Google Sheets or mock API
            await this.submitData(submissionData);

            // Update local data
            this.selectedNames.forEach(name => this.usedNames.add(name));
            this.roomLimits[this.selectedRoomSize].used += 1;
            this.updateRoomAvailability();

            this.showSuccess(submissionData);
        } catch (error) {
            console.error('Submission error:', error);
            this.showError('Failed to submit your selection. Please try again.');
        }
    }

    async submitData(data) {
        if (this.googleSheetsEnabled) {
            // Real Google Sheets submission
            const response = await fetch(this.googleSheetsUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'addSubmission', data })
            });

            if (!response.ok) {
                throw new Error('Failed to submit to Google Sheets');
            }

            return await response.json();
        } else {
            // Mock submission for testing
            await new Promise(resolve => setTimeout(resolve, 1000));
            return { success: true };
        }
    }

    generateSubmissionId() {
        return 'sub_' + Date.now() + '_' + Math.random().toString(36).substring(2, 11);
    }

    showLoading() {
        document.getElementById('name-selection-step').classList.add('hidden');
        document.getElementById('loading').classList.remove('hidden');
    }

    showSuccess(data) {
        document.getElementById('loading').classList.add('hidden');
        document.getElementById('success-step').classList.remove('hidden');

        const summary = document.getElementById('selection-summary');
        summary.innerHTML = `
            <h3>Your Selection:</h3>
            <p><strong>Room Size:</strong> ${data.roomSize} people</p>
            <p><strong>Selected Participants:</strong></p>
            <ul>${data.selectedNames.map(name => `<li>• ${name}</li>`).join('')}</ul>
            <p><strong>Submission ID:</strong> ${data.submissionId}</p>
        `;
    }

    showError(message) {
        document.getElementById('loading').classList.add('hidden');
        document.getElementById('error-message').classList.remove('hidden');
        document.getElementById('error-text').textContent = message;
    }

    hideError() {
        document.getElementById('error-message').classList.add('hidden');
        document.getElementById('name-selection-step').classList.remove('hidden');
    }

    goBack() {
        this.selectedNames = [];
        document.getElementById('name-selection-step').classList.add('hidden');
        document.getElementById('room-size-step').classList.remove('hidden');
    }

    resetApp() {
        this.selectedRoomSize = 0;
        this.selectedNames = [];
        
        document.querySelectorAll('.room-btn').forEach(btn => btn.classList.remove('selected'));
        document.getElementById('success-step').classList.add('hidden');
        document.getElementById('room-size-step').classList.remove('hidden');
        
        this.loadData();
    }

    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #e53e3e;
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;

        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    }

    async loadFromGoogleSheets() {
        try {
            // Load used names
            const usedNamesResponse = await fetch(this.googleSheetsUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'getUsedNames' })
            });

            if (usedNamesResponse.ok) {
                const usedNamesData = await usedNamesResponse.json();
                this.usedNames = new Set(usedNamesData.usedNames || []);
            }

            // Load room usage
            const roomUsageResponse = await fetch(this.googleSheetsUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'getRoomUsage' })
            });

            if (roomUsageResponse.ok) {
                const roomUsageData = await roomUsageResponse.json();
                if (roomUsageData.success) {
                    Object.keys(roomUsageData.roomUsage).forEach(size => {
                        this.roomLimits[size].used = roomUsageData.roomUsage[size];
                    });
                }
            }
        } catch (error) {
            console.error('Error loading from Google Sheets:', error);
        }
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing app...');
    new RoomSelectionApp();
});

// Add notification animation CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
`;
document.head.appendChild(style);
