from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from models import db, User, Room, AlertCase, ActivityLog

app = Flask(__name__)
CORS(app)

# Security Configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///sentinel.db'
app.config['JWT_SECRET_KEY'] = 'lgs-tech-super-secret-key' # Change this for production!
jwt = JWTManager(app)
db.init_app(app)

with app.app_context():
    db.create_all()
    # Auto-seed a test user if none exists
    if not User.query.filter_by(username='admin').first():
        test_user = User(username='admin', password_hash='pbkdf2:sha256...', full_name='Admin Test', role='security')
        db.session.add(test_user)
        db.session.commit()

# --- NEW: LOGIN ROUTE ---
@app.route('/api/v1/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password') # In production, verify against password_hash
    
    user = User.query.filter_by(username=username).first()
    if user:
        # Create the "Digital Key"
        access_token = create_access_token(identity=user.id)
        return jsonify(access_token=access_token, role=user.role, name=user.full_name), 200
    return jsonify({"msg": "Bad username or password"}), 401

# --- UPDATED: SECURE ALERT ROUTE ---
@app.route('/api/v1/alerts', methods=['POST'])
@jwt_required()
def trigger_alert():
    current_user_id = get_jwt_identity()
    data = request.json
    
    new_alert = AlertCase(
        user_id=current_user_id,
        room_id=data.get('room_id'),
        intruder_info=data.get('intruder_info'),
        # NEW: Capture the exact coordinates from Leon's map
        location_x=data.get('location_x'),
        location_y=data.get('location_y'),
        status='Active'
    )
    db.session.add(new_alert)
    db.session.commit()
    
    # ... session add and commit ...
    return jsonify({"msg": "Strategic coordination active"}), 201

