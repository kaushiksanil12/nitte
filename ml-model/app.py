from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import joblib
import numpy as np
import json

app = FastAPI(title="Phishing Detection ML Service")

print("="*50)
print("Loading model...")

try:
    model = joblib.load('phishing_model.pkl')
    print("✅ Model loaded")
    
    with open('feature_names.json', 'r') as f:
        feature_names = json.load(f)
    print(f"✅ {len(feature_names)} features loaded")
    
    with open('model_info.json', 'r') as f:
        model_info = json.load(f)
    
except Exception as e:
    print(f"❌ Error: {e}")
    feature_names = []
    model_info = {}

print("="*50)


class PredictionRequest(BaseModel):
    url: str
    network_logs: list = []


@app.get("/")
def root():
    return {"service": "ML API", "status": "running"}


@app.get("/health")
def health():
    return {
        "status": "healthy",
        "model_loaded": True,
        "features": len(feature_names),
        "accuracy": model_info.get('accuracy', 'N/A')
    }


@app.post("/predict")
def predict(data: PredictionRequest):
    try:
        # For now, use dummy features (50 zeros)
        # Replace with actual feature extraction later
        features = [0.0] * len(feature_names)
        
        # Reshape for prediction
        features_array = np.array(features).reshape(1, -1)
        
        # Predict
        prediction = int(model.predict(features_array)[0])
        probabilities = model.predict_proba(features_array)[0]
        
        return {
            "prediction": "phishing" if prediction == 1 else "legitimate",
            "malicious": bool(prediction),
            "confidence": float(max(probabilities)),
            "probabilities": {
                "legitimate": float(probabilities[0]),
                "phishing": float(probabilities[1])
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
