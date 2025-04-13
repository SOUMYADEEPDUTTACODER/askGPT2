from pymongo import MongoClient
from bson import ObjectId
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import UserMixin

# MongoDB connection
client = MongoClient('mongodb://localhost:27017/')
db = client['askgpt']

class User(UserMixin):
    def __init__(self, user_data):
        self.id = str(user_data['_id'])
        self.username = user_data['username']
        self.email = user_data['email']
        self.password_hash = user_data['password_hash']
        self.created_at = user_data['created_at']

    @staticmethod
    def get_by_id(user_id):
        user_data = db.users.find_one({'_id': ObjectId(user_id)})
        if user_data:
            return User(user_data)
        return None

    @staticmethod
    def get_by_email(email):
        user_data = db.users.find_one({'email': email})
        if user_data:
            return User(user_data)
        return None

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
        db.users.update_one(
            {'_id': ObjectId(self.id)},
            {'$set': {'password_hash': self.password_hash}}
        )

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    @staticmethod
    def create(username, email, password):
        password_hash = generate_password_hash(password)
        user_data = {
            'username': username,
            'email': email,
            'password_hash': password_hash,
            'created_at': datetime.utcnow()
        }
        result = db.users.insert_one(user_data)
        user_data['_id'] = result.inserted_id
        return User(user_data)

class Message:
    @staticmethod
    def create(content, is_user, user_id, chat_id):
        message_data = {
            'content': content,
            'is_user': is_user,
            'user_id': user_id,
            'chat_id': chat_id,
            'created_at': datetime.utcnow()
        }
        db.messages.insert_one(message_data)
        return message_data

    @staticmethod
    def get_by_chat_id(chat_id):
        return list(db.messages.find({'chat_id': chat_id}).sort('created_at', 1))

    @staticmethod
    def get_user_chats(user_id):
        return list(db.messages.distinct('chat_id', {'user_id': user_id})) 