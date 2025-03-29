from flask import Flask, request, jsonify
from flask_cors import CORS, cross_origin
import pickle
import numpy as np
import os

import tensorflow as tf
# from tensorflow.lite.interpreter import Interpreter
from ai_edge_litert.interpreter import Interpreter
from tensorflow.keras.preprocessing import image
import io
from PIL import Image

app = Flask(__name__)
cors = CORS(app)

# Define model paths - update if your models are in a different directory
current_dir = os.path.dirname(os.path.abspath(__file__))
crop_model_path = os.path.join(current_dir, "crop-recommendation.pkl")
fert_model_path = os.path.join(current_dir, "fertilizer-recommendation.pkl")
plant_model_path = os.path.join(current_dir, "medicinal-plant-prediction.tflite")

# Check if model files exist
if not os.path.exists(crop_model_path):
    print(f"Error: Crop model file not found at {crop_model_path}")
    
if not os.path.exists(fert_model_path):
    print(f"Error: Fertilizer model file not found at {fert_model_path}")

if not os.path.exists(plant_model_path):
    print(f"Error: Plant classification model file not found at {plant_model_path}")

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


try:
    # Load TFLite model and allocate tensors
    plant_interpreter = Interpreter(model_path=plant_model_path)
    plant_interpreter.allocate_tensors()
    print("Plant classification TFLite model loaded successfully!")

    # Get input and output tensors
    input_details = plant_interpreter.get_input_details()
    output_details = plant_interpreter.get_output_details()

    # Load class names
    # with open(plant_classes_path, 'r') as f:
    #     PLANT_NAMES = json.load(f)
    # print(f"Loaded {len(PLANT_NAMES)} plant classes")
except Exception as e:
    print(f"Error loading plant classification model: {e}")
    plant_interpreter = None
    PLANT_NAMES = []

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

