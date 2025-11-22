// Email Signup Modal - Required Before Testing
// Users must sign in with email before starting any test
// Email persists across sessions - users only need to sign in once

let userEmail = localStorage.getItem('spectit_user_email') || null;
let testResultsPendingEmail = [];
let pendingTestFunction = null; // Store the test function to call after email signup

// Initialize: Check if user is already signed in on page load
document.addEventListener('DOMContentLoaded', function() {
    // Reload email from localStorage in case it was set in another tab
    userEmail = localStorage.getItem('spectit_user_email') || null;
    
    // Update UI to show signed-in status if email exists
    if (userEmail) {
        updateSignedInUI(userEmail);
    }
});

// Update UI to show user is signed in
function updateSignedInUI(email) {
    // Add signed-in indicator to header if it doesn't exist
    const header = document.querySelector('header nav');
    if (header && !document.getElementById('user-email-indicator')) {
        const userIndicator = document.createElement('div');
        userIndicator.id = 'user-email-indicator';
        userIndicator.className = 'user-email-indicator';
        userIndicator.innerHTML = `
            <span class="user-email-icon">✓</span>
            <span class="user-email-text">Signed in as ${email}</span>
        `;
        header.appendChild(userIndicator);
    } else if (document.getElementById('user-email-indicator')) {
        // Update existing indicator
        const emailText = document.querySelector('#user-email-indicator .user-email-text');
        if (emailText) {
            emailText.textContent = `Signed in as ${email}`;
        }
    }
}

// Check if user has email, if not show modal
function requireEmailBeforeTest(testFunction) {
    if (userEmail) {
        // User already has email, proceed with test
        testFunction();
        return;
    }
    
    // Store the test function to call after email signup
    pendingTestFunction = testFunction;
    
    // Show email signup modal
    showEmailSignupModalForTesting();
}

