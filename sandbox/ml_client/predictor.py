"""Client to communicate with ML service"""

import requests
import os

class MLPredictor:
    def __init__(self):
        self.ml_service_url = os.getenv('ML_SERVICE_URL', 'http://ml-service:8000')
    
    def predict(self, features):
        """
        Send 54 features to ML service for prediction
        
        Args:
            features: List of 54 float values
        
        Returns:
            dict with prediction result
        """
        try:
            response = requests.post(
                f'{self.ml_service_url}/predict',
                json={'features': features},
                timeout=10
            )
            response.raise_for_status()
            return response.json()
        except Exception as e:
            return {'error': str(e), 'prediction': None}
