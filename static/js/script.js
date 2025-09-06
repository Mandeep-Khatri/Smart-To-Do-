// Global variables
let tasks = [];
let filteredTasks = [];
let currentFilter = 'all';
let currentSort = 'created-desc';

// DOM elements
const addTaskForm = document.getElementById('add-task-form');
const editTaskForm = document.getElementById('edit-task-form');
const editModal = document.getElementById('edit-modal');
const tasksContainer = document.getElementById('tasks-container');
const noTasksElement = document.getElementById('no-tasks');
const searchInput = document.getElementById('search-input');
const filterButtons = document.querySelectorAll('.filter-btn');
const sortSelect = document.getElementById('sort-select');
const clearCompletedBtn = document.getElementById('clear-completed');
const markAllCompleteBtn = document.getElementById('mark-all-complete');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    loadTasks();
    setupEventListeners();
    requestNotificationPermission();
    startPeriodicChecks();
});

// Event listeners
function setupEventListeners() {
    // Form submissions
    addTaskForm.addEventListener('submit', handleAddTask);
    editTaskForm.addEventListener('submit', handleEditTask);
    
    // Search and filter
    searchInput.addEventListener('input', handleSearch);
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => handleFilter(btn.dataset.filter));
    });
    sortSelect.addEventListener('change', handleSort);
    
    // Bulk actions
    clearCompletedBtn.addEventListener('click', clearCompletedTasks);
    markAllCompleteBtn.addEventListener('click', markAllTasksComplete);
    
    // Modal
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', closeModal);
    });
    
    // Close modal when clicking outside
    editModal.addEventListener('click', (e) => {
        if (e.target === editModal) {
            closeModal();
        }
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);
}

// API Functions
async function loadTasks() {
    try {
        const response = await fetch('/api/tasks');
        if (response.ok) {
            tasks = await response.json();
            applyFiltersAndSort();
            renderTasks();
            updateStats();
        } else {
            showNotification('Failed to load tasks', 'error');
        }
    } catch (error) {
        console.error('Error loading tasks:', error);
        showNotification('Failed to load tasks', 'error');
    }
}

async function createTask(taskData) {
    try {
        const response = await fetch('/api/tasks', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(taskData)
        });
        
        if (response.ok) {
            const result = await response.json();
            showNotification('Task created successfully!', 'success');
            loadTasks();
            return result;
        } else {
            const error = await response.json();
            showNotification(error.error || 'Failed to create task', 'error');
        }
    } catch (error) {
        console.error('Error creating task:', error);
        showNotification('Failed to create task', 'error');
    }
}

