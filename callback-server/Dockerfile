# Use Python 3.11 slim image
FROM python:3.11-slim
#FROM python:3.11

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PYTHONPATH=/app

# Set work directory
WORKDIR /app

# Install system dependencies
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        gcc \
        g++ \
        curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy project
COPY . .

# Create logs directory
RUN mkdir -p logs

# Create non-root user
#RUN adduser --disabled-password --gecos '' appuser && chown -R appuser /app
#USER appuser

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

RUN ls -lah

#RUN gunicorn --version

# Run the application with gunicorn for development
CMD ["gunicorn", "--bind", "0.0.0.0:3000", "--config", "gunicorn.conf.py", "callback_server:app"]
