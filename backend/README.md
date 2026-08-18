# Kizuna Backend Foundation

This directory houses the Node.js + Express + TypeScript backend API foundation for Kizuna.

## Getting Started

### 1. Installation
Install project dependencies:
```bash
npm install
```

### 2. Running in Development
Launch the server in hot-reload watch mode using `tsx`:
```bash
npm run dev
```
The server runs on [http://localhost:3000](http://localhost:3000) by default.

To run on a custom port:
```bash
PORT=4000 npm run dev
```

### 3. Production Compilation & Build
Compile TypeScript code to JavaScript inside the `dist/` directory:
```bash
npm run build
```

### 4. Running in Production
Start the compiled production server:
```bash
npm start
```

## Available Endpoints
- `GET /api/health` — Checks API service status.
