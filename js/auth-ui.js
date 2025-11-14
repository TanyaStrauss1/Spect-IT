// Authentication UI Components and Logic
// Handles sign up, sign in, and user management

const AuthUI = {
    currentUser: null,
    authStateListeners: [],

    // Initialize authentication UI
    async init() {
        // Initialize Supabase client
        if (window.SupabaseClient) {
            window.SupabaseClient.init();
            
            // Listen to auth state changes
            window.SupabaseClient.onAuthStateChange((event, session) => {
                this.handleAuthStateChange(event, session);
            });

            // Check if user is already logged in
            const user = await window.SupabaseClient.getCurrentUser();
            if (user) {
                this.currentUser = user;
                this.updateUIForAuthenticatedUser(user);
            }
        }
    },

    // Handle authentication state changes
    handleAuthStateChange(event, session) {
        if (event === 'SIGNED_IN' && session) {
            this.currentUser = session.user;
            this.updateUIForAuthenticatedUser(session.user);
        } else if (event === 'SIGNED_OUT') {
            this.currentUser = null;
            this.updateUIForUnauthenticatedUser();
        }

        // Notify listeners
        this.authStateListeners.forEach(listener => {
            listener(event, session);
        });
    },

    // Update UI when user is authenticated
    updateUIForAuthenticatedUser(user) {
        const loginSection = document.getElementById('login-section');
        const userDashboard = document.getElementById('user-dashboard');
        const userName = document.getElementById('user-name');
        const userEmailDisplay = document.getElementById('user-email-display');

        if (loginSection) loginSection.style.display = 'none';
        if (userDashboard) userDashboard.style.display = 'block';
        if (userName) userName.textContent = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
        if (userEmailDisplay) userEmailDisplay.textContent = user.email || '';

        // Load user data
        this.loadUserData();
    },

    // Update UI when user is not authenticated
    updateUIForUnauthenticatedUser() {
        const loginSection = document.getElementById('login-section');
        const userDashboard = document.getElementById('user-dashboard');

        if (loginSection) loginSection.style.display = 'block';
        if (userDashboard) userDashboard.style.display = 'none';
    },

    // Sign up handler
    async handleSignUp() {
        const email = document.getElementById('user-email')?.value;
        const password = document.getElementById('user-password')?.value;
        const fullName = document.getElementById('user-full-name')?.value || '';

        if (!email || !password) {
            alert('Please enter email and password');
            return;
        }

        if (password.length < 6) {
            alert('Password must be at least 6 characters');
            return;
        }

        try {
            await window.SupabaseClient.signUp(email, password, fullName);
            alert('Account created! Please check your email to verify your account.');
        } catch (error) {
            alert('Error creating account: ' + error.message);
        }
    },

    // Sign in handler
    async handleSignIn() {
        const email = document.getElementById('user-email')?.value;
        const password = document.getElementById('user-password')?.value;

        if (!email || !password) {
            alert('Please enter email and password');
            return;
        }

        try {
            await window.SupabaseClient.signIn(email, password);
            // UI will update automatically via auth state change
        } catch (error) {
            alert('Error signing in: ' + error.message);
        }
    },

    // Sign out handler
    async handleSignOut() {
        try {
            await window.SupabaseClient.signOut();
            // UI will update automatically via auth state change
        } catch (error) {
            alert('Error signing out: ' + error.message);
        }
    },

    // Reset password handler
    async handleResetPassword() {
        const email = document.getElementById('user-email')?.value;

        if (!email) {
            alert('Please enter your email address');
            return;
        }

        try {
            await window.SupabaseClient.resetPassword(email);
            alert('Password reset email sent! Please check your inbox.');
        } catch (error) {
            alert('Error sending reset email: ' + error.message);
        }
    },

    // Load user data (test history, prescriptions)
    async loadUserData() {
        if (!this.currentUser) return;

        try {
            // Load test history
            const testHistory = await window.DatabaseService.getTestResults();
            this.displayTestHistory(testHistory);

            // Load prescriptions
            const prescriptions = await window.DatabaseService.getPrescriptions();
            this.displayPrescriptions(prescriptions);
        } catch (error) {
            console.error('Error loading user data:', error);
        }
    },

    // Display test history
    displayTestHistory(testHistory) {
        const historyList = document.getElementById('test-history-list');
        if (!historyList) return;

        if (testHistory.length === 0) {
            historyList.innerHTML = '<p>No test history yet. Complete some tests to see your results here.</p>';
            return;
        }

        historyList.innerHTML = testHistory.map(result => {
            const date = new Date(result.created_at).toLocaleDateString();
            return `
                <div class="history-item">
                    <h4>${this.getTestTypeName(result.test_type)}</h4>
                    <p>Date: ${date}</p>
                    <button onclick="AuthUI.viewTestResult('${result.id}')">View Details</button>
                    <button onclick="AuthUI.deleteTestResult('${result.id}')">Delete</button>
                </div>
            `;
        }).join('');
    },

    // Display prescriptions
    displayPrescriptions(prescriptions) {
        const prescriptionsList = document.getElementById('saved-prescriptions-list');
        if (!prescriptionsList) return;

        if (prescriptions.length === 0) {
            prescriptionsList.innerHTML = '<p>No saved prescriptions yet.</p>';
            return;
        }

        prescriptionsList.innerHTML = prescriptions.map(prescription => {
            const date = new Date(prescription.created_at).toLocaleDateString();
            const rx = prescription.prescription_data;
            return `
                <div class="prescription-item">
                    <h4>Prescription from ${date}</h4>
                    <p>OD: ${rx.OD?.sphere || 'N/A'} / ${rx.OD?.cylinder || 'N/A'} @ ${rx.OD?.axis || 'N/A'}°</p>
                    <p>OS: ${rx.OS?.sphere || 'N/A'} / ${rx.OS?.cylinder || 'N/A'} @ ${rx.OS?.axis || 'N/A'}°</p>
                    <p>PD: ${rx.pd || 'N/A'} mm</p>
                    <button onclick="AuthUI.viewPrescription('${prescription.id}')">View</button>
                    <button onclick="AuthUI.sharePrescription('${prescription.id}')">Share</button>
                    <button onclick="AuthUI.deletePrescription('${prescription.id}')">Delete</button>
                </div>
            `;
        }).join('');
    },

    // Get test type display name
    getTestTypeName(testType) {
        const names = {
            'acuity': 'Visual Acuity Test',
            'color': 'Color Blindness Test',
            'astigmatism': 'Astigmatism Test',
            'prescription': 'Prescription Test',
            'contrast': 'Contrast Sensitivity',
            'depth': 'Depth Perception',
            'visualfield': 'Visual Field Test',
            'dominance': 'Eye Dominance',
            'nearvision': 'Near Vision Test'
        };
        return names[testType] || testType;
    },

    // View test result
    async viewTestResult(resultId) {
        try {
            const result = await window.DatabaseService.getTestResult(resultId);
            if (result) {
                // Show result in a modal or navigate to results page
                alert(`Test Result:\n${JSON.stringify(result.results, null, 2)}`);
            }
        } catch (error) {
            alert('Error loading test result: ' + error.message);
        }
    },

    // Delete test result
    async deleteTestResult(resultId) {
        if (!confirm('Are you sure you want to delete this test result?')) {
            return;
        }

        try {
            await window.DatabaseService.deleteTestResult(resultId);
            this.loadUserData(); // Reload list
        } catch (error) {
            alert('Error deleting test result: ' + error.message);
        }
    },

    // View prescription
    async viewPrescription(prescriptionId) {
        try {
            const prescription = await window.DatabaseService.getPrescription(prescriptionId);
            if (prescription) {
                // Show prescription in a modal or navigate to prescription page
                alert(`Prescription:\n${JSON.stringify(prescription.prescription_data, null, 2)}`);
            }
        } catch (error) {
            alert('Error loading prescription: ' + error.message);
        }
    },

    // Share prescription
    async sharePrescription(prescriptionId) {
        try {
            const shareData = await window.DatabaseService.shareResult(null, prescriptionId);
            if (shareData.shareUrl) {
                // Copy to clipboard
                navigator.clipboard.writeText(shareData.shareUrl);
                alert('Share link copied to clipboard!\n' + shareData.shareUrl);
            }
        } catch (error) {
            alert('Error sharing prescription: ' + error.message);
        }
    },

    // Delete prescription
    async deletePrescription(prescriptionId) {
        if (!confirm('Are you sure you want to delete this prescription?')) {
            return;
        }

        try {
            await window.DatabaseService.deletePrescription(prescriptionId);
            this.loadUserData(); // Reload list
        } catch (error) {
            alert('Error deleting prescription: ' + error.message);
        }
    },

    // Add auth state listener
    onAuthStateChange(callback) {
        this.authStateListeners.push(callback);
    }
};

// Make available globally
window.AuthUI = AuthUI;

// Update existing sign in/up functions in app.js
window.signIn = () => AuthUI.handleSignIn();
window.signUp = () => AuthUI.handleSignUp();
window.signOut = () => AuthUI.handleSignOut();

