# Multi-stage Dockerfile for Digital Forensics Platform
# Stage 1: Build React Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Stage 2: Production Python Backend + Static File Serving
FROM python:3.11-slim
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpcap-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt uvicorn

# Copy backend source code
COPY backend/ ./backend

# Copy built frontend assets to backend static folder
COPY --from=frontend-builder /app/frontend/dist ./backend/app/static

WORKDIR /app/backend

# Environment variables
ENV PORT=8000
ENV HOST=0.0.0.0

EXPOSE 8000

# Start Uvicorn production server
CMD ["python", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