async function updateTask(taskId, taskData) {
    try {
        const response = await fetch(`/api/tasks/${taskId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(taskData)
        });
        
        if (response.ok) {
            showNotification('Task updated successfully!', 'success');
            loadTasks();
        } else {
            const error = await response.json();
            showNotification(error.error || 'Failed to update task', 'error');
        }
    } catch (error) {
        console.error('Error updating task:', error);
        showNotification('Failed to update task', 'error');
    }
}

async function deleteTask(taskId) {
    if (!confirm('Are you sure you want to delete this task?')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/tasks/${taskId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            showNotification('Task deleted successfully!', 'success');
            loadTasks();
        } else {
            const error = await response.json();
            showNotification(error.error || 'Failed to delete task', 'error');
        }
    } catch (error) {
        console.error('Error deleting task:', error);
        showNotification('Failed to delete task', 'error');
    }
}

async function toggleTaskStatus(taskId) {
    try {
        const response = await fetch(`/api/tasks/${taskId}/toggle`, {
            method: 'PATCH'
        });
        
        if (response.ok) {
            const result = await response.json();
            showNotification(result.message, 'success');
            loadTasks();
        } else {
            const error = await response.json();
            showNotification(error.error || 'Failed to update task status', 'error');
        }
    } catch (error) {
        console.error('Error toggling task status:', error);
        showNotification('Failed to update task status', 'error');
    }
}

// Form handlers
function handleAddTask(e) {
    e.preventDefault();
    
    const formData = new FormData(addTaskForm);
    const taskData = {
        title: formData.get('title').trim(),
        description: formData.get('description').trim(),
        priority: formData.get('priority'),
        due_date: formData.get('due_date')
    };
    
    if (!taskData.title) {
        showNotification('Task title is required', 'error');
        return;
    }
    
    createTask(taskData);
    addTaskForm.reset();
}

function handleEditTask(e) {
    e.preventDefault();
    
    const formData = new FormData(editTaskForm);
    const taskId = document.getElementById('edit-task-id').value;
    const taskData = {
        title: formData.get('title').trim(),
        description: formData.get('description').trim(),
        priority: formData.get('priority'),
        status: formData.get('status'),
        due_date: formData.get('due_date')
    };
    
    if (!taskData.title) {
        showNotification('Task title is required', 'error');
        return;
    }
    
    updateTask(taskId, taskData);
    closeModal();
}

// Task rendering
function renderTasks() {
    if (filteredTasks.length === 0) {
        tasksContainer.style.display = 'none';
        noTasksElement.style.display = 'block';
        return;
    }
    
    tasksContainer.style.display = 'block';
    noTasksElement.style.display = 'none';
    
    tasksContainer.innerHTML = filteredTasks.map(task => createTaskHTML(task)).join('');
    
    // Add event listeners to task buttons
    document.querySelectorAll('.task-toggle').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const taskId = parseInt(btn.dataset.taskId);
            toggleTaskStatus(taskId);
        });
    });
    
    document.querySelectorAll('.task-edit').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const taskId = parseInt(btn.dataset.taskId);
            openEditModal(taskId);
        });
    });
    
    document.querySelectorAll('.task-delete').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const taskId = parseInt(btn.dataset.taskId);
            deleteTask(taskId);
        });
    });
}

function createTaskHTML(task) {
    const isCompleted = task.status === 'completed';
    const isOverdue = isTaskOverdue(task);
    const isDueToday = isTaskDueToday(task);
    
    const dueDateHTML = task.due_date ? `
        <div class="due-date ${isOverdue ? 'overdue' : isDueToday ? 'due-today' : ''}">
            <i class="fas fa-calendar"></i>
            ${formatDate(task.due_date)}
            ${isOverdue ? ' (Overdue)' : isDueToday ? ' (Due Today)' : ''}
        </div>
    ` : '';
    
    return `
        <div class="task-card ${isCompleted ? 'completed' : ''} ${task.priority}-priority">
            <div class="task-header">
                <div>
                    <h3 class="task-title">${escapeHtml(task.title)}</h3>
                    ${task.description ? `<p class="task-description">${escapeHtml(task.description)}</p>` : ''}
                </div>
                <div class="task-actions">
                    <button class="btn ${isCompleted ? 'btn-secondary' : 'btn-success'} task-toggle" data-task-id="${task.id}">
                        <i class="fas fa-${isCompleted ? 'undo' : 'check'}"></i>
                        ${isCompleted ? 'Undo' : 'Complete'}
                    </button>
                    <button class="btn btn-secondary task-edit" data-task-id="${task.id}">
                        <i class="fas fa-edit"></i>
                        Edit
                    </button>
                    <button class="btn btn-danger task-delete" data-task-id="${task.id}">
                        <i class="fas fa-trash"></i>
                        Delete
                    </button>
                </div>
            </div>
            <div class="task-meta">
                <div class="task-info">
                    <span class="priority-badge priority-${task.priority}">${task.priority}</span>
                    ${dueDateHTML}
                </div>
                <div class="task-date">
                    <small>Created: ${formatDate(task.created_at)}</small>
                </div>
            </div>
        </div>
    `;
}

// Filter and search functions
function handleSearch() {
    applyFiltersAndSort();
    renderTasks();
}

function handleFilter(filter) {
    currentFilter = filter;
    
    // Update active filter button
    filterButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.filter === filter) {
            btn.classList.add('active');
        }
    });
    
    applyFiltersAndSort();
    renderTasks();
    updateTasksTitle();
}

function handleSort() {
    currentSort = sortSelect.value;
    applyFiltersAndSort();
    renderTasks();
}

function applyFiltersAndSort() {
    let filtered = [...tasks];
    
    // Apply search filter
    const searchTerm = searchInput.value.toLowerCase().trim();
    if (searchTerm) {
        filtered = filtered.filter(task => 
            task.title.toLowerCase().includes(searchTerm) ||
            task.description.toLowerCase().includes(searchTerm)
        );
    }
    
    // Apply status filter
    switch (currentFilter) {
        case 'pending':
            filtered = filtered.filter(task => task.status === 'pending');
            break;
        case 'completed':
            filtered = filtered.filter(task => task.status === 'completed');
            break;
        case 'overdue':
            filtered = filtered.filter(task => isTaskOverdue(task));
            break;
        case 'due-today':
            filtered = filtered.filter(task => isTaskDueToday(task));
            break;
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
        switch (currentSort) {
            case 'created-desc':
                return new Date(b.created_at) - new Date(a.created_at);
            case 'created-asc':
                return new Date(a.created_at) - new Date(b.created_at);
            case 'due-date':
                if (!a.due_date && !b.due_date) return 0;
                if (!a.due_date) return 1;
                if (!b.due_date) return -1;
                return new Date(a.due_date) - new Date(b.due_date);
            case 'priority':
                const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
                return priorityOrder[b.priority] - priorityOrder[a.priority];
            case 'title':
                return a.title.localeCompare(b.title);
            default:
                return 0;
        }
    });
    
    filteredTasks = filtered;
}

// Bulk actions
async function clearCompletedTasks() {
    const completedTasks = tasks.filter(task => task.status === 'completed');
    if (completedTasks.length === 0) {
        showNotification('No completed tasks to clear', 'warning');
        return;
    }
    
    if (!confirm(`Are you sure you want to delete ${completedTasks.length} completed task(s)?`)) {
        return;
    }
    
    try {
        const deletePromises = completedTasks.map(task => 
            fetch(`/api/tasks/${task.id}`, { method: 'DELETE' })
        );
        
        await Promise.all(deletePromises);
        showNotification('Completed tasks cleared successfully!', 'success');
        loadTasks();
    } catch (error) {
        console.error('Error clearing completed tasks:', error);
        showNotification('Failed to clear completed tasks', 'error');
    }
}

async function markAllTasksComplete() {
    const pendingTasks = tasks.filter(task => task.status === 'pending');
    if (pendingTasks.length === 0) {
        showNotification('No pending tasks to mark complete', 'warning');
        return;
    }
    
    if (!confirm(`Are you sure you want to mark ${pendingTasks.length} task(s) as complete?`)) {
        return;
    }
    
    try {
        const togglePromises = pendingTasks.map(task => 
            fetch(`/api/tasks/${task.id}/toggle`, { method: 'PATCH' })
        );
        
        await Promise.all(togglePromises);
        showNotification('All tasks marked as complete!', 'success');
        loadTasks();
    } catch (error) {
        console.error('Error marking all tasks complete:', error);
        showNotification('Failed to mark all tasks complete', 'error');
    }
}

// Modal functions
function openEditModal(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    document.getElementById('edit-task-id').value = task.id;
    document.getElementById('edit-task-title').value = task.title;
    document.getElementById('edit-task-description').value = task.description || '';
    document.getElementById('edit-task-priority').value = task.priority;
    document.getElementById('edit-task-status').value = task.status;
    document.getElementById('edit-task-due-date').value = task.due_date || '';
    
    editModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    editModal.style.display = 'none';
    document.body.style.overflow = 'auto';
    editTaskForm.reset();
}

// Utility functions
function updateStats() {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.status === 'completed').length;
    const pendingTasks = totalTasks - completedTasks;
    
    document.getElementById('total-tasks').textContent = totalTasks;
    document.getElementById('completed-tasks').textContent = completedTasks;
    document.getElementById('pending-tasks').textContent = pendingTasks;
}

function updateTasksTitle() {
    const titles = {
        'all': 'All Tasks',
        'pending': 'Pending Tasks',
        'completed': 'Completed Tasks',
        'overdue': 'Overdue Tasks',
        'due-today': 'Tasks Due Today'
    };
    
    document.getElementById('tasks-title').textContent = titles[currentFilter] || 'All Tasks';
}

function isTaskOverdue(task) {
    if (!task.due_date || task.status === 'completed') return false;
    return new Date(task.due_date) < new Date();
}

function isTaskDueToday(task) {
    if (!task.due_date || task.status === 'completed') return false;
    const today = new Date().toISOString().split('T')[0];
    return task.due_date === today;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Notification system
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;
    
    const container = document.getElementById('notification-container');
    container.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
    
    // Close button functionality
    notification.querySelector('.notification-close').addEventListener('click', () => {
        notification.remove();
    });
}

// Notification API
function requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
}

function showBrowserNotification(title, options = {}) {
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, {
            icon: '/static/favicon.ico',
            badge: '/static/favicon.ico',
            ...options
        });
    }
}

// Periodic checks for overdue tasks
function startPeriodicChecks() {
    // Check every 5 minutes
    setInterval(checkOverdueTasks, 5 * 60 * 1000);
    
    // Initial check
    setTimeout(checkOverdueTasks, 1000);
}

async function checkOverdueTasks() {
    try {
        const response = await fetch('/api/tasks/overdue');
        if (response.ok) {
            const overdueTasks = await response.json();
            if (overdueTasks.length > 0) {
                showBrowserNotification(
                    'Overdue Tasks',
                    {
                        body: `You have ${overdueTasks.length} overdue task(s)`,
                        tag: 'overdue-tasks'
                    }
                );
            }
        }
    } catch (error) {
        console.error('Error checking overdue tasks:', error);
    }
}

// Keyboard shortcuts
function handleKeyboardShortcuts(e) {
    // Ctrl/Cmd + N: Add new task
    if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        document.getElementById('task-title').focus();
    }
    
    // Escape: Close modal
    if (e.key === 'Escape') {
        closeModal();
    }
    
    // Ctrl/Cmd + F: Focus search
    if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        searchInput.focus();
    }
}
