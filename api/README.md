# AgriAI API

A Flask-based API that serves crop and fertilizer recommendation models.

## API Endpoints

### 1. Home Endpoint

- **URL**: `/`
- **Method**: `GET`
- **Description**: Returns basic API information

### 2. Crop Recommendation

- **URL**: `/crop-recommendation`
- **Method**: `POST`
- **Description**: Get crop recommendations based on soil parameters and environmental conditions
- **Request Body**:
  ```json
  {
    "nitrogen": 90,
    "phosphorus": 42,
    "potassium": 43,
    "temperature": 20.87,
    "humidity": 82.00,
    "ph": 6.5,
    "rainfall": 202.93
  }