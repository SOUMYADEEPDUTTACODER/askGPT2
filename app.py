from flask import Flask, render_template, request, jsonify, redirect, url_for, flash
from flask_socketio import SocketIO, emit
from flask_login import LoginManager, login_user, logout_user, login_required, current_user
from models import User, Message
from config import Config
import uuid
import requests
import json
from datetime import datetime

app = Flask(__name__)
app.config.from_object(Config)

# Initialize extensions
socketio = SocketIO(app)
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'

@login_manager.user_loader
def load_user(user_id):
    return User.get_by_id(user_id)

# Routes
@app.route('/')
@login_required
def index():
    return render_template('index.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('index'))
    
    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')
        user = User.get_by_email(email)
        
        if user and user.check_password(password):
            login_user(user)
            return redirect(url_for('index'))
        flash('Invalid email or password')
    return render_template('login.html')

@app.route('/signup', methods=['GET', 'POST'])
def signup():
    if current_user.is_authenticated:
        return redirect(url_for('index'))
    
    if request.method == 'POST':
        username = request.form.get('username')
        email = request.form.get('email')
        password = request.form.get('password')
        
        if User.get_by_email(email):
            flash('Email already registered')
            return redirect(url_for('signup'))
        
        user = User.create(username, email, password)
        login_user(user)
        return redirect(url_for('index'))
    return render_template('signup.html')

@app.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('login'))

# SocketIO events
@socketio.on('send_message')
@login_required
def handle_message(data):
    chat_id = data.get('chat_id', str(uuid.uuid4()))
    message = data['message']
    
    # Save user message
    Message.create(message, True, current_user.id, chat_id)
    
    # Get AI response
    try:
        response = get_ai_response(message)
        Message.create(response, False, current_user.id, chat_id)
        
        emit('receive_message', {
            'message': response,
            'is_user': False,
            'chat_id': chat_id
        })
    except Exception as e:
        emit('error', {'message': 'Error getting AI response'})

def get_ai_response(message):
    headers = {
        'Authorization': f'Bearer {app.config["GROQ_API_KEY"]}',
        'Content-Type': 'application/json'
    }
    
    data = {
        'messages': [{'role': 'user', 'content': message}],
        'model': 'mixtral-8x7b-32768'
    }
    
    response = requests.post(
        'https://api.groq.com/openai/v1/chat/completions',
        headers=headers,
        json=data
    )
    
    if response.status_code == 200:
        return response.json()['choices'][0]['message']['content']
    else:
        raise Exception('Failed to get AI response')

if __name__ == '__main__':
    socketio.run(app, debug=True) 