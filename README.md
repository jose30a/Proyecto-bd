# Design Login Screen

This is a code bundle for Design Login Screen. The original project is available at https://www.figma.com/design/MKPVGv9Y35hxPfDSbVME2I/Design-Login-Screen.

## Architecture

This application uses a **stored procedure architecture** where:
- **Frontend**: React application (this repo)
- **Minimal API Layer**: Express server that only calls PostgreSQL stored procedures
- **Database**: PostgreSQL with all business logic in stored procedures

## Quick Start

### 1. Install Frontend Dependencies

```bash
npm install
```

### 2. Set Up Database and API Server

See **[SETUP.md](./SETUP.md)** for detailed step-by-step instructions on:
- Setting up PostgreSQL database
- Configuring the API server
- Running your SQL files
- Creating stored procedures

### 3. Start Development Servers

**Terminal 1 - API Server:**
```bash
cd server
npm install
npm start
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

## Project Structure

```
├── server/                 # Minimal API layer (calls stored procedures only)
│   ├── index.js           # Express server
│   ├── package.json
│   └── setup-database.js  # Script to run SQL files
├── src/
│   ├── services/
│   │   ├── api.ts         # API client
│   │   └── database.ts    # Database service layer
│   └── components/        # React components
└── SETUP.md               # Detailed setup guide
```

## Environment Variables

Create a `.env` file in the root directory:
```env
VITE_API_URL=http://localhost:3001/api
```

Create a `.env` file in the `server` directory (see `server/env.example.txt`):
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=viajesucab
DB_USER=postgres
DB_PASSWORD=your_password
```

## Important Notes

- All business logic is in PostgreSQL stored procedures
- The API server only proxies calls to stored procedures (no business logic)
- See `server/example-procedures.sql` for example stored procedures
- Update `src/services/database.ts` to add functions for your stored procedures
