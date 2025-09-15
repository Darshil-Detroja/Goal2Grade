// Authentication Script for Smart Study Planner

class AuthManager {
    constructor() {
        this.currentUser = null;
        this.users = this.loadUsers();
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.checkExistingSession();
    }

    setupEventListeners() {
        // Login form
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // Signup form
        const signupForm = document.getElementById('signupForm');
        if (signupForm) {
            signupForm.addEventListener('submit', (e) => this.handleSignup(e));
        }

        // Password strength checker
        const signupPassword = document.getElementById('signupPassword');
        if (signupPassword) {
            signupPassword.addEventListener('input', () => this.checkPasswordStrength());
        }

        // Confirm password checker
        const confirmPassword = document.getElementById('confirmPassword');
        if (confirmPassword) {
            confirmPassword.addEventListener('input', () => this.checkPasswordMatch());
        }

        // Real-time email validation
        const emailInputs = document.querySelectorAll('input[type="email"]');
        emailInputs.forEach(input => {
            input.addEventListener('blur', () => this.validateEmail(input));
        });
    }

    checkExistingSession() {
        const currentUser = localStorage.getItem('currentUser');
        if (currentUser) {
            this.currentUser = JSON.parse(currentUser);
            // Redirect to main app if already logged in
            if (window.location.pathname.includes('login.html') || window.location.pathname.includes('signup.html')) {
                window.location.href = 'index.html';
            }
        }
    }

    // User Management
    loadUsers() {
        const users = localStorage.getItem('users');
        return users ? JSON.parse(users) : [];
    }

    saveUsers() {
        localStorage.setItem('users', JSON.stringify(this.users));
    }

    generateUserId() {
        return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // Login Handler
    async handleLogin(e) {
        e.preventDefault();
        
        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value;
        const rememberMe = document.getElementById('rememberMe').checked;

        // Clear previous errors
        this.clearErrors();

        // Validate inputs
        if (!this.validateEmail(document.getElementById('loginEmail'))) {
            return;
        }

        if (!password) {
            this.showError('passwordError', 'Password is required');
            return;
        }

        // Show loading state
        const submitBtn = e.target.querySelector('button[type="submit"]');
        this.setLoadingState(submitBtn, true);

        try {
            // Simulate API delay
            await this.delay(1000);

            // Find user
            const user = this.users.find(u => u.email.toLowerCase() === email.toLowerCase());
            
            if (!user) {
                this.showError('emailError', 'No account found with this email');
                this.setLoadingState(submitBtn, false);
                return;
            }

            if (user.password !== this.hashPassword(password)) {
                this.showError('passwordError', 'Incorrect password');
                this.setLoadingState(submitBtn, false);
                return;
            }

            // Login successful
            this.currentUser = {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                studyLevel: user.studyLevel,
                loginTime: new Date().toISOString()
            };

            // Save session
            if (rememberMe) {
                localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
            } else {
                sessionStorage.setItem('currentUser', JSON.stringify(this.currentUser));
            }

            // Show success animation
            this.showSuccess('Login successful! Redirecting...');
            
            // Redirect to main app
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);

        } catch (error) {
            this.showError('general', 'Login failed. Please try again.');
            this.setLoadingState(submitBtn, false);
        }
    }