function showEmailSignupModalForTesting() {
    // If user already has email, don't show modal
    if (userEmail) {
        if (pendingTestFunction) {
            pendingTestFunction();
            pendingTestFunction = null;
        }
        return;
    }
    
    // Create modal
    const modal = document.createElement('div');
    modal.id = 'email-signup-modal';
    modal.className = 'email-signup-modal';
    modal.innerHTML = `
        <div class="email-signup-content">
            <div class="email-signup-header">
                <h2>📧 Sign In to Start Testing</h2>
                <p class="email-signup-subtitle">Enter your email address to begin your eye test. Your results will be saved and sent to this email address.</p>
            </div>
            
            <div class="email-signup-benefits">
                <div class="benefit-item">
                    <span class="benefit-icon">🔐</span>
                    <div>
                        <strong>Required for Testing</strong>
                        <p>Email sign-in is required to start any eye test</p>
                    </div>
                </div>
                <div class="benefit-item">
                    <span class="benefit-icon">📊</span>
                    <div>
                        <strong>Detailed Results Report</strong>
                        <p>Get a comprehensive PDF report of your test results</p>
                    </div>
                </div>
                <div class="benefit-item">
                    <span class="benefit-icon">📈</span>
                    <div>
                        <strong>Vision Health Tracking</strong>
                        <p>Monitor changes in your vision over time</p>
                    </div>
                </div>
                <div class="benefit-item">
                    <span class="benefit-icon">👨‍⚕️</span>
                    <div>
                        <strong>Share with Professionals</strong>
                        <p>Easily share results with your eye care specialist</p>
                    </div>
                </div>
                <div class="benefit-item">
                    <span class="benefit-icon">🔒</span>
                    <div>
                        <strong>Secure & Private</strong>
                        <p>Your data is encrypted and never shared</p>
                    </div>
                </div>
            </div>
            
            <form id="email-signup-form" onsubmit="handleEmailSignup(event)">
                <div class="email-input-group">
                    <label for="user-email">Email Address</label>
                    <input 
                        type="email" 
                        id="user-email" 
                        name="email" 
                        placeholder="your.email@example.com" 
                        required
                        autocomplete="email"
                    >
                    <small class="email-hint">Required to start testing. We'll send your results to this address.</small>
                </div>
                
                <div class="email-consent">
                    <label class="checkbox-label">
                        <input type="checkbox" id="email-consent" required>
                        <span>I agree to receive my test results via email and understand that my data will be stored securely. Email is required to take tests.</span>
                    </label>
                </div>
                
                <div class="email-signup-actions">
                    <button type="submit" class="btn-email-submit">
                        Continue to Test
                    </button>
                </div>
            </form>
            
            <div class="email-signup-footer">
                <p>By continuing, you agree to our <a href="/privacy-policy" target="_blank">Privacy Policy</a></p>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Focus email input
    setTimeout(() => {
        document.getElementById('user-email').focus();
    }, 100);
}

function handleEmailSignup(event) {
    event.preventDefault();
    
    const email = document.getElementById('user-email').value.trim();
    const consent = document.getElementById('email-consent').checked;
    
    if (!email || !isValidEmail(email)) {
        alert('Please enter a valid email address');
        return;
    }
    
    if (!consent) {
        alert('Please agree to receive your results via email');
        return;
    }
    
    // Save email to localStorage (persists across sessions)
    userEmail = email;
    localStorage.setItem('spectit_user_email', email);
    
    // Save to Supabase if available (cloud backup)
    if (window.SupabaseStorage && window.SupabaseStorage.isAvailable()) {
        try {
            await window.SupabaseStorage.users.saveUser(email);
        } catch (error) {
            console.warn('Failed to save user to Supabase, using localStorage only:', error);
        }
    }
    
    // Update UI to show signed-in status
    updateSignedInUI(email);
    
    // Close modal
    closeEmailSignupModal();
    
    // Show success message
    showEmailSuccessMessage(email, 'You are now signed in! You can start any test without signing in again.');
    
    // If there's a pending test function, call it
    if (pendingTestFunction) {
        setTimeout(() => {
            pendingTestFunction();
            pendingTestFunction = null;
        }, 500);
    }
    
    // If there are pending results, show them
    if (testResultsPendingEmail.length > 0) {
        setTimeout(() => {
            testResultsPendingEmail.forEach(result => {
                saveResult(result);
                showResult(result);
            });
            testResultsPendingEmail = [];
        }, 500);
    }
}

// Removed skipEmailSignup - email is now required before testing

function closeEmailSignupModal() {
    const modal = document.getElementById('email-signup-modal');
    if (modal) {
        modal.remove();
    }
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function sendResultsToEmail(email, results) {
    // In production, this would call your backend API
    console.log('Sending results to:', email, results);
    
    // For now, just log it
    // In production: fetch('/api/send-results', { method: 'POST', body: JSON.stringify({ email, results }) })
}

function showEmailSuccessMessage(email, customMessage = null) {
    const message = document.createElement('div');
    message.className = 'email-success-message';
    message.innerHTML = `
        <div class="email-success-content">
            <span class="success-icon">✓</span>
            <p>Signed in as <strong>${email}</strong></p>
            <p class="success-subtitle">${customMessage || 'Check your inbox for your comprehensive test report'}</p>
        </div>
    `;
    
    document.body.appendChild(message);
    
    setTimeout(() => {
        message.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        message.classList.remove('show');
        setTimeout(() => message.remove(), 300);
    }, 5000);
}

// Legacy function for backward compatibility (for results)
function showEmailSignupModal(testResult = null) {
    // If user already has email, save result and show it
    if (userEmail && testResult) {
        saveResult(testResult);
        showResult(testResult);
        return;
    }
    
    // Store result for later if email is provided
    if (testResult) {
        testResultsPendingEmail.push(testResult);
    }
    
    // Show the modal (will use the new version)
    showEmailSignupModalForTesting();
}

// Override saveResult to require email (for results viewing)
const originalSaveResult = window.saveResult;
window.saveResult = function(result) {
    // Check if email is required
    if (!userEmail) {
        testResultsPendingEmail.push(result);
        showEmailSignupModalForTesting();
        return;
    }
    
    // Call original saveResult
    if (originalSaveResult) {
        originalSaveResult(result);
    } else {
        // Fallback if original doesn't exist
        if (typeof testHistory !== 'undefined') {
            testHistory.push(result);
            localStorage.setItem('testHistory', JSON.stringify(testHistory));
            if (typeof updateResultsDisplay === 'function') updateResultsDisplay();
            if (typeof updateHistoryChart === 'function') updateHistoryChart();
        }
    }
};

// Export function for use in other files
window.requireEmailBeforeTest = requireEmailBeforeTest;
window.getUserEmail = function() { 
    // Always check localStorage in case it was updated in another tab
    userEmail = localStorage.getItem('spectit_user_email') || userEmail;
    return userEmail; 
};

// Function to check if user is signed in (for other parts of the app)
window.isUserSignedIn = function() {
    userEmail = localStorage.getItem('spectit_user_email') || userEmail;
    return !!userEmail;
};

// Function to sign out (optional - for future use)
window.signOut = function() {
    userEmail = null;
    localStorage.removeItem('spectit_user_email');
    const indicator = document.getElementById('user-email-indicator');
    if (indicator) {
        indicator.remove();
    }
    // Show message
    const message = document.createElement('div');
    message.className = 'email-success-message';
    message.innerHTML = `
        <div class="email-success-content">
            <span class="success-icon">✓</span>
            <p>Signed out successfully</p>
        </div>
    `;
    document.body.appendChild(message);
    setTimeout(() => {
        message.classList.add('show');
        setTimeout(() => {
            message.classList.remove('show');
            setTimeout(() => message.remove(), 300);
        }, 2000);
    }, 100);
};