PLANT_NAMES = ['Alpinia Galanga (Rasna)', 'Amaranthus Viridis (Arive-Dantu)', 'Artocarpus Heterophyllus (Jackfruit)', 'Azadirachta Indica (Neem)', 'Basella Alba (Basale)', 'Brassica Juncea (Indian Mustard)', 'Carissa Carandas (Karanda)', 'Citrus Limon (Lemon)', 'Ficus Auriculata (Roxburgh fig)', 'Ficus Religiosa (Peepal Tree)', 'Hibiscus Rosa-sinensis', 'Jasminum (Jasmine)', 'Mangifera Indica (Mango)', 'Mentha (Mint)', 'Moringa Oleifera (Drumstick)', 'Muntingia Calabura (Jamaica Cherry-Gasagase)', 'Murraya Koenigii (Curry)', 'Nerium Oleander (Oleander)', 'Nyctanthes Arbor-tristis (Parijata)', 'Ocimum Tenuiflorum (Tulsi)', 'Piper Betle (Betel)', 'Plectranthus Amboinicus (Mexican Mint)', 'Pongamia Pinnata (Indian Beech)', 'Psidium Guajava (Guava)', 'Punica Granatum (Pomegranate)', 'Santalum Album (Sandalwood)', 'Syzygium Cumini (Jamun)', 'Syzygium Jambos (Rose Apple)', 'Tabernaemontana Divaricata (Crape Jasmine)', 'Trigonella Foenum-graecum (Fenugreek)']
AYURVEDIC_INFO = {
    'Alpinia Galanga (Rasna)': {
        'description': 'Alpinia Galanga, commonly known as Rasna in Ayurveda, is a rhizomatous herb.',
        'uses': [
            'Treats rheumatoid arthritis and joint pain',
            'Helps with respiratory disorders',
            'Improves digestion and appetite',
            'Has antimicrobial and anti-inflammatory properties'
        ]
    },
    'Amaranthus Viridis (Arive-Dantu)': {
        'description': 'Amaranthus Viridis is an annual herb known for its leafy greens.',
        'uses': [
            'Rich source of dietary nutrients',
            'Treats digestive disorders',
            'Helps reduce inflammation',
            'Supports liver function'
        ]
    },
    'Artocarpus Heterophyllus (Jackfruit)': {
        'description': 'Artocarpus Heterophyllus, commonly known as Jackfruit, is a large tropical fruit tree.',
        'uses': [
            'Builds strength and improves energy levels',
            'Treats skin diseases',
            'Aids in digestion',
            'Balances Kapha and Pitta doshas'
        ]
    },
    'Azadirachta Indica (Neem)': {
        'description': 'Azadirachta Indica, or Neem, is revered as a versatile medicinal plant.',
        'uses': [
            'Purifies blood and detoxifies the body',
            'Treats skin disorders and infections',
            'Has antibacterial and antifungal properties',
            'Helps manage diabetes'
        ]
    },
    'Basella Alba (Basale)': {
        'description': 'Basella Alba is a fast-growing perennial vine cultivated as a vegetable.',
        'uses': [
            'Helps in treating ulcers',
            'Relieves constipation',
            'Contains anti-inflammatory properties',
            'Supports healthy blood formation'
        ]
    },
    'Brassica Juncea (Indian Mustard)': {
        'description': 'Brassica Juncea is a species of mustard plant cultivated for its seeds and leaves.',
        'uses': [
            'Improves digestion and stimulates appetite',
            'Relieves congestion and respiratory issues',
            'Helps treat skin infections',
            'Reduces muscle and joint pain'
        ]
    },
    'Carissa Carandas (Karanda)': {
        'description': 'Carissa Carandas is a flowering shrub that bears small berry-sized fruits.',
        'uses': [
            'Treats anemia and improves blood count',
            'Helps with indigestion and gastric issues',
            'Has anti-inflammatory properties',
            'Used for fever and diarrhea'
        ]
    },
    'Citrus Limon (Lemon)': {
        'description': 'Citrus Limon is a small evergreen tree that produces the popular citrus fruit lemon.',
        'uses': [
            'Detoxifies the body and stimulates liver function',
            'Improves digestion and relieves constipation',
            'Treats respiratory issues and throat infections',
            'Rich in Vitamin C and antioxidants'
        ]
    },
    'Ficus Auriculata (Roxburgh fig)': {
        'description': 'Ficus Auriculata is a fig species native to Southeast Asia.',
        'uses': [
            'Treats digestive disorders',
            'Has cooling properties',
            'Helps with bleeding disorders',
            'Used for urinary tract infections'
        ]
    },
    'Ficus Religiosa (Peepal Tree)': {
        'description': 'Ficus Religiosa is a sacred tree in many South Asian cultures.',
        'uses': [
            'Treats neurological disorders',
            'Helps with diabetes management',
            'Reduces inflammation',
            'Used for asthma and respiratory conditions'
        ]
    },
    'Hibiscus Rosa-sinensis': {
        'description': 'Hibiscus Rosa-sinensis is an ornamental flowering plant with medicinal properties.',
        'uses': [
            'Cools the body and reduces pitta dosha',
            'Promotes hair growth and prevents greying',
            'Helps regulate menstrual cycles',
            'Treats coughs and respiratory issues'
        ]
    },
    'Jasminum (Jasmine)': {
        'description': 'Jasminum is a genus of fragrant flowering plants known for their beautiful blooms.',
        'uses': [
            'Calms the mind and reduces anxiety',
            'Treats eye disorders',
            'Helps with skin problems',
            'Used as a uterine tonic'
        ]
    },
    'Mangifera Indica (Mango)': {
        'description': 'Mangifera Indica is a tropical fruit tree that produces the popular mango fruit.',
        'uses': [
            'Improves digestion and treats digestive disorders',
            'Has cooling properties that balance Pitta dosha',
            'Beneficial for skin health',
            'Strengthens the heart and cardiovascular system'
        ]
    },
    'Mentha (Mint)': {
        'description': 'Mentha, commonly known as Mint, is an aromatic herb used extensively in Ayurveda.',
        'uses': [
            'Treats digestive issues and improves digestion',
            'Relieves respiratory problems',
            'Has cooling properties',
            'Helps with headaches and migraines'
        ]
    },
    'Moringa Oleifera (Drumstick)': {
        'description': 'Moringa Oleifera is a nutrient-rich plant known as a "miracle tree".',
        'uses': [
            'Provides essential nutrients and vitamins',
            'Treats inflammation and joint pain',
            'Helps manage blood sugar levels',
            'Supports liver health and detoxification'
        ]
    },
    'Muntingia Calabura (Jamaica Cherry-Gasagase)': {
        'description': 'Muntingia Calabura is a fast-growing tropical tree with edible fruits.',
        'uses': [
            'Reduces inflammation',
            'Treats headaches and cold symptoms',
            'Has antioxidant properties',
            'Helps with gastrointestinal issues'
        ]
    },
    'Murraya Koenigii (Curry)': {
        'description': 'Murraya Koenigii, known as curry leaf tree, is aromatic and used in many dishes.',
        'uses': [
            'Improves digestion and treats digestive disorders',
            'Manages diabetes and blood glucose levels',
            'Beneficial for hair health',
            'Treats infections and inflammation'
        ]
    },
    'Nerium Oleander (Oleander)': {
        'description': 'Nerium Oleander is an evergreen shrub that contains potent bioactive compounds.',
        'uses': [
            'CAUTION: Highly toxic plant, used only in extremely diluted preparations',
            'External application for skin diseases (by experts only)',
            'Used in extremely small doses for specific heart conditions (by specialized practitioners)',
            'Most preparations require extensive purification and expert preparation'
        ]
    },
    'Nyctanthes Arbor-tristis (Parijata)': {
        'description': 'Nyctanthes Arbor-tristis is a night-flowering jasmine tree.',
        'uses': [
            'Treats fevers, especially malaria',
            'Used for arthritis and joint pain',
            'Helps with constipation',
            'Has anti-inflammatory properties'
        ]
    },
    'Ocimum Tenuiflorum (Tulsi)': {
        'description': 'Ocimum Tenuiflorum, Holy Basil or Tulsi, is a sacred plant in Hindu tradition.',
        'uses': [
            'Treats respiratory conditions like bronchitis and asthma',
            'Reduces stress and anxiety',
            'Helps with fever and common cold',
            'Has adaptogenic and anti-inflammatory properties'
        ]
    },
    'Piper Betle (Betel)': {
        'description': 'Piper Betle is a perennial, dioecious creeper with glossy heart-shaped leaves.',
        'uses': [
            'Improves digestive function',
            'Treats respiratory conditions',
            'Has antimicrobial properties',
            'Used as a mouth freshener and oral health aid'
        ]
    },
    'Plectranthus Amboinicus (Mexican Mint)': {
        'description': 'Plectranthus Amboinicus is a semi-succulent perennial plant with medicinal properties.',
        'uses': [
            'Treats cough, cold and respiratory ailments',
            'Helps with digestive issues',
            'Has antimicrobial properties',
            'Used for urinary problems'
        ]
    },
    'Pongamia Pinnata (Indian Beech)': {
        'description': 'Pongamia Pinnata is a legume tree with numerous medicinal applications.',
        'uses': [
            'Treats skin diseases and wounds',
            'Has anti-inflammatory properties',
            'Used for rheumatic conditions',
            'Helps with gastrointestinal worms'
        ]
    },
    'Psidium Guajava (Guava)': {
        'description': 'Psidium Guajava is a tropical fruit tree with edible fruits and medicinal leaves.',
        'uses': [
            'Controls diabetes and improves insulin sensitivity',
            'Treats diarrhea and dysentery',
            'Helps with dental problems',
            'Has antimicrobial and anti-inflammatory properties'
        ]
    },
    'Punica Granatum (Pomegranate)': {
        'description': 'Punica Granatum is a fruit-bearing shrub with multiple medicinal benefits.',
        'uses': [
            'Treats digestive disorders like diarrhea',
            'Helps with parasitic infections',
            'Used for throat infections',
            'Has antioxidant properties'
        ]
    },
    'Santalum Album (Sandalwood)': {
        'description': 'Santalum Album is a fragrant wood with cooling properties in Ayurveda.',
        'uses': [
            'Cools the body and reduces Pitta dosha',
            'Treats skin disorders and rashes',
            'Used for urinary tract infections',
            'Calms the mind and reduces stress'
        ]
    },
    'Syzygium Cumini (Jamun)': {
        'description': 'Syzygium Cumini, also known as Jamun or Black Plum, is a tropical tree with edible fruits.',
        'uses': [
            'Manages diabetes and blood sugar levels',
            'Treats digestive disorders',
            'Has astringent properties for dental health',
            'Helps with urinary problems'
        ]
    },
    'Syzygium Jambos (Rose Apple)': {
        'description': 'Syzygium Jambos produces rose apple fruits and has medicinal properties.',
        'uses': [
            'Treats digestive disorders',
            'Has anti-inflammatory properties',
            'Used for respiratory conditions',
            'Helps with fever'
        ]
    },
    'Tabernaemontana Divaricata (Crape Jasmine)': {
        'description': 'Tabernaemontana Divaricata is an evergreen shrub with fragrant white flowers.',
        'uses': [
            'Reduces pain and inflammation',
            'Treats eye diseases',
            'Used for skin conditions',
            'Has calming effects on the nervous system'
        ]
    },
    'Trigonella Foenum-graecum (Fenugreek)': {
        'description': 'Trigonella Foenum-graecum, or Fenugreek, is an annual plant in the family Fabaceae.',
        'uses': [
            'Increases breast milk production in nursing mothers',
            'Manages diabetes and blood glucose levels',
            'Improves digestion and reduces inflammation',
            'Helps lower cholesterol levels'
        ]
    }
}

