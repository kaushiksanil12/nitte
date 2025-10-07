from flask import Flask, request, jsonify, send_file
from sandbox import BrowserManager, OutputCapturer
import os
from datetime import datetime

app = Flask(__name__)

# Initialize managers
browser_manager = BrowserManager()
capturer = OutputCapturer()

# Remove these lines - directories already created by Dockerfile
# os.makedirs('outputs/screenshots', exist_ok=True)
# os.makedirs('outputs/html', exist_ok=True)
# os.makedirs('outputs/logs', exist_ok=True)


@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({"status": "healthy", "service": "sandbox"}), 200


@app.route('/visit', methods=['POST'])
def visit_url():
    """Visit a URL and capture output"""
    data = request.get_json()
    url = data.get('url')
    
    if not url:
        return jsonify({"error": "URL is required"}), 400
    
    try:
        # Generate unique ID
        analysis_id = datetime.now().strftime("%Y%m%d_%H%M%S")
        
        # Visit URL
        driver = browser_manager.create_driver()
        driver.get(url)
        
        # Capture outputs
        screenshot_path = capturer.capture_screenshot(
            driver, 
            f"outputs/screenshots/{analysis_id}.png"
        )
        
        html_content = capturer.capture_html(driver)
        html_path = capturer.save_html(
            html_content,
            f"outputs/html/{analysis_id}.html"
        )
        
        network_logs = capturer.capture_network_logs(driver)
        log_path = capturer.save_logs(
            network_logs,
            f"outputs/logs/{analysis_id}.json"
        )
        
        # Get metadata
        page_title = driver.title
        final_url = driver.current_url
        
        browser_manager.close_driver(driver)
        
        return jsonify({
            "status": "success",
            "analysis_id": analysis_id,
            "url": url,
            "final_url": final_url,
            "page_title": page_title,
            "outputs": {
                "screenshot": f"/screenshot/{analysis_id}",
                "html": f"/html/{analysis_id}",
                "logs": f"/logs/{analysis_id}"
            },
            "html_preview": html_content[:500] + "..." if len(html_content) > 500 else html_content,
            "network_requests": len(network_logs)
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/screenshot/<analysis_id>', methods=['GET'])
def get_screenshot(analysis_id):
    """Serve screenshot"""
    filepath = f"outputs/screenshots/{analysis_id}.png"
    if os.path.exists(filepath):
        return send_file(filepath, mimetype='image/png')
    return jsonify({"error": "Screenshot not found"}), 404


@app.route('/html/<analysis_id>', methods=['GET'])
def get_html(analysis_id):
    """Serve HTML"""
    filepath = f"outputs/html/{analysis_id}.html"
    if os.path.exists(filepath):
        return send_file(filepath, mimetype='text/html')
    return jsonify({"error": "HTML not found"}), 404


@app.route('/logs/<analysis_id>', methods=['GET'])
def get_logs(analysis_id):
    """Serve logs"""
    filepath = f"outputs/logs/{analysis_id}.json"
    if os.path.exists(filepath):
        return send_file(filepath, mimetype='application/json')
    return jsonify({"error": "Logs not found"}), 404


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
