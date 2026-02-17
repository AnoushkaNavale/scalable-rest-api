# Scalable API (Auth + RBAC + Task CRUD)

Backend-first project with:

- User registration/login (bcrypt hashing + JWT auth)
- Role-based access control (`USER`, `ADMIN`)
- Task CRUD APIs (protected)
- API versioning (`/api/v1`)
- Validation, sanitization, and centralized error handling
- Swagger API docs + Postman collection
- PostgreSQL database schema via Prisma
- Basic vanilla JS frontend for auth + protected dashboard CRUD

## Tech Stack

- **Backend:** Node.js, Express, Prisma ORM
- **Database:** PostgreSQL
- **Auth/Security:** bcryptjs, jsonwebtoken, express-validator, helmet, express-rate-limit
- **Docs:** swagger-jsdoc, swagger-ui-express, Postman
- **Frontend:** Vanilla JS + HTML/CSS

## Project Structure

```text
.
├── prisma/
│   └── schema.prisma
├── public/
│   ├── app.js
│   ├── index.html
│   └── styles.css
├── postman/
│   └── scalable-api.postman_collection.json
├── src/
│   ├── config/
│   ├── middlewares/
│   ├── modules/
│   │   ├── auth/
│   │   └── task/
│   ├── app.js
│   ├── routes.js
│   └── server.js
├── .env.example
└── package.json
```

## Setup

### 1) Install dependencies

```bash
npm install
```

### 2) Configure environment variables

```bash
cp .env.example .env
```

Update `.env` values:

- `PORT`
- `DATABASE_URL`
- `JWT_SECRET`

### 3) Generate Prisma client and run migrations

```bash
npm run prisma:generate
npm run prisma:migrate
```

### 4) Run the app

```bash
npm run dev
```

Or production mode:

```bash
npm start
```

## Access Points

- **Frontend UI:** `http://localhost:5000/`
- **Swagger Docs:** `http://localhost:5000/api-docs`
- **API Base URL:** `http://localhost:5000/api/v1`

## API Overview

### Auth

- `POST /auth/register` - register user
- `POST /auth/login` - login and get JWT

### Tasks (JWT required)

- `POST /tasks` - create task (owner = logged-in user)
- `GET /tasks` - get own tasks
- `GET /tasks/all` - get all tasks (**admin only**)
- `GET /tasks/:id` - get one task (owner or admin)
- `PUT /tasks/:id` - update one task (owner or admin)
- `DELETE /tasks/:id` - delete one task (owner or admin)

## Postman

Import:

`postman/scalable-api.postman_collection.json`

Collection variables:

- `baseUrl` (default: `http://localhost:5000/api/v1`)
- `token` (automatically populated after login request)
- `taskId`

## Security Practices Implemented

- Password hashing with bcrypt (`bcryptjs`)
- JWT authentication with expiry (`1h`) and protected routes
- Role-based authorization (`USER` vs `ADMIN`)
- Request validation/sanitization using `express-validator`
- Security headers via `helmet`
- API throttling via `express-rate-limit`
- Centralized error handling for validation/runtime/database errors

## Frontend Features

- Register and login forms
- Protected dashboard that requires JWT
- Task create/read/update/delete actions
- API success/error feedback messages
- Session-scoped token storage (`sessionStorage`)

## Database Schema

Prisma models:

- `User`:
  - `id`, `name`, `email`, `password`, `role`, `createdAt`
- `Task`:
  - `id`, `title`, `description`, `status`, `userId`, `createdAt`

Enums:

- `Role`: `USER`, `ADMIN`
- `Status`: `PENDING`, `COMPLETED`

## Scalability Note

This codebase is organized by modules (`auth`, `task`) with shared middleware, which supports adding new domains cleanly. For larger scale:

1. **Horizontal scaling:** run multiple stateless API instances behind a load balancer.
2. **Caching:** add Redis for hot reads, rate-limit state, and token deny-lists.
3. **Async workloads:** offload long-running jobs to queues/workers.
4. **Service decomposition:** split modules into microservices when team/domain complexity grows.
5. **Observability:** add structured logging, metrics, and distributed tracing.

## Notes

- To test admin endpoints, set a user role to `ADMIN` in the database.
- If Prisma reports missing tables, rerun migrations against the correct database URL.
