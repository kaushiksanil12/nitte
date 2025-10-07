from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service

class BrowserManager:
    """Manages Chrome browser instances for URL visiting"""
    
    def create_driver(self):
        """Create a headless Chrome driver"""
        chrome_options = Options()
        chrome_options.add_argument('--headless')
        chrome_options.add_argument('--no-sandbox')
        chrome_options.add_argument('--disable-dev-shm-usage')
        chrome_options.add_argument('--disable-gpu')
        chrome_options.add_argument('--window-size=1920,1080')
        chrome_options.add_argument('--disable-blink-features=AutomationControlled')
        chrome_options.add_argument('--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36')
        
        # Enable logging
        chrome_options.set_capability('goog:loggingPrefs', {'performance': 'ALL'})
        
        driver = webdriver.Chrome(options=chrome_options)
        driver.set_page_load_timeout(30)
        
        return driver
    
    def close_driver(self, driver):
        """Close browser driver"""
        try:
            driver.quit()
        except Exception as e:
            print(f"Error closing driver: {e}")
