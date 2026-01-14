from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from models import db, User, Room, AlertCase, ActivityLog
from datetime import datetime

app = Flask(__name__)
CORS(app)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///sentinel.db'
app.config['JWT_SECRET_KEY'] = 'lgs-tech-super-secret-key'
jwt = JWTManager(app)
db.init_app(app)

# Database Initialization - Runs once at startup
with app.app_context():
    db.create_all() 
    # Seed Admin
    if not User.query.filter_by(username='admin').first():
        admin = User(username='admin', password_hash='any_password', full_name='Security Admin', role='admin')
        db.session.add(admin)
    # Seed IT Lab Room (Needed for your simulation)
    if not Room.query.filter_by(id=10).first():
        it_lab = Room(id=10, name="IT Lab", floor="2nd Floor")
        db.session.add(it_lab)
    db.session.commit()

@app.route('/api/v1/login', methods=['POST'])
def login():
    data = request.json
    user = User.query.filter_by(username=data.get('username')).first()
    if user and user.password_hash == data.get('password'):
        access_token = create_access_token(identity=user.id)
        return jsonify(access_token=access_token, name=user.full_name, role=user.role), 200
    return jsonify({"msg": "Bad username or password"}), 401

@app.route('/api/v1/alerts', methods=['POST'])
@jwt_required()
def trigger_alert():
    data = request.json
    user_id = get_jwt_identity()
    
    # 1. Save Alert (Tasks: Connection & Messages)
    new_alert = AlertCase(
        user_id=user_id,
        room_id=data.get('room_id'),
        intruder_info=data.get('intruder_info'),
        location_x=data.get('location_x'),
        location_y=data.get('location_y'),
        approximate_location=data.get('approximate_location', 'Manual Pinpoint')
    )
    db.session.add(new_alert)
    db.session.flush() # Get the ID for the log

    # 2. Automated Live Feed Entry (Task: Live Feed)
    log_entry = ActivityLog(
        case_id=new_alert.id,
        action=f"Strategic coordination active at ({new_alert.location_x}, {new_alert.location_y})"
    )
    db.session.add(log_entry)
    db.session.commit()

    return jsonify({"msg": "Strategic coordination active"}), 201

# Endpoint for Leon to pull all map pins
@app.route('/api/v1/active-alerts', methods=['GET'])
@jwt_required()
def get_alerts():
    alerts = AlertCase.query.all()
    return jsonify([{
        "id": a.id, "x": a.location_x, "y": a.location_y,
        "info": a.intruder_info, "room": a.room.name if a.room else "Unknown"
    } for a in alerts]), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
