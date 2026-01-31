from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS # REQUIRED: To allow the App to talk to this Server

app = Flask(__name__)
CORS(app) # Enable Cross-Origin Resource Sharing

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///sentinel.db'
db = SQLAlchemy(app)

# MODELS
class Alert(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    x = db.Column(db.Float) # Changed to Float for precision
    y = db.Column(db.Float)
    label = db.Column(db.String(50))

class ActivityLog(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    message = db.Column(db.String(200))
    status = db.Column(db.String(20))

# API ROUTE
@app.route('/api/v1/alerts', methods=['POST'])
def create_alert():
    data = request.get_json()
    
    # 1. Save the Alert data
    new_alert = Alert(
        x=float(data.get('x')), 
        y=float(data.get('y')), 
        label=data.get('label')
    )
    db.session.add(new_alert)
    
    # 2. AUTOMATIC LOG: This populates the "Live Feed" Hanae mentioned
    new_log = ActivityLog(
        message=f"Strategic Alert: Intruder at coordinates ({data.get('x'):.2f}, {data.get('y'):.2f})",
        status="active"
    )
    db.session.add(new_log)
    
    db.session.commit()
    return jsonify({"message": "Alert synced and log created"}), 201

if __name__ == '__main__':
    # host='0.0.0.0' is CRITICAL: It allows other devices (like the App) 
    # on the same Wi-Fi to reach this server.
    app.run(host='0.0.0.0', port=5000, debug=True)
