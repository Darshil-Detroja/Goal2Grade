// Smart Study Planner - JavaScript functionality

class StudyPlanner {
    constructor() {
        this.currentUser = this.getCurrentUser();
        this.tasks = this.loadFromStorage('tasks') || [];
        this.goals = this.loadFromStorage('goals') || [];
        this.reminders = this.loadFromStorage('reminders') || [];
        this.currentFilter = 'all';
        
        this.init();
    }

    init() {
        // Check if user is logged in
        if (!this.currentUser) {
            window.location.href = 'login.html';
            return;
        }
        
        this.setupEventListeners();
        this.updateUserInfo();
        this.updateDashboard();
        this.updateTasksList();
        this.updateGoalsList();
        this.updateTimeline();
        this.checkReminders();
        this.setupTabNavigation();
    }

    setupEventListeners() {
        // Task filter buttons
        document.querySelectorAll('input[name="taskFilter"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.currentFilter = e.target.id.replace('TasksFilter', '').replace('allTasks', 'all');
                this.updateTasksList();
            });
        });

        // Form submissions
        document.getElementById('addTaskForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addTask();
        });

        document.getElementById('addGoalForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addGoal();
        });

        document.getElementById('addReminderForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addReminder();
        });
    }

    setupTabNavigation() {
        const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
        const tabContents = document.querySelectorAll('.tab-content');

        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                
                // Remove active class from all links
                navLinks.forEach(l => l.classList.remove('active'));
                // Add active class to clicked link
                link.classList.add('active');
                
                // Hide all tab contents
                tabContents.forEach(content => content.classList.add('d-none'));
                
                // Show selected tab content
                const targetTab = link.getAttribute('href').substring(1);
                const targetContent = document.getElementById(targetTab);
                if (targetContent) {
                    targetContent.classList.remove('d-none');
                }
            });
        });
    }

    // Task Management
    addTask() {
        const title = document.getElementById('taskTitle').value;
        const description = document.getElementById('taskDescription').value;
        const dueDate = document.getElementById('taskDueDate').value;
        const priority = document.getElementById('taskPriority').value;
        const subject = document.getElementById('taskSubject').value;

        if (!title || !dueDate) {
            this.showAlert('Please fill in all required fields', 'warning');
            return;
        }

        const task = {
            id: Date.now(),
            title,
            description,
            dueDate: new Date(dueDate),
            priority,
            subject,
            completed: false,
            createdAt: new Date()
        };

        this.tasks.push(task);
        this.saveToStorage('tasks', this.tasks);
        this.updateDashboard();
        this.updateTasksList();
        this.updateTimeline();
        this.clearTaskForm();
        this.hideModal('addTaskModal');
        this.showAlert('Task added successfully!', 'success');
    }

    toggleTask(id) {
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            task.completed = !task.completed;
            this.saveToStorage('tasks', this.tasks);
            this.updateDashboard();
            this.updateTasksList();
            this.updateTimeline();
        }
    }

    deleteTask(id) {
        if (confirm('Are you sure you want to delete this task?')) {
            this.tasks = this.tasks.filter(t => t.id !== id);
            this.saveToStorage('tasks', this.tasks);
            this.updateDashboard();
            this.updateTasksList();
            this.updateTimeline();
            this.showAlert('Task deleted successfully!', 'success');
        }
    }

    // Goal Management
    addGoal() {
        const title = document.getElementById('goalTitle').value;
        const description = document.getElementById('goalDescription').value;
        const targetDate = document.getElementById('goalTargetDate').value;
        const progress = parseInt(document.getElementById('goalProgress').value);

        if (!title || !targetDate) {
            this.showAlert('Please fill in all required fields', 'warning');
            return;
        }

        const goal = {
            id: Date.now(),
            title,
            description,
            targetDate: new Date(targetDate),
            progress,
            createdAt: new Date()
        };

        this.goals.push(goal);
        this.saveToStorage('goals', this.goals);
        this.updateDashboard();
        this.updateGoalsList();
        this.updateTimeline();
        this.clearGoalForm();
        this.hideModal('addGoalModal');
        this.showAlert('Goal added successfully!', 'success');
    }

    updateGoalProgress(id, progress) {
        const goal = this.goals.find(g => g.id === id);
        if (goal) {
            goal.progress = Math.max(0, Math.min(100, progress));
            this.saveToStorage('goals', this.goals);
            this.updateDashboard();
            this.updateGoalsList();
            this.updateTimeline();
        }
    }

    deleteGoal(id) {
        if (confirm('Are you sure you want to delete this goal?')) {
            this.goals = this.goals.filter(g => g.id !== id);
            this.saveToStorage('goals', this.goals);
            this.updateDashboard();
            this.updateGoalsList();
            this.updateTimeline();
            this.showAlert('Goal deleted successfully!', 'success');
        }
    }

    // Reminder Management
    addReminder() {
        const title = document.getElementById('reminderTitle').value;
        const dateTime = document.getElementById('reminderDateTime').value;
        const message = document.getElementById('reminderMessage').value;

        if (!title || !dateTime) {
            this.showAlert('Please fill in all required fields', 'warning');
            return;
        }

        const reminder = {
            id: Date.now(),
            title,
            message,
            dateTime: new Date(dateTime),
            createdAt: new Date()
        };

        this.reminders.push(reminder);
        this.saveToStorage('reminders', this.reminders);
        this.clearReminderForm();
        this.hideModal('addReminderModal');
        this.showAlert('Reminder added successfully!', 'success');
    }

    checkReminders() {
        const now = new Date();
        this.reminders.forEach(reminder => {
            const reminderTime = new Date(reminder.dateTime);
            if (reminderTime <= now && !reminder.triggered) {
                this.showReminder(reminder);
                reminder.triggered = true;
            }
        });
        this.saveToStorage('reminders', this.reminders);
    }

    showReminder(reminder) {
        const alertDiv = document.createElement('div');
        alertDiv.className = 'alert alert-warning alert-dismissible fade show';
        alertDiv.innerHTML = `
            <i class="fas fa-bell me-2"></i>
            <strong>${reminder.title}</strong><br>
            ${reminder.message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        const container = document.querySelector('.container-fluid');
        container.insertBefore(alertDiv, container.firstChild);
        
        // Auto-dismiss after 10 seconds
        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.remove();
            }
        }, 10000);
    }

    // Dashboard Updates
    updateDashboard() {
        this.updateWelcomeMessage();
        this.updateDailyQuote();
        this.updateStatistics();
        this.updateTodayTasks();
        this.updateUpcomingDeadlines();
        this.updateProgressOverview();
    }

    updateStatistics() {
        const totalTasks = this.tasks.length;
        const completedTasks = this.tasks.filter(t => t.completed).length;
        const pendingTasks = totalTasks - completedTasks;
        const totalGoals = this.goals.length;

        document.getElementById('totalTasks').textContent = totalTasks;
        document.getElementById('completedTasks').textContent = completedTasks;
        document.getElementById('pendingTasks').textContent = pendingTasks;
        document.getElementById('totalGoals').textContent = totalGoals;

        // Update footer statistics
        this.updateFooterStats(totalTasks, completedTasks, totalGoals);
    }

    updateFooterStats(totalTasks, completedTasks, totalGoals) {
        const footerTotalTasks = document.getElementById('footerTotalTasks');
        const footerCompletedTasks = document.getElementById('footerCompletedTasks');
        const footerGoals = document.getElementById('footerGoals');

        if (footerTotalTasks) {
            this.animateNumber(footerTotalTasks, parseInt(footerTotalTasks.textContent) || 0, totalTasks);
        }
        if (footerCompletedTasks) {
            this.animateNumber(footerCompletedTasks, parseInt(footerCompletedTasks.textContent) || 0, completedTasks);
        }
        if (footerGoals) {
            this.animateNumber(footerGoals, parseInt(footerGoals.textContent) || 0, totalGoals);
        }
    }

    animateNumber(element, start, end) {
        const duration = 1000;
        const startTime = performance.now();
        
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const current = Math.floor(start + (end - start) * this.easeOutCubic(progress));
            element.textContent = current;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
    }

    easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }

    updateTodayTasks() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const todayTasks = this.tasks.filter(task => {
            const taskDate = new Date(task.dueDate);
            return taskDate >= today && taskDate < tomorrow && !task.completed;
        });

        const container = document.getElementById('todayTasks');
        if (todayTasks.length === 0) {
            container.innerHTML = '<p class="text-muted">No tasks for today</p>';
        } else {
            container.innerHTML = todayTasks.map(task => `
                <div class="task-item priority-${task.priority}">
                    <div class="d-flex justify-content-between align-items-start">
                        <div>
                            <h6 class="task-title mb-1">${task.title}</h6>
                            <small class="text-muted">${task.subject} • ${this.formatTime(task.dueDate)}</small>
                        </div>
                        <div class="btn-group btn-group-sm">
                            <button class="btn btn-outline-success btn-sm" onclick="planner.toggleTask(${task.id})">
                                <i class="fas fa-check"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `).join('');
        }
    }

    updateUpcomingDeadlines() {
        const now = new Date();
        const upcomingTasks = this.tasks
            .filter(task => !task.completed && new Date(task.dueDate) > now)
            .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
            .slice(0, 5);

        const container = document.getElementById('upcomingDeadlines');
        if (upcomingTasks.length === 0) {
            container.innerHTML = '<p class="text-muted">No upcoming deadlines</p>';
        } else {
            container.innerHTML = upcomingTasks.map(task => {
                const isOverdue = new Date(task.dueDate) < new Date();
                const timeUntil = this.getTimeUntil(task.dueDate);
                return `
                    <div class="task-item priority-${task.priority} ${isOverdue ? 'overdue' : ''}">
                        <div class="d-flex justify-content-between align-items-start">
                            <div>
                                <h6 class="task-title mb-1">${task.title}</h6>
                                <small class="text-muted">${task.subject} • ${timeUntil}</small>
                            </div>
                            <span class="badge bg-${isOverdue ? 'danger' : 'warning'}">${this.formatDate(task.dueDate)}</span>
                        </div>
                    </div>
                `;
            }).join('');
        }
    }

    updateProgressOverview() {
        const totalTasks = this.tasks.length;
        const completedTasks = this.tasks.filter(t => t.completed).length;
        const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

        const progressBar = document.getElementById('overallProgress');
        const progressText = document.getElementById('progressText');
        
        progressBar.style.width = `${progress}%`;
        progressText.textContent = `${progress}%`;
    }

    // Tasks List
    updateTasksList() {
        let filteredTasks = this.tasks;
        
        if (this.currentFilter === 'pending') {
            filteredTasks = this.tasks.filter(task => !task.completed);
        } else if (this.currentFilter === 'completed') {
            filteredTasks = this.tasks.filter(task => task.completed);
        }

        const container = document.getElementById('tasksList');
        if (filteredTasks.length === 0) {
            container.innerHTML = '<p class="text-muted">No tasks found</p>';
        } else {
            container.innerHTML = filteredTasks.map(task => `
                <div class="task-item priority-${task.priority} ${task.completed ? 'completed' : ''}">
                    <div class="d-flex justify-content-between align-items-start">
                        <div class="flex-grow-1">
                            <h6 class="task-title mb-1">${task.title}</h6>
                            <p class="text-muted mb-2">${task.description}</p>
                            <div class="d-flex align-items-center">
                                <span class="badge bg-${this.getPriorityColor(task.priority)} me-2">${task.priority.toUpperCase()}</span>
                                <span class="badge bg-secondary me-2">${task.subject}</span>
                                <small class="text-muted">Due: ${this.formatDateTime(task.dueDate)}</small>
                            </div>
                        </div>
                        <div class="btn-group btn-group-sm">
                            <button class="btn btn-outline-${task.completed ? 'warning' : 'success'} btn-sm" 
                                    onclick="planner.toggleTask(${task.id})" 
                                    title="${task.completed ? 'Mark as pending' : 'Mark as completed'}">
                                <i class="fas fa-${task.completed ? 'undo' : 'check'}"></i>
                            </button>
                            <button class="btn btn-outline-danger btn-sm" onclick="planner.deleteTask(${task.id})" title="Delete task">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `).join('');
        }
    }

    // Goals List
    updateGoalsList() {
        const container = document.getElementById('goalsList');
        if (this.goals.length === 0) {
            container.innerHTML = '<p class="text-muted">No goals set</p>';
        } else {
            container.innerHTML = this.goals.map(goal => `
                <div class="goal-item">
                    <div class="d-flex justify-content-between align-items-start mb-3">
                        <div>
                            <h5 class="mb-1">${goal.title}</h5>
                            <p class="text-muted mb-2">${goal.description}</p>
                            <small class="text-muted">Target: ${this.formatDate(goal.targetDate)}</small>
                        </div>
                        <div class="btn-group btn-group-sm">
                            <button class="btn btn-outline-danger btn-sm" onclick="planner.deleteGoal(${goal.id})" title="Delete goal">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                    <div class="goal-progress mb-2">
                        <div class="goal-progress-bar" style="width: ${goal.progress}%"></div>
                    </div>
                    <div class="d-flex justify-content-between align-items-center">
                        <span class="badge bg-primary">${goal.progress}% Complete</span>
                        <div class="btn-group btn-group-sm">
                            <button class="btn btn-outline-primary btn-sm" onclick="planner.updateGoalProgress(${goal.id}, ${Math.max(0, goal.progress - 10)})">
                                <i class="fas fa-minus"></i>
                            </button>
                            <button class="btn btn-outline-primary btn-sm" onclick="planner.updateGoalProgress(${goal.id}, ${Math.min(100, goal.progress + 10)})">
                                <i class="fas fa-plus"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `).join('');
        }
    }

    // Timeline
    updateTimeline() {
        const allItems = [
            ...this.tasks.map(task => ({ ...task, type: 'task' })),
            ...this.goals.map(goal => ({ ...goal, type: 'goal' }))
        ].sort((a, b) => {
            const dateA = a.type === 'task' ? a.dueDate : a.targetDate;
            const dateB = b.type === 'task' ? b.dueDate : b.targetDate;
            return new Date(dateA) - new Date(dateB);
        });

        const container = document.getElementById('timelineView');
        if (allItems.length === 0) {
            container.innerHTML = '<p class="text-muted">No timeline data available</p>';
        } else {
            container.innerHTML = allItems.map(item => {
                const isOverdue = new Date(item.type === 'task' ? item.dueDate : item.targetDate) < new Date();
                const isCompleted = item.type === 'task' ? item.completed : item.progress === 100;
                
                return `
                    <div class="timeline-item ${isCompleted ? 'completed' : ''} ${isOverdue && !isCompleted ? 'overdue' : ''}">
                        <div class="timeline-content">
                            <div class="d-flex justify-content-between align-items-start">
                                <div>
                                    <h6 class="mb-1">
                                        <i class="fas fa-${item.type === 'task' ? 'tasks' : 'target'} me-2"></i>
                                        ${item.title}
                                    </h6>
                                    <p class="text-muted mb-2">${item.description}</p>
                                    <div class="d-flex align-items-center">
                                        <span class="badge bg-${item.type === 'task' ? 'primary' : 'success'} me-2">
                                            ${item.type === 'task' ? 'Task' : 'Goal'}
                                        </span>
                                        ${item.type === 'task' ? 
                                            `<span class="badge bg-${this.getPriorityColor(item.priority)} me-2">${item.priority.toUpperCase()}</span>` : 
                                            `<span class="badge bg-info me-2">${item.progress}% Complete</span>`
                                        }
                                        <small class="text-muted">
                                            ${item.type === 'task' ? 
                                                `Due: ${this.formatDateTime(item.dueDate)}` : 
                                                `Target: ${this.formatDate(item.targetDate)}`
                                            }
                                        </small>
                                    </div>
                                </div>
                                ${item.type === 'task' ? 
                                    `<div class="btn-group btn-group-sm">
                                        <button class="btn btn-outline-${item.completed ? 'warning' : 'success'} btn-sm" 
                                                onclick="planner.toggleTask(${item.id})" 
                                                title="${item.completed ? 'Mark as pending' : 'Mark as completed'}">
                                            <i class="fas fa-${item.completed ? 'undo' : 'check'}"></i>
                                        </button>
                                    </div>` : ''
                                }
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
        }
    }

    // Utility Functions
    formatDate(date) {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    formatDateTime(date) {
        return new Date(date).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    formatTime(date) {
        return new Date(date).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    getTimeUntil(date) {
        const now = new Date();
        const target = new Date(date);
        const diff = target - now;
        
        if (diff < 0) return 'Overdue';
        
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        
        if (days > 0) return `${days} day${days > 1 ? 's' : ''} left`;
        if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} left`;
        return 'Due soon';
    }

    getPriorityColor(priority) {
        const colors = {
            'low': 'info',
            'medium': 'warning',
            'high': 'danger'
        };
        return colors[priority] || 'secondary';
    }

    clearTaskForm() {
        document.getElementById('addTaskForm').reset();
    }

    clearGoalForm() {
        document.getElementById('addGoalForm').reset();
    }

    clearReminderForm() {
        document.getElementById('addReminderForm').reset();
    }

    hideModal(modalId) {
        const modal = bootstrap.Modal.getInstance(document.getElementById(modalId));
        if (modal) {
            modal.hide();
        }
    }

    showAlert(message, type) {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        const container = document.querySelector('.container-fluid');
        container.insertBefore(alertDiv, container.firstChild);
        
        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.remove();
            }
        }, 5000);
    }

    // Authentication Methods
    getCurrentUser() {
        const user = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
        return user ? JSON.parse(user) : null;
    }

    updateUserInfo() {
        if (this.currentUser) {
            const userNameElement = document.getElementById('userName');
            if (userNameElement) {
                userNameElement.textContent = `${this.currentUser.firstName} ${this.currentUser.lastName}`;
            }
        }
    }

    // Daily Quotes and Welcome Messages
    updateWelcomeMessage() {
        const currentHour = new Date().getHours();
        const userName = this.currentUser ? this.currentUser.firstName : 'Student';
        
        let greeting, icon, message, timeClass;
        
        if (currentHour >= 5 && currentHour < 12) {
            greeting = 'Good Morning!';
            icon = 'fas fa-sun';
            message = 'Ready to tackle today\'s study goals? Let\'s make this day productive!';
            timeClass = 'morning';
        } else if (currentHour >= 12 && currentHour < 17) {
            greeting = 'Good Afternoon!';
            icon = 'fas fa-sun';
            message = 'Keep up the great work! You\'re making excellent progress today.';
            timeClass = 'afternoon';
        } else if (currentHour >= 17 && currentHour < 21) {
            greeting = 'Good Evening!';
            icon = 'fas fa-moon';
            message = 'Great job today! Time to wrap up and plan for tomorrow.';
            timeClass = 'evening';
        } else {
            greeting = 'Good Night!';
            icon = 'fas fa-moon';
            message = 'Don\'t forget to rest! A well-rested mind is a productive mind.';
            timeClass = 'night';
        }
        
        // Update welcome elements
        const greetingElement = document.getElementById('welcomeGreeting');
        const nameElement = document.getElementById('welcomeName');
        const messageElement = document.getElementById('welcomeMessage');
        
        if (greetingElement) {
            greetingElement.innerHTML = `<i class="${icon} me-2"></i>${greeting}`;
            greetingElement.className = `welcome-greeting ${timeClass}`;
        }
        
        if (nameElement) {
            nameElement.textContent = `Welcome back, ${userName}!`;
        }
        
        if (messageElement) {
            messageElement.textContent = message;
        }
    }

    updateDailyQuote() {
        const quotes = [
            {
                text: "The future belongs to those who believe in the beauty of their dreams.",
                author: "Eleanor Roosevelt"
            },
            {
                text: "Education is the most powerful weapon which you can use to change the world.",
                author: "Nelson Mandela"
            },
            {
                text: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
                author: "Winston Churchill"
            },
            {
                text: "The only way to do great work is to love what you do.",
                author: "Steve Jobs"
            },
            {
                text: "Don't watch the clock; do what it does. Keep going.",
                author: "Sam Levenson"
            },
            {
                text: "The expert in anything was once a beginner.",
                author: "Helen Hayes"
            },
            {
                text: "Learning never exhausts the mind.",
                author: "Leonardo da Vinci"
            },
            {
                text: "Knowledge is power, but enthusiasm pulls the switch.",
                author: "Steve Dahl"
            },
            {
                text: "The capacity to learn is a gift; the ability to learn is a skill; the willingness to learn is a choice.",
                author: "Brian Herbert"
            },
            {
                text: "Study hard, for the well is deep, and our brains are shallow.",
                author: "Richard Baxter"
            },
            {
                text: "The beautiful thing about learning is that no one can take it away from you.",
                author: "B.B. King"
            },
            {
                text: "Live as if you were to die tomorrow. Learn as if you were to live forever.",
                author: "Mahatma Gandhi"
            },
            {
                text: "The more that you read, the more things you will know. The more that you learn, the more places you'll go.",
                author: "Dr. Seuss"
            },
            {
                text: "Education is not preparation for life; education is life itself.",
                author: "John Dewey"
            },
            {
                text: "The only person who is educated is the one who has learned how to learn and change.",
                author: "Carl Rogers"
            }
        ];
        
        // Get today's date to ensure same quote for the day
        const today = new Date();
        const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
        const quoteIndex = dayOfYear % quotes.length;
        const selectedQuote = quotes[quoteIndex];
        
        // Update quote elements
        const quoteElement = document.getElementById('dailyQuote');
        const authorElement = document.getElementById('quoteAuthor');
        
        if (quoteElement) {
            quoteElement.textContent = `"${selectedQuote.text}"`;
        }
        
        if (authorElement) {
            authorElement.textContent = `- ${selectedQuote.author}`;
        }
    }

    // Local Storage
    saveToStorage(key, data) {
        localStorage.setItem(key, JSON.stringify(data));
    }

    loadFromStorage(key) {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    }
}

// Global functions for onclick handlers
function addTask() {
    planner.addTask();
}

function addGoal() {
    planner.addGoal();
}

function addReminder() {
    planner.addReminder();
}

// Global authentication functions
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('currentUser');
        sessionStorage.removeItem('currentUser');
        window.location.href = 'login.html';
    }
}

function showProfile() {
    if (planner && planner.currentUser) {
        alert(`Profile Information:\n\nName: ${planner.currentUser.firstName} ${planner.currentUser.lastName}\nEmail: ${planner.currentUser.email}\nStudy Level: ${planner.currentUser.studyLevel}\nMember Since: ${new Date(planner.currentUser.loginTime).toLocaleDateString()}`);
    }
}

function showSettings() {
    alert('Settings feature coming soon!');
}

// Footer and advanced functionality
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

function showQuickAdd() {
    // Show quick add modal or dropdown
    const quickAddModal = document.createElement('div');
    quickAddModal.className = 'modal fade';
    quickAddModal.innerHTML = `
        <div class="modal-dialog modal-sm">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Quick Add</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body text-center">
                    <div class="d-grid gap-2">
                        <button class="btn btn-primary" onclick="planner.showAddTaskModal()">
                            <i class="fas fa-plus me-2"></i>Add Task
                        </button>
                        <button class="btn btn-success" onclick="planner.showAddGoalModal()">
                            <i class="fas fa-target me-2"></i>Add Goal
                        </button>
                        <button class="btn btn-info" onclick="planner.showAddReminderModal()">
                            <i class="fas fa-bell me-2"></i>Add Reminder
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(quickAddModal);
    const modal = new bootstrap.Modal(quickAddModal);
    modal.show();
    
    quickAddModal.addEventListener('hidden.bs.modal', () => {
        quickAddModal.remove();
    });
}

// Add animation classes to elements
function addAnimations() {
    // Add staggered animations to cards
    const cards = document.querySelectorAll('.card');
    cards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
        card.classList.add('animate-fadeInUp');
    });
    
    // Add floating animation to logo
    const logo = document.querySelector('.navbar-brand i');
    if (logo) {
        logo.classList.add('animate-float');
    }
    
    // Add pulse animation to progress bars
    const progressBars = document.querySelectorAll('.progress-bar');
    progressBars.forEach(bar => {
        bar.classList.add('animate-pulse');
    });
}