    // Signup Handler
    async handleSignup(e) {
        e.preventDefault();
        
        const firstName = document.getElementById('firstName').value.trim();
        const lastName = document.getElementById('lastName').value.trim();
        const email = document.getElementById('signupEmail').value.trim();
        const password = document.getElementById('signupPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const studyLevel = document.getElementById('studyLevel').value;
        const agreeTerms = document.getElementById('agreeTerms').checked;

        // Clear previous errors
        this.clearErrors();

        // Validate inputs
        let isValid = true;

        if (!firstName) {
            this.showError('firstNameError', 'First name is required');
            isValid = false;
        }

        if (!lastName) {
            this.showError('lastNameError', 'Last name is required');
            isValid = false;
        }

        if (!this.validateEmail(document.getElementById('signupEmail'))) {
            isValid = false;
        }

        if (!this.validatePassword(password)) {
            isValid = false;
        }

        if (password !== confirmPassword) {
            this.showError('confirmPasswordError', 'Passwords do not match');
            isValid = false;
        }

        if (!studyLevel) {
            this.showError('studyLevelError', 'Please select your study level');
            isValid = false;
        }

        if (!agreeTerms) {
            this.showError('termsError', 'You must agree to the terms and conditions');
            isValid = false;
        }

        if (!isValid) {
            return;
        }

        // Check if user already exists
        if (this.users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
            this.showError('emailError', 'An account with this email already exists');
            return;
        }

        // Show loading state
        const submitBtn = e.target.querySelector('button[type="submit"]');
        this.setLoadingState(submitBtn, true);

        try {
            // Simulate API delay
            await this.delay(1500);

            // Create new user
            const newUser = {
                id: this.generateUserId(),
                firstName,
                lastName,
                email: email.toLowerCase(),
                password: this.hashPassword(password),
                studyLevel,
                createdAt: new Date().toISOString(),
                tasks: [],
                goals: [],
                reminders: []
            };

            this.users.push(newUser);
            this.saveUsers();

            // Auto-login after signup
            this.currentUser = {
                id: newUser.id,
                email: newUser.email,
                firstName: newUser.firstName,
                lastName: newUser.lastName,
                studyLevel: newUser.studyLevel,
                loginTime: new Date().toISOString()
            };

            localStorage.setItem('currentUser', JSON.stringify(this.currentUser));

            // Show success animation
            this.showSuccess('Account created successfully! Redirecting...');
            
            // Redirect to main app
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);

        } catch (error) {
            this.showError('general', 'Signup failed. Please try again.');
            this.setLoadingState(submitBtn, false);
        }
    }

    // Validation Methods
    validateEmail(input) {
        const email = input.value.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (!email) {
            this.showError(input.id + 'Error', 'Email is required');
            return false;
        }
        
        if (!emailRegex.test(email)) {
            this.showError(input.id + 'Error', 'Please enter a valid email address');
            return false;
        }
        
        this.clearError(input.id + 'Error');
        return true;
    }

    validatePassword(password) {
        if (!password) {
            this.showError('passwordError', 'Password is required');
            return false;
        }
        
        if (password.length < 8) {
            this.showError('passwordError', 'Password must be at least 8 characters long');
            return false;
        }
        
        if (!/(?=.*[a-z])/.test(password)) {
            this.showError('passwordError', 'Password must contain at least one lowercase letter');
            return false;
        }
        
        if (!/(?=.*[A-Z])/.test(password)) {
            this.showError('passwordError', 'Password must contain at least one uppercase letter');
            return false;
        }
        
        if (!/(?=.*\d)/.test(password)) {
            this.showError('passwordError', 'Password must contain at least one number');
            return false;
        }
        
        this.clearError('passwordError');
        return true;
    }

