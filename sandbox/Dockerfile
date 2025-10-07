FROM python:3.10-slim

# Install Chromium and dependencies (simpler approach)
RUN apt-get update && apt-get install -y \
    chromium \
    chromium-driver \
    wget \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application files
COPY . .

# Create output directories
RUN mkdir -p outputs/screenshots outputs/html outputs/logs

# Set environment variable for Chrome binary
ENV CHROME_BIN=/usr/bin/chromium

EXPOSE 5000

CMD ["python", "app.py"]
