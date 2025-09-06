from flask import Flask, render_template, request, jsonify, redirect, url_for
import sqlite3
import os
from datetime import datetime, timedelta
import json

app = Flask(__name__)

# Database configuration
DATABASE = 'todo.db'

def init_db():
    """Initialize the database with tasks table"""
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT,
            priority TEXT DEFAULT 'medium',
            status TEXT DEFAULT 'pending',
            due_date TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    conn.commit()
    conn.close()

def get_db_connection():
    """Get database connection"""
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

@app.route('/')
def index():
    """Main page"""
    return render_template('index.html')

@app.route('/api/tasks', methods=['GET'])
def get_tasks():
    """Get all tasks"""
    conn = get_db_connection()
    tasks = conn.execute('SELECT * FROM tasks ORDER BY created_at DESC').fetchall()
    conn.close()
    
    tasks_list = []
    for task in tasks:
        tasks_list.append({
            'id': task['id'],
            'title': task['title'],
            'description': task['description'],
            'priority': task['priority'],
            'status': task['status'],
            'due_date': task['due_date'],
            'created_at': task['created_at'],
            'updated_at': task['updated_at']
        })
    
    return jsonify(tasks_list)

@app.route('/api/tasks', methods=['POST'])
def create_task():
    """Create a new task"""
    data = request.get_json()
    
    title = data.get('title', '').strip()
    description = data.get('description', '').strip()
    priority = data.get('priority', 'medium')
    due_date = data.get('due_date', '')
    
    if not title:
        return jsonify({'error': 'Title is required'}), 400
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('''
        INSERT INTO tasks (title, description, priority, due_date)
        VALUES (?, ?, ?, ?)
    ''', (title, description, priority, due_date))
    
    task_id = cursor.lastrowid
    conn.commit()
    conn.close()
    
    return jsonify({'id': task_id, 'message': 'Task created successfully'}), 201

@app.route('/api/tasks/<int:task_id>', methods=['PUT'])
def update_task(task_id):
    """Update a task"""
    data = request.get_json()
    
    title = data.get('title', '').strip()
    description = data.get('description', '').strip()
    priority = data.get('priority', 'medium')
    status = data.get('status', 'pending')
    due_date = data.get('due_date', '')
    
    if not title:
        return jsonify({'error': 'Title is required'}), 400
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('''
        UPDATE tasks 
        SET title = ?, description = ?, priority = ?, status = ?, due_date = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
    ''', (title, description, priority, status, due_date, task_id))
    
    if cursor.rowcount == 0:
        conn.close()
        return jsonify({'error': 'Task not found'}), 404
    
    conn.commit()
    conn.close()
    
    return jsonify({'message': 'Task updated successfully'})

@app.route('/api/tasks/<int:task_id>', methods=['DELETE'])
def delete_task(task_id):
    """Delete a task"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('DELETE FROM tasks WHERE id = ?', (task_id,))
    
    if cursor.rowcount == 0:
        conn.close()
        return jsonify({'error': 'Task not found'}), 404
    
    conn.commit()
    conn.close()
    
    return jsonify({'message': 'Task deleted successfully'})

@app.route('/api/tasks/<int:task_id>/toggle', methods=['PATCH'])
def toggle_task_status(task_id):
    """Toggle task status between pending and completed"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Get current status
    cursor.execute('SELECT status FROM tasks WHERE id = ?', (task_id,))
    task = cursor.fetchone()
    
    if not task:
        conn.close()
        return jsonify({'error': 'Task not found'}), 404
    
    current_status = task['status']
    new_status = 'completed' if current_status == 'pending' else 'pending'
    
    cursor.execute('''
        UPDATE tasks 
        SET status = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
    ''', (new_status, task_id))
    
    conn.commit()
    conn.close()
    
    return jsonify({'status': new_status, 'message': f'Task marked as {new_status}'})

@app.route('/api/tasks/overdue', methods=['GET'])
def get_overdue_tasks():
    """Get tasks that are overdue"""
    conn = get_db_connection()
    today = datetime.now().strftime('%Y-%m-%d')
    
    cursor = conn.cursor()
    cursor.execute('''
        SELECT * FROM tasks 
        WHERE due_date < ? AND status = 'pending'
        ORDER BY due_date ASC
    ''', (today,))
    
    overdue_tasks = cursor.fetchall()
    conn.close()
    
    tasks_list = []
    for task in overdue_tasks:
        tasks_list.append({
            'id': task['id'],
            'title': task['title'],
            'description': task['description'],
            'priority': task['priority'],
            'status': task['status'],
            'due_date': task['due_date'],
            'created_at': task['created_at'],
            'updated_at': task['updated_at']
        })
    
    return jsonify(tasks_list)

@app.route('/api/tasks/due-today', methods=['GET'])
def get_tasks_due_today():
    """Get tasks due today"""
    conn = get_db_connection()
    today = datetime.now().strftime('%Y-%m-%d')
    
    cursor = conn.cursor()
    cursor.execute('''
        SELECT * FROM tasks 
        WHERE due_date = ? AND status = 'pending'
        ORDER BY priority DESC, created_at ASC
    ''', (today,))
    
    today_tasks = cursor.fetchall()
    conn.close()
    
    tasks_list = []
    for task in today_tasks:
        tasks_list.append({
            'id': task['id'],
            'title': task['title'],
            'description': task['description'],
            'priority': task['priority'],
            'status': task['status'],
            'due_date': task['due_date'],
            'created_at': task['created_at'],
            'updated_at': task['updated_at']
        })
    
    return jsonify(tasks_list)

if __name__ == '__main__':
    init_db()
    app.run(debug=True, host='0.0.0.0', port=5000)
