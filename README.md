# AskGPT - ChatGPT Clone

A modern ChatGPT clone built with Flask, featuring real-time chat, user authentication, and code syntax highlighting.

## Features

- User authentication (login/signup)
- Real-time chat interface
- Chat history persistence
- Code syntax highlighting
- Responsive design
- Password encryption
- Session management
- Message history per user

## Technology Stack

- Backend: Python Flask
- Frontend: HTML, CSS, JavaScript
- Database: SQLite with SQLAlchemy
- Authentication: Flask-Login
- Real-time chat: Flask-SocketIO
- API Integration: Groq API for AI responses

## Setup Instructions

1. Clone the repository:
```bash
git clone https://github.com/yourusername/askGPT.git
cd askGPT
```

2. Create and activate a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Create a `.env` file in the project root with the following variables:
```
SECRET_KEY=your-secret-key-here
GROQ_API_KEY=your-groq-api-key-here
CSRF_SECRET_KEY=your-csrf-secret-key-here
```

5. Initialize the database:
```bash
flask shell
>>> from app import db
>>> db.create_all()
>>> exit()
```

6. Run the application:
```bash
python app.py
```

7. Open your browser and navigate to `http://localhost:5000`

## Project Structure

```
/askGPT
├── static/
│   ├── css/
│   │   └── style.css
│   └── js/
│       ├── auth.js
│       └── main.js
├── templates/
│   ├── index.html
│   ├── login.html
│   └── signup.html
├── app.py
├── config.py
├── models.py
├── requirements.txt
└── .env
```

## Security Features

- Password hashing with bcrypt
- Session management
- CSRF protection
- Secure API key handling
- Input validation
- XSS protection

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 