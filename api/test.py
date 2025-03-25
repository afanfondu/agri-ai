import requests
import json

BASE_URL = "http://127.0.0.1:5000"

def test_crop_recommendation():
    print("\nTesting Crop Recommendation API...")
    
    # Test data
    payload = {
        "nitrogen": 90,
        "phosphorus": 42,
        "potassium": 43,
        "temperature": 20.87,
        "humidity": 82.00,
        "ph": 6.5,
        "rainfall": 202.93
    }
    
    # Make the API call
    response = requests.post(f"{BASE_URL}/crop-recommendation", json=payload)
    
    # Print results
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")

def test_fertilizer_recommendation():
    print("\nTesting Fertilizer Recommendation API...")
    
    # Test data
    payload = {
        "temperature": 26,
        "humidity": 52,
        "moisture": 38,
        "nitrogen": 37,
        "potassium": 0,
        "phosphorous": 0,
        "soil_type": "Sandy",
        "crop_type": "Maize"
    }
    
    # Make the API call
    response = requests.post(f"{BASE_URL}/fertilizer-recommendation", json=payload)
    
    # Print results
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")

if __name__ == "__main__":
    # Test both endpoints
    try:
        test_crop_recommendation()
        test_fertilizer_recommendation()
    except Exception as e:
        print(f"Error occurred during testing: {e}")
        print("Make sure the API server is running.")