// Initialize advanced features
function initializeAdvancedFeatures() {
    // Set last updated date
    const lastUpdated = document.getElementById('lastUpdated');
    if (lastUpdated) {
        lastUpdated.textContent = new Date().toLocaleDateString();
    }
    
    // Add scroll event listener for floating buttons
    let lastScrollTop = 0;
    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const fabMain = document.querySelector('.fab-main');
        
        if (fabMain) {
            if (scrollTop > lastScrollTop && scrollTop > 100) {
                // Scrolling down
                fabMain.style.transform = 'translateY(100px)';
            } else {
                // Scrolling up
                fabMain.style.transform = 'translateY(0)';
            }
        }
        
        lastScrollTop = scrollTop;
    });
    
    // Add intersection observer for animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-fadeInUp');
            }
        });
    }, observerOptions);
    
    // Observe all cards and sections
    document.querySelectorAll('.card, .footer-section').forEach(el => {
        observer.observe(el);
    });
}

// Enhanced StudyPlanner methods
StudyPlanner.prototype.showAddTaskModal = function() {
    const modal = new bootstrap.Modal(document.getElementById('addTaskModal'));
    modal.show();
};

StudyPlanner.prototype.showAddGoalModal = function() {
    const modal = new bootstrap.Modal(document.getElementById('addGoalModal'));
    modal.show();
};

StudyPlanner.prototype.showAddReminderModal = function() {
    const modal = new bootstrap.Modal(document.getElementById('addReminderModal'));
    modal.show();
};

// Initialize the application
let planner;
document.addEventListener('DOMContentLoaded', function() {
    planner = new StudyPlanner();
    
    // Initialize advanced features
    initializeAdvancedFeatures();
    addAnimations();
    
    // Check for reminders every minute
    setInterval(() => {
        if (planner) {
            planner.checkReminders();
        }
    }, 60000);
});
