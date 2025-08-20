# Family Calendar - Docker Setup

This project consists of a React Router 7 frontend and a FastAPI backend, both containerized with Docker.

## Quick Start

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd family-calendar
   ```

2. **Build and run with Docker Compose**
   ```bash
   docker-compose up -d --build
   ```

3. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000

## Services

### Frontend
- **Technology**: React Router 7 with Vite
- **Port**: 3000
- **Build**: Multi-stage Docker build using Node.js 20
- **Environment**: Production-optimized build

### Backend  
- **Technology**: FastAPI with Python
- **Port**: 8000
- **Database**: SQLite (mounted as volume)
- **Google Integration**: Calendar sync capabilities

## Development

### Frontend Environment Variables
The frontend uses build-time environment variables for API configuration:

```bash
# For local development, create .env file:
VITE_API_BASE_URL=http://localhost:8000

# For Docker, the API URL is set to http://backend:8000 automatically
```

### Docker Commands

```bash
# Build and start all services
docker-compose up -d --build

# View logs
docker-compose logs frontend
docker-compose logs backend

# Stop all services
docker-compose down

# Rebuild specific service
docker-compose build frontend
docker-compose up -d frontend
```

### Health Checks
- Frontend includes a health check endpoint
- Both services restart automatically unless stopped

## File Structure

```
├── docker-compose.yml
├── frontend/
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── .env.example
│   └── ...
└── backend/
    ├── Dockerfile
    └── ...
```

## Troubleshooting

1. **Port conflicts**: Ensure ports 3000 and 8000 are available
2. **Build failures**: Check Node.js version (requires 20+) for React Router 7
3. **API connection issues**: Verify the VITE_API_BASE_URL is set correctly for your environment
