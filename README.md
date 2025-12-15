# Pasty

A modern, self-hosted pastebin with Vim mode support.

## Quick Start

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/pasty.git
cd pasty
```

2. Create an environment file:

```bash
cat > .env << EOF
POSTGRES_PASSWORD=your_secure_password
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_admin_password
ADMIN_SECRET_KEY=$(openssl rand -hex 32)
ALLOWED_ORIGINS=https://pasty.yourdomain.com
VITE_API_URL=https://pastyapi.yourdomain.com
EOF
```

3. Start the services:

```bash
docker-compose up -d
```

The frontend will be available at `http://localhost:8352` and the backend API at `http://localhost:8351`.

Now you can configure HTTPS and set up your reverse proxy to route traffic to these ports.

## Configuration

### Environment Variables

| Variable            | Description                                  | 
| ------------------- | -------------------------------------------- | 
| `POSTGRES_PASSWORD` | PostgreSQL database password                 | 
| `ADMIN_USERNAME`    | Admin panel username                         | 
| `ADMIN_PASSWORD`    | Admin panel password                         | 
| `ADMIN_SECRET_KEY`  | Secret key for admin session signing         | 
| `ALLOWED_ORIGINS`   | Comma-separated list of allowed CORS origins | 
| `VITE_API_URL`      | Backend API URL for the frontend             | 

## Development

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The development server will be available at `http://localhost:5173`.

## License

MIT License. See [LICENSE](LICENSE) for details.
