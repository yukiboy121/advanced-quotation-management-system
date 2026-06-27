# Advanced Quotation Generator (Enterprise SaaS)

Production-ready fullstack quotation management platform built with:
- Next.js App Router + TypeScript
- PostgreSQL + Drizzle ORM
- JWT auth + RBAC + validation + rate limiting
- React Hook Form + Zod + Zustand + Chart.js
- PDF generation + email history + backup/restore
- Dockerized deployment

## Quick Start

1. Install dependencies
```bash
npm install
```

2. Configure environment
```bash
cp .env.example .env
# set DATABASE_URL and JWT_SECRET
```

3. Push schema
```bash
npx drizzle-kit push
```

4. Start app
```bash
npm run dev
```

5. Seed sample data
```bash
curl -X POST http://localhost:3000/api/seed
```

Default admin:
- Email: `admin@example.com`
- Password: `Admin@12345`

## API Docs
- OpenAPI JSON: `/api/docs`
- Health: `/api/health`

## Docker
```bash
docker compose up --build
```

## Security Highlights
- JWT authentication via HttpOnly cookies
- Password hashing with bcrypt
- Role-based authorization
- Input validation using Zod
- SQL injection protection via parameterized Drizzle queries
- Basic rate limiting middleware utility
- Audit logging for critical actions

## Modules Included
- Dashboard & analytics
- Customers / products / quotations
- Version history and status tracking
- PDF download and email send flow
- Activity logs and notifications
- Company settings
- Backup export/restore
