from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
import jwt
import datetime
from functools import wraps
from flask_cors import CORS  # Import CORS

# Initialize the Flask app and the database
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:4200"}})  # Allow only requests from localhost:4200

# CORS(app, resources={r"/login": {"origins": "http://localhost:4200"}})  # Allow only specific origins

app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:Qwerty1234+@localhost/p29'
app.config['SECRET_KEY'] = 'dggehhywynhgwuhjwjiiej'
db = SQLAlchemy(app)

class User(db.Model):
    __tablename__ = 'users'  # Explicitly set the table name to 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(100), nullable=False)
    last_name = db.Column(db.String(100), nullable=False)
    username = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(100), nullable=False)

# JWT token verification
def token_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'message': 'Token is missing!'}), 403
        try:
            jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Token is expired!'}), 403
        except jwt.InvalidTokenError:
            return jsonify({'message': 'Invalid token!'}), 403
        return f(*args, **kwargs)
    return decorated_function

# Login route (hardcoded credentials)
@app.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        username = data['username']
        password = data['password']
        user = User.query.filter_by(username=username, password=password).first()

        if user:
            token = jwt.encode({'user': username, 'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=1)}, app.config['SECRET_KEY'])
            return jsonify({'token': token})
        else:
            return jsonify({'message': 'Invalid credentials!'}), 401
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({'message': 'Internal Server Error!'}), 500

# Dashboard route
@app.route('/dashboard', methods=['GET'])
# @token_required  # Remove this line to stop requiring a token
def dashboard():
    summary = {
        'text': (
            "Generative AI refers to a class of algorithms that can generate new content such as images, music, and text. "
            "This innovative technology has been particularly revolutionary in recent years, with remarkable advances made in "
            "areas like natural language processing and computer vision. Models like OpenAI's GPT and DALL·E can now generate "
            "human-like text or create photorealistic images from text prompts. This opens up possibilities in various sectors "
            "such as entertainment, healthcare, and education. For instance, AI is already being used to generate new artwork in "
            "the gaming industry, and in healthcare, it can assist in the creation of novel molecules for drug development. "
            "However, with all these exciting advancements, generative AI also poses significant ethical challenges, such as "
            "concerns about misinformation, deepfakes, and intellectual property. As this technology continues to evolve, it "
            "will be important to navigate these issues carefully and responsibly.",
        ),
        'source': 'https://www.techtarget.com/searchenterpriseai/definition/generative-AI'
    }
    tech_stack = {
        'frontend': 'Angular',
        'backend': 'Python (Flask)',
        'database': 'MySQL',
        'authentication': 'JWT',
        'infrastructure': 'NGINX to serve frontend, Flask API for backend, MySQL for database'
    }
    return jsonify({'summary': summary, 'tech_stack': tech_stack})

# Chart data route
@app.route('/chart_data', methods=['GET'])
#@token_required
def chart_data():
    data = [
        {'year': 2020, 'value': 30},
        {'year': 2021, 'value': 40},
        {'year': 2022, 'value': 50},
        {'year': 2023, 'value': 70},
    ]
    return jsonify({'data': data})

if __name__ == '__main__':
    app.run(debug=True, port=3000)
