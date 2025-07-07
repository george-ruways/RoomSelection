// Room Selection App JavaScript

class RoomSelectionApp {
    constructor() {
        this.selectedRoomSize = 0;
        this.selectedNames = [];
        this.usedNames = new Set(); // Names already used from Google Sheets
        
        // Real names list
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

        // Room availability limits
        this.roomLimits = {
            2: { max: 10, used: 0 }, // 10 rooms of 2 people available
            3: { max: 8, used: 0 },  // 8 rooms of 3 people available
            4: { max: 6, used: 0 },  // 6 rooms of 4 people available
            5: { max: 4, used: 0 }   // 4 rooms of 5 people available
        };

        // Google Sheets configuration
        this.googleSheetsConfig = {
            // Replace with your Google Apps Script Web App URL
            scriptUrl: 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE',
            // Alternative: Use Google Sheets API with a public sheet
            // For demo purposes, we'll use a mock API endpoint
            apiUrl: 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec'
        };

        this.init();
    }

    init() {
        this.bindEvents();
        this.loadUsedNames();
        this.loadRoomUsage();
        this.updateRoomAvailability();
        this.ensureDialogsHidden();
    }

    ensureDialogsHidden() {
        // Ensure all dialogs start hidden
        document.getElementById('confirmation-dialog').classList.add('hidden');
        document.getElementById('loading').classList.add('hidden');
        document.getElementById('error-message').classList.add('hidden');
        document.getElementById('success-step').classList.add('hidden');
        document.getElementById('name-selection-step').classList.add('hidden');
    }

