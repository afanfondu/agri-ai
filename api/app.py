from flask import Flask, request, jsonify
from flask_cors import CORS, cross_origin
import pickle
import numpy as np
import os

app = Flask(__name__)
cors = CORS(app)

# Define model paths - update if your models are in a different directory
current_dir = os.path.dirname(os.path.abspath(__file__))
crop_model_path = os.path.join(current_dir, "classifier.pkl")
fert_model_path = os.path.join(current_dir, "fertclassifier.pkl")

# Check if model files exist
if not os.path.exists(crop_model_path):
    print(f"Error: Crop model file not found at {crop_model_path}")
    
if not os.path.exists(fert_model_path):
    print(f"Error: Fertilizer model file not found at {fert_model_path}")

# Load the crop recommendation model
try:
    with open(crop_model_path, "rb") as f:
        crop_model = pickle.load(f)
    print("Crop recommendation model loaded successfully!")
except Exception as e:
    print(f"Error loading crop recommendation model: {e}")
    crop_model = None

# Load the fertilizer recommendation model
try:
    with open(fert_model_path, "rb") as f:
        fertilizer_model = pickle.load(f)
    print("Fertilizer recommendation model loaded successfully!")
except Exception as e:
    print(f"Error loading fertilizer recommendation model: {e}")
    fertilizer_model = None

# Crop dictionary for reverse mapping
crop_dict = {
    1: "Rice", 2: "Maize", 3: "Jute", 4: "Cotton", 5: "Coconut", 
    6: "Papaya", 7: "Orange", 8: "Apple", 9: "Muskmelon", 
    10: "Watermelon", 11: "Grapes", 12: "Mango", 13: "Banana",
    14: "Pomegranate", 15: "Lentil", 16: "Blackgram", 17: "Mungbean", 
    18: "Mothbeans", 19: "Pigeonpeas", 20: "Kidneybeans", 
    21: "Chickpea", 22: "Coffee"
}

# Fertilizer dictionary for reverse mapping
fertilizer_dict = {
    'Urea': 'Urea is a high-nitrogen fertilizer that is suitable for promoting leafy growth.',
    'DAP': 'Diammonium Phosphate (DAP) provides both nitrogen and phosphorus, promoting root development and overall plant growth.',
    '14-35-14': 'This NPK fertilizer has a balanced ratio (14% Nitrogen, 35% Phosphorus, 14% Potassium) good for flowering and fruiting.',
    '28-28': 'This fertilizer has equal parts of nitrogen and phosphorus (28% each) but no potassium.',
    '17-17-17': 'A balanced NPK fertilizer (17% each) suitable for overall plant development.',
    '20-20': 'Contains equal parts of nitrogen and phosphorus (20% each) but no potassium.',
    '10-26-26': 'NPK fertilizer with emphasis on phosphorus and potassium, good for root development and disease resistance.'
}

# Soil type mapping (for fertilizer recommendation)
soil_dict = {
    'Loamy': 1,
    'Sandy': 2,
    'Clayey': 3,
    'Black': 4,
    'Red': 5
}

# Crop type mapping (for fertilizer recommendation)
crop_type_dict = {
    'Sugarcane': 1,
    'Cotton': 2,
    'Millets': 3,
    'Paddy': 4,
    'Pulses': 5,
    'Wheat': 6,
    'Tobacco': 7,
    'Barley': 8,
    'Oil seeds': 9,
    'Ground Nuts': 10,
    'Maize': 11
}

@app.route('/')
def home():
    return jsonify({
        "status": "success",
        "message": "Welcome to AgriAI API",
        "endpoints": {
            "/crop-recommendation": "POST - Get crop recommendations",
            "/fertilizer-recommendation": "POST - Get fertilizer recommendations"
        }
    })

@app.route('/crop-recommendation', methods=['POST'])
def crop_recommendation():
    try:
        # Get input data from request
        data = request.get_json()
        
        # Extract features
        N = int(data['nitrogen'])
        P = int(data['phosphorus'])
        K = int(data['potassium'])
        temperature = float(data['temperature'])
        humidity = float(data['humidity'])
        ph = float(data['ph'])
        rainfall = float(data['rainfall'])
        
        # Make prediction
        features = np.array([[N, P, K, temperature, humidity, ph, rainfall]])
        prediction = crop_model.predict(features)[0]
        
        # Get the crop name
        crop = crop_dict.get(prediction, "Unknown crop")
        
        return jsonify({
            "status": "success",
            "recommendation": {
                "crop": crop,
                "crop_id": int(prediction)
            },
            "message": f"{crop} is recommended for the given soil and environmental conditions."
        })
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 400

@app.route('/fertilizer-recommendation', methods=['POST'])
def fertilizer_recommendation():
    try:
        # Get input data from request
        data = request.get_json()
        
        # Extract features
        temperature = int(data['temperature'])
        humidity = int(data['humidity'])
        moisture = int(data['moisture'])
        nitrogen = int(data['nitrogen'])
        potassium = int(data['potassium'])
        phosphorous = int(data['phosphorous'])
        
        # Convert soil_type and crop_type to numerical values
        soil_type = data['soil_type']
        crop_type = data['crop_type']
        
        soil_num = soil_dict.get(soil_type, 0)
        crop_num = crop_type_dict.get(crop_type, 0)
        
        if soil_num == 0:
            return jsonify({
                "status": "error",
                "message": f"Invalid soil type. Valid types are: {list(soil_dict.keys())}"
            }), 400
            
        if crop_num == 0:
            return jsonify({
                "status": "error",
                "message": f"Invalid crop type. Valid types are: {list(crop_type_dict.keys())}"
            }), 400
        
        # Make prediction
        features = np.array([[temperature, humidity, moisture, nitrogen, potassium, phosphorous, soil_num, crop_num]])
        prediction = fertilizer_model.predict(features)[0]
        
        # Get fertilizer details
        fertilizer_info = fertilizer_dict.get(prediction, "No specific recommendation")
        
        return jsonify({
            "status": "success",
            "recommendation": {
                "fertilizer": prediction,
                "description": fertilizer_info
            },
            "message": f"{prediction} is recommended for the given conditions."
        })
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 400

if __name__ == '__main__':
    app.run(debug=True)
