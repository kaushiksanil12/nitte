import json
import os
from PIL import Image
from io import BytesIO

class OutputCapturer:
    """Captures various outputs from browser sessions"""
    
    def capture_screenshot(self, driver, filepath):
        """Take screenshot of current page"""
        try:
            driver.save_screenshot(filepath)
            return filepath
        except Exception as e:
            print(f"Screenshot error: {e}")
            return None
    
    def capture_html(self, driver):
        """Capture page HTML source"""
        try:
            return driver.page_source
        except Exception as e:
            print(f"HTML capture error: {e}")
            return ""
    
    def save_html(self, html_content, filepath):
        """Save HTML content to file"""
        try:
            os.makedirs(os.path.dirname(filepath), exist_ok=True)
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(html_content)
            return filepath
        except Exception as e:
            print(f"HTML save error: {e}")
            return None
    
    def capture_network_logs(self, driver):
        """Capture network requests from browser logs"""
        try:
            logs = driver.get_log('performance')
            network_logs = []
            
            for log in logs:
                message = json.loads(log['message'])
                method = message.get('message', {}).get('method', '')
                
                # Filter network-related logs
                if 'Network' in method:
                    network_logs.append(message)
            
            return network_logs
        except Exception as e:
            print(f"Network log error: {e}")
            return []
    
    def save_logs(self, logs, filepath):
        """Save network logs to JSON file"""
        try:
            os.makedirs(os.path.dirname(filepath), exist_ok=True)
            with open(filepath, 'w', encoding='utf-8') as f:
                json.dump(logs, f, indent=2)
            return filepath
        except Exception as e:
            print(f"Log save error: {e}")
            return None
