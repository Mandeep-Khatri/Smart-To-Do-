# Smart To-Do List

A modern, feature-rich task management application built with Flask, SQLite, and vanilla JavaScript.
## Features

### Core Functionality
- ✅ **CRUD Operations**: Create, Read, Update, Delete tasks
- 📊 **Task Management**: Add, edit, complete, and delete tasks
- 🎯 **Priority System**: High, Medium, Low priority levels
- 📅 **Due Dates**: Set deadlines with overdue detection
- 🔍 **Search & Filter**: Find tasks by title, description, or status
- 📱 **Responsive Design**: Works on desktop, tablet, and mobile

### Advanced Features
- 🔔 **Notification API**: Browser notifications for overdue tasks
- 📈 **Statistics Dashboard**: Track total, completed, and pending tasks
- ⚡ **Real-time Updates**: Instant UI updates without page refresh
- 🎨 **Modern UI**: Beautiful purple gradient theme with glass morphism
- ⌨️ **Keyboard Shortcuts**: Quick actions with keyboard
- 🗂️ **Smart Sorting**: Sort by date, priority, title, or creation time

### Task Management
- **Status Tracking**: Pending and Completed states
- **Bulk Actions**: Mark all complete, clear completed tasks
- **Overdue Detection**: Automatic identification of overdue tasks
- **Due Today**: Quick filter for tasks due today
- **Persistent Storage**: SQLite database for data persistence

## Technology Stack

- **Backend**: Flask (Python web framework)
- **Database**: SQLite (lightweight, file-based database)
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **APIs**: Notification API for browser notifications
- **Styling**: Modern CSS with purple gradients and glass morphism

## Installation & Setup

### Prerequisites
- Python 3.7 or higher
- pip (Python package installer)

### Installation Steps

1. **Clone or download the project**
   ```bash
   cd Smart-To-Do-
   ```

2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Run the application**
   ```bash
   python app.py
   ```

4. **Open your browser**
   Navigate to `http://localhost:5001` (or `http://localhost:5000` if port 5000 is available)

## Usage

### Adding Tasks
1. Fill in the task title (required)
2. Add an optional description
3. Set priority level (Low, Medium, High)
4. Set an optional due date
5. Click "Add Task"

### Managing Tasks
- **Complete/Undo**: Click the Complete/Undo button
- **Edit**: Click Edit to modify task details
- **Delete**: Click Delete to remove a task
- **Search**: Use the search box to find specific tasks
- **Filter**: Use filter buttons to view tasks by status
- **Sort**: Use the dropdown to sort tasks by different criteria

### Keyboard Shortcuts
- `Ctrl/Cmd + N`: Focus on new task title field
- `Ctrl/Cmd + F`: Focus on search box
- `Escape`: Close modal dialogs

### Notifications
- Browser notifications for overdue tasks (requires permission)
- In-app notifications for all actions
- Automatic periodic checks for overdue tasks

## API Endpoints

### Tasks
- `GET /api/tasks` - Get all tasks
- `POST /api/tasks` - Create a new task
- `PUT /api/tasks/<id>` - Update a task
- `DELETE /api/tasks/<id>` - Delete a task
- `PATCH /api/tasks/<id>/toggle` - Toggle task status

### Special Queries
- `GET /api/tasks/overdue` - Get overdue tasks
- `GET /api/tasks/due-today` - Get tasks due today

## Database Schema

```sql
CREATE TABLE tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    priority TEXT DEFAULT 'medium',
    status TEXT DEFAULT 'pending',
    due_date TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Features in Detail

### Priority System
- **High Priority**: Red border, urgent tasks
- **Medium Priority**: Yellow border, normal tasks  
- **Low Priority**: Green border, low urgency tasks

### Due Date Management
- Visual indicators for overdue (red) and due today (yellow)
- Automatic overdue detection
- Browser notifications for overdue tasks

### Search & Filter
- **All**: Show all tasks
- **Pending**: Show only incomplete tasks
- **Completed**: Show only completed tasks
- **Overdue**: Show only overdue tasks
- **Due Today**: Show tasks due today

### Responsive Design
- Mobile-first approach
- Touch-friendly interface
- Optimized for all screen sizes

## Browser Compatibility

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the MIT License.

## Future Enhancements

- [ ] Task categories/tags
- [ ] File attachments
- [ ] Task sharing/collaboration
- [ ] Data export/import
- [ ] Dark mode theme
- [ ] Task templates
- [ ] Recurring tasks
- [ ] Time tracking
- [ ] Progress charts
