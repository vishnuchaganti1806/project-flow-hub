# SkillProject Backend

## Setup
```bash
cd backend
npm install
cp .env.example .env   # Edit with your MongoDB URI & JWT secret
npm run dev
```

## API Base URL
`http://localhost:5000/api`

## Environment Variables
| Variable | Description |
|----------|-------------|
| PORT | Server port (default: 5000) |
| MONGO_URI | MongoDB connection string |
| JWT_SECRET | Secret key for JWT signing |
| JWT_EXPIRE | Token expiry (default: 1h) |
| FRONTEND_URL | CORS origin (default: http://localhost:5173) |

## Endpoints
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user
- `GET/POST /api/ideas` - CRUD ideas
- `GET/POST /api/teams` - CRUD teams
- `GET/POST /api/doubts` - CRUD doubts
- `GET/POST /api/deadlines` - CRUD deadlines
- `GET/POST /api/reviews` - CRUD reviews
- `GET /api/notifications` - Get notifications
- `GET /api/admin/stats` - Admin statistics
