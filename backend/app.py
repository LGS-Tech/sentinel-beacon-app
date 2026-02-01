from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS

app = Flask(__name__)
# CORS is essential so the mobile app can communicate with your CodeSandbox server
CORS(app, resources={r"/*": {"origins": "*"}})

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///sentinel.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# ALERT MODEL
class Alert(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    x = db.Column(db.Float)
    y = db.Column(db.Float)
    label = db.Column(db.String(50))

# SIMULATION ROUTE: Provides the intruder's path as requested by Hanae
@app.route('/api/v1/intruder/path', methods=['GET'])
def get_path():
    # Normalized coordinates (0 to 1) simulating movement through the floor plan
    simulation_path = [
        {"x": 0.15, "y": 0.20, "label": "Entering North Entrance"},
        {"x": 0.40, "y": 0.20, "label": "Moving through Lobby"},
        {"x": 0.40, "y": 0.55, "label": "Intruder in Corridor B"},
        {"x": 0.75, "y": 0.55, "label": "Entering Restricted Lab"},
        {"x": 0.85, "y": 0.80, "label": "Security Breach Area 4"}
    ]
    return jsonify(simulation_path)

# ENDPOINT to manually save alerts from the frontend
@app.route('/api/v1/alerts', methods=['POST'])
def create_alert():
    data = request.get_json()
    new_alert = Alert(x=data['x'], y=data['y'], label=data.get('label', 'Manual Detection'))
    db.session.add(new_alert)
    db.session.commit()
    return jsonify({"message": "Alert synced successfully"}), 201

if __name__ == '__main__':
    # host='0.0.0.0' allows external devices to access the Flask server
    app.run(host='0.0.0.0', port=5000, debug=True)