@app.route('/')
def home():
    return jsonify({
        "status": "success",
        "message": "Welcome to AgriAI API",
        "endpoints": {
            "/crop-recommendation": "POST - Get crop recommendations",
            "/fertilizer-recommendation": "POST - Get fertilizer recommendations",
            "/medicinal-plant-prediction": "POST - Get medicinal plant predictions"
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

@app.route('/medicinal-plant-prediction', methods=['POST'])
def predict_plant():
    if 'file' not in request.files:
        return jsonify({'error': 'Image file not found'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    # Read and preprocess the image
    try:
        img_bytes = file.read()
        img = Image.open(io.BytesIO(img_bytes))
        img = img.resize((256, 256)) # 224
        img_array = image.img_to_array(img)

        # Handle preprocessing based on input shape
        if input_details[0]['shape'][3] == 3:  # RGB input
            # Normalize to [0,1]
            img_array = img_array / 255.0
        else:  # If model expects different preprocessing
            img_array = preprocess_input(img_array)

        # Ensure correct data type
        input_dtype = input_details[0]['dtype']
        img_array = img_array.astype(input_dtype)

        # Add batch dimension
        img_array = np.expand_dims(img_array, axis=0)
        
        # Make prediction using TFLite
        plant_interpreter.set_tensor(input_details[0]['index'], img_array)
        plant_interpreter.invoke()
        predictions = plant_interpreter.get_tensor(output_details[0]['index'])

        predicted_class = np.argmax(predictions[0])
        confidence = float(predictions[0][predicted_class])
        class_name = PLANT_NAMES[predicted_class]
        
        ayurvedic_info = AYURVEDIC_INFO.get(class_name, {
            'description': 'No detailed information available.',
            'uses': ['Information not available']
        })
        
        top_3_indices = np.argsort(predictions[0])[-3:][::-1]
        top_3_predictions = [
            {
                "class_name": PLANT_NAMES[idx],
                "confidence": float(predictions[0][idx]),
                "class_index": int(idx),
                "ayurvedic_info": AYURVEDIC_INFO.get(PLANT_NAMES[idx], {
                    'description': 'No detailed information available.',
                    'uses': ['Information not available']
                })
            } for idx in top_3_indices
        ]

        return jsonify({
            "status": "success",
            "prediction": {
                "class_name": class_name,
                "confidence": confidence,
                "class_index": int(predicted_class),
                "ayurvedic_info": ayurvedic_info
            },
            "top_predictions": top_3_predictions
        }), 200
        
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500

if __name__ == '__main__':
    app.run(debug=True)