    bindEvents() {
        // Room size selection
        document.querySelectorAll('.room-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.selectRoomSize(parseInt(e.currentTarget.dataset.size));
            });
        });

        // Back button
        document.getElementById('back-btn').addEventListener('click', () => {
            this.goBack();
        });

        // Submit button
        document.getElementById('submit-btn').addEventListener('click', () => {
            this.showConfirmationDialog();
        });

        // Confirmation dialog buttons
        document.getElementById('confirm-submit-btn').addEventListener('click', () => {
            this.submitSelection();
        });

        document.getElementById('cancel-submit-btn').addEventListener('click', () => {
            this.hideConfirmationDialog();
        });

        // Close confirmation dialog when clicking outside
        document.getElementById('confirmation-dialog').addEventListener('click', (e) => {
            if (e.target === document.getElementById('confirmation-dialog')) {
                this.hideConfirmationDialog();
            }
        });

        // Close confirmation dialog with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const confirmationDialog = document.getElementById('confirmation-dialog');
                if (confirmationDialog && !confirmationDialog.classList.contains('hidden')) {
                    this.hideConfirmationDialog();
                }
            }
        });

        // New selection button
        document.getElementById('new-selection-btn').addEventListener('click', () => {
            this.resetApp();
        });

        // Retry button
        document.getElementById('retry-btn').addEventListener('click', () => {
            this.hideError();
        });
    }

    selectRoomSize(size) {
        // Check if room size is still available
        if (this.roomLimits[size].used >= this.roomLimits[size].max) {
            this.showTemporaryMessage(`Sorry, no more rooms of size ${size} are available.`);
            return;
        }

        this.selectedRoomSize = size;
        
        // Update UI
        document.querySelectorAll('.room-btn').forEach(btn => {
            btn.classList.remove('selected');
        });
        document.querySelector(`[data-size="${size}"]`).classList.add('selected');

        // Show name selection step
        setTimeout(() => {
            this.showNameSelection();
        }, 300);
    }

    showNameSelection() {
        document.getElementById('room-size-step').classList.add('hidden');
        document.getElementById('name-selection-step').classList.remove('hidden');
        
        document.getElementById('required-count').textContent = this.selectedRoomSize;
        this.renderNameGrid();
        this.updateSelectionCounter();
    }

    renderNameGrid() {
        const nameGrid = document.getElementById('name-grid');
        nameGrid.innerHTML = '';

        this.availableNames.forEach(name => {
            const nameElement = document.createElement('div');
            nameElement.className = 'name-option';
            nameElement.textContent = name;
            
            // Check if name is already used
            if (this.usedNames.has(name)) {
                nameElement.classList.add('used');
                nameElement.setAttribute('title', 'This name has already been used');
            } else {
                nameElement.addEventListener('click', () => {
                    this.toggleNameSelection(name, nameElement);
                });
            }

            nameGrid.appendChild(nameElement);
        });
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
                this.showTemporaryMessage('You have already selected the maximum number of people for this room size.');
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

    showTemporaryMessage(message) {
        // Create a temporary notification
        const notification = document.createElement('div');
        notification.className = 'temporary-notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #e53e3e;
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            z-index: 1000;
            animation: slideIn 0.3s ease;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    showConfirmationDialog() {
        // Populate confirmation details
        const confirmRoomSize = document.getElementById('confirm-room-size');
        const confirmParticipants = document.getElementById('confirm-participants');
        const confirmationDialog = document.getElementById('confirmation-dialog');
        
        if (confirmRoomSize && confirmParticipants && confirmationDialog) {
            confirmRoomSize.textContent = this.selectedRoomSize;
            confirmParticipants.innerHTML = 
                this.selectedNames.map(name => `<li>• ${name}</li>`).join('');
            
            // Show confirmation dialog
            confirmationDialog.classList.remove('hidden');
        }
    }

    hideConfirmationDialog() {
        const confirmationDialog = document.getElementById('confirmation-dialog');
        if (confirmationDialog) {
            confirmationDialog.classList.add('hidden');
        }
    }

    updateRoomAvailability() {
        document.querySelectorAll('.room-btn').forEach(btn => {
            const size = parseInt(btn.dataset.size);
            const available = this.roomLimits[size].max - this.roomLimits[size].used;
            
            // Update button text to show availability
            const roomText = btn.querySelector('.room-text');
            roomText.innerHTML = `${size} People<br><small>(${available} rooms left)</small>`;
            
            // Disable button if no rooms available
            if (available <= 0) {
                btn.classList.add('disabled');
                btn.disabled = true;
            } else {
                btn.classList.remove('disabled');
                btn.disabled = false;
            }
            
            // Add warning style if only few rooms left
            if (available <= 2 && available > 0) {
                btn.classList.add('limited');
            } else {
                btn.classList.remove('limited');
            }
        });
    }

    async loadRoomUsage() {
        try {
            // For demonstration, simulate some used rooms
            // In production, this would fetch from Google Sheets
            const mockUsage = {
                2: 3, // 3 rooms of 2 people already used
                3: 2, // 2 rooms of 3 people already used
                4: 1, // 1 room of 4 people already used
                5: 0  // 0 rooms of 5 people already used
            };
            
            Object.keys(mockUsage).forEach(size => {
                this.roomLimits[size].used = mockUsage[size];
            });

            /*
            // Actual Google Sheets implementation would look like this:
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
            */
        } catch (error) {
            console.error('Error loading room usage:', error);
        }
    }

    goBack() {
        this.selectedNames = [];
        document.getElementById('name-selection-step').classList.add('hidden');
        document.getElementById('room-size-step').classList.remove('hidden');
    }

    async submitSelection() {
        this.hideConfirmationDialog();
        this.showLoading();

        try {
            const submissionData = {
                roomSize: this.selectedRoomSize,
                selectedNames: this.selectedNames,
                timestamp: new Date().toISOString(),
                submissionId: this.generateSubmissionId()
            };

            // Submit to Google Sheets
            await this.submitToGoogleSheets(submissionData);

            // Update used names
            this.selectedNames.forEach(name => {
                this.usedNames.add(name);
            });

            // Update room usage
            this.roomLimits[this.selectedRoomSize].used += 1;
            this.updateRoomAvailability();

            this.showSuccess(submissionData);
        } catch (error) {
            console.error('Submission error:', error);
            this.showError('Failed to submit your selection. Please check your internet connection and try again.');
        }
    }

    async submitToGoogleSheets(data) {
        // For demonstration, we'll use a mock API call
        // In production, replace this with your actual Google Sheets API endpoint
        
        // Mock API call (replace with actual implementation)
        const response = await fetch('https://httpbin.org/post', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        return await response.json();

        /* 
        // Actual Google Sheets implementation would look like this:
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
        */
    }

    async loadUsedNames() {
        try {
            // For demonstration, we'll simulate loading used names
            // In production, this would fetch from Google Sheets
            
            // Mock used names (replace with actual implementation)
            const mockUsedNames = ['Alice Johnson', 'Bob Smith', 'Charlie Brown'];
            this.usedNames = new Set(mockUsedNames);

            /*
            // Actual Google Sheets implementation would look like this:
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
            */
        } catch (error) {
            console.error('Error loading used names:', error);
            // Continue with empty used names set
        }
    }

    generateSubmissionId() {
        return 'sub_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    showLoading() {
        document.getElementById('name-selection-step').classList.add('hidden');
        document.getElementById('loading').classList.remove('hidden');
    }

    showSuccess(data) {
        document.getElementById('loading').classList.add('hidden');
        document.getElementById('success-step').classList.remove('hidden');

        // Populate selection summary
        const summary = document.getElementById('selection-summary');
        summary.innerHTML = `
            <h3>Your Selection:</h3>
            <p><strong>Room Size:</strong> ${data.roomSize} people</p>
            <p><strong>Selected Participants:</strong></p>
            <ul>
                ${data.selectedNames.map(name => `<li>• ${name}</li>`).join('')}
            </ul>
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

    resetApp() {
        this.selectedRoomSize = 0;
        this.selectedNames = [];
        
        // Reset UI
        document.querySelectorAll('.room-btn').forEach(btn => {
            btn.classList.remove('selected');
        });
        
        document.getElementById('success-step').classList.add('hidden');
        document.getElementById('room-size-step').classList.remove('hidden');
        
        // Reload used names in case they've been updated
        this.loadUsedNames();
        this.loadRoomUsage();
        this.updateRoomAvailability();
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new RoomSelectionApp();
});

// Add CSS for temporary notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(style);
