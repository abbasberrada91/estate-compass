# ImmoGest Frontend (estate-compass)

## Prerequisites
- Node.js 18+

## Setup
```sh
npm install
```

## Environment
Copy `.env.example` to `.env` and adjust if needed:
```sh
cp .env.example .env
```

`VITE_API_BASE_URL` should point to the Flask backend (default: `http://127.0.0.1:5000`).

## Run
```sh
npm run dev
```

## One command startup
From the backend repo:
```sh
bash /home/abbasberrada/agent_immo/start_all.sh
```

## Troubleshooting ports & logs
- Frontend port: 8080
- Frontend logs: `tail -f /tmp/estate_compass_frontend.log`

## Notes
- The UI expects the backend API under `/api`.
- Leads, contacts, properties, affairs, documents, and search profiles are loaded via API.

