# Goose Game Project

This is a full-stack web application. The project consists of a React-based frontend and a NestJS-based backend.

## Project Structure

```
.
├── frontend/          # React frontend application
└── backend/          # NestJS backend application
```

## Frontend

The frontend is built with:
- React 18
- TypeScript
- Vite as the build tool
- Material-UI (MUI) for UI components
- React Router for navigation
- Axios for HTTP requests

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
```

## Backend

The backend is built with:
- NestJS framework
- TypeScript
- Prisma as the ORM
- JWT authentication
- Passport for authentication strategies
- Swagger for API documentation

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Set up the database:
```bash
npx prisma generate
npx prisma migrate dev
```

4. Start the development server:
```bash
npm run start:dev
```

5. For production:
```bash
npm run build
npm run start:prod
```

## Development

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- PostgreSQL database

### Environment Variables

Both frontend and backend require environment variables to be set up. Check the respective `.env.example` files in each directory for required variables.

## Testing

### Frontend Tests
```bash
cd frontend
npm run test
```

### Backend Tests
```bash
cd backend
npm run test
```

## API Documentation

The backend API.
```
http://localhost:3000/api
```

## License

This project is private and unlicensed. 