    checkPasswordStrength() {
        const password = document.getElementById('signupPassword').value;
        const strengthFill = document.getElementById('strengthFill');
        const strengthText = document.getElementById('strengthText');
        
        if (!password) {
            strengthFill.className = 'strength-fill';
            strengthText.textContent = 'Password strength';
            return;
        }
        
        let strength = 0;
        let strengthClass = '';
        let strengthLabel = '';
        
        if (password.length >= 8) strength++;
        if (/(?=.*[a-z])/.test(password)) strength++;
        if (/(?=.*[A-Z])/.test(password)) strength++;
        if (/(?=.*\d)/.test(password)) strength++;
        if (/(?=.*[!@#$%^&*])/.test(password)) strength++;
        
        switch (strength) {
            case 0:
            case 1:
                strengthClass = 'weak';
                strengthLabel = 'Weak';
                break;
            case 2:
                strengthClass = 'fair';
                strengthLabel = 'Fair';
                break;
            case 3:
                strengthClass = 'good';
                strengthLabel = 'Good';
                break;
            case 4:
            case 5:
                strengthClass = 'strong';
                strengthLabel = 'Strong';
                break;
        }
        
        strengthFill.className = `strength-fill ${strengthClass}`;
        strengthText.textContent = strengthLabel;
    }

    checkPasswordMatch() {
        const password = document.getElementById('signupPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        if (confirmPassword && password !== confirmPassword) {
            this.showError('confirmPasswordError', 'Passwords do not match');
        } else {
            this.clearError('confirmPasswordError');
        }
    }

    // Utility Methods
    hashPassword(password) {
        // Simple hash function for demo purposes
        // In a real application, use a proper hashing library
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
            const char = password.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return hash.toString();
    }

    showError(errorId, message) {
        const errorElement = document.getElementById(errorId);
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        }
        
        const inputElement = document.getElementById(errorId.replace('Error', ''));
        if (inputElement) {
            inputElement.classList.add('is-invalid');
        }
    }

    clearError(errorId) {
        const errorElement = document.getElementById(errorId);
        if (errorElement) {
            errorElement.style.display = 'none';
        }
        
        const inputElement = document.getElementById(errorId.replace('Error', ''));
        if (inputElement) {
            inputElement.classList.remove('is-invalid');
        }
    }

    clearErrors() {
        const errorElements = document.querySelectorAll('.invalid-feedback');
        errorElements.forEach(element => {
            element.style.display = 'none';
        });
        
        const inputElements = document.querySelectorAll('.form-control, .form-select');
        inputElements.forEach(element => {
            element.classList.remove('is-invalid');
        });
    }

    showSuccess(message) {
        // Create success notification
        const notification = document.createElement('div');
        notification.className = 'alert alert-success alert-dismissible fade show position-fixed';
        notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
        notification.innerHTML = `
            <i class="fas fa-check-circle me-2"></i>
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        document.body.appendChild(notification);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    }

    setLoadingState(button, isLoading) {
        if (isLoading) {
            button.classList.add('loading');
            button.disabled = true;
            button.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Processing...';
        } else {
            button.classList.remove('loading');
            button.disabled = false;
            // Restore original text based on page
            if (window.location.pathname.includes('login.html')) {
                button.innerHTML = '<i class="fas fa-sign-in-alt me-2"></i>Sign In';
            } else {
                button.innerHTML = '<i class="fas fa-user-plus me-2"></i>Create Account';
            }
        }
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Demo Account Functions
    fillDemoCredentials() {
        document.getElementById('loginEmail').value = 'demo@goaltograde.com';
        document.getElementById('loginPassword').value = 'demo123';
    }

    showForgotPassword() {
        const modal = new bootstrap.Modal(document.getElementById('forgotPasswordModal'));
        modal.show();
    }

    resetPassword() {
        const email = document.getElementById('resetEmail').value;
        if (!email) {
            alert('Please enter your email address');
            return;
        }
        
        // Simulate password reset
        alert('Password reset link sent to ' + email);
        const modal = bootstrap.Modal.getInstance(document.getElementById('forgotPasswordModal'));
        modal.hide();
    }

    // Logout function
    logout() {
        localStorage.removeItem('currentUser');
        sessionStorage.removeItem('currentUser');
        this.currentUser = null;
        window.location.href = 'login.html';
    }
}

// Global functions
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const button = input.nextElementSibling;
    const icon = button.querySelector('i');
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.className = 'fas fa-eye-slash';
    } else {
        input.type = 'password';
        icon.className = 'fas fa-eye';
    }
}

function fillDemoCredentials() {
    authManager.fillDemoCredentials();
}

function showForgotPassword() {
    authManager.showForgotPassword();
}

function resetPassword() {
    authManager.resetPassword();
}

// Initialize authentication manager
let authManager;
document.addEventListener('DOMContentLoaded', function() {
    authManager = new AuthManager();
});

