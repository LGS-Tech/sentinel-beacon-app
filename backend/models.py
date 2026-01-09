from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'user'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    full_name = db.Column(db.String(120))
    # 'role' is used for the "depending on authority" logic
    role = db.Column(db.String(20), default='staff') 

class Room(db.Model):
    __tablename__ = 'room'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    floor = db.Column(db.String(10))

class AlertCase(db.Model):
    __tablename__ = 'alert_case'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), default="Intruder Alert")
    status = db.Column(db.String(20), default='Active') # Active/Resolved
    
    # NEW: Specific fields to match the frontend index.tsx
    intruder_info = db.Column(db.String(500)) 
    police_notified = db.Column(db.Boolean, default=False)
    approximate_location = db.Column(db.String(100))
    
    # Relationships
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    room_id = db.Column(db.Integer, db.ForeignKey('room.id'))
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

    # Helper to see names in the relationship
    room = db.relationship('Room', backref='alerts')
    user = db.relationship('User', backref='alerts')

class ActivityLog(db.Model):
    __tablename__ = 'activity_log'
    id = db.Column(db.Integer, primary_key=True)
    case_id = db.Column(db.Integer, db.ForeignKey('alert_case.id'))
    action = db.Column(db.String(200), nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
