# Scalable REST API (Auth + RBAC + Task Management)

A modular and secure backend system built with Node.js, Express, and Prisma. This project implements authentication, role-based access control, and a task management system, along with a minimal frontend for interaction.

---

## Overview

This project demonstrates how to build a structured and maintainable backend using a layered architecture. It includes secure authentication, protected routes, and clean separation of concerns for scalability.

---

## Features

### Authentication & Authorization

* User registration and login
* Password hashing using bcrypt
* JWT-based authentication
* Role-Based Access Control (USER, ADMIN)

### Task Management

* Create, read, update, and delete tasks
* Ownership-based access (users manage their own tasks)
* Admin-level access to all tasks

### API Design

* RESTful endpoints
* API versioning (`/api/v1`)
* Modular structure (auth, task)

### Security & Validation

* Request validation using express-validator
* Secure HTTP headers using helmet
* Rate limiting to prevent abuse
* Centralized error handling

### Documentation & Testing

* Swagger API documentation
* Postman collection for testing

### Database

* PostgreSQL database
* Prisma ORM for schema and queries

### Frontend (Basic)

* Simple UI for login/register
* Protected dashboard
* Task CRUD operations using API

---

## Tech Stack

* Node.js
* Express.js
* Prisma ORM
* PostgreSQL
* bcryptjs, jsonwebtoken
* express-validator, helmet, express-rate-limit
* Swagger (swagger-jsdoc, swagger-ui-express)
* Vanilla JavaScript (frontend)

---

## Project Structure

```text id="xt9x7f"
.
├── prisma/
├── public/
├── postman/
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

---

## Getting Started

### 1. Install dependencies

```bash id="z5r1pb"
npm install
```

### 2. Configure environment variables

```bash id="g2kqgk"
cp .env.example .env
```

Update:

* `PORT`
* `DATABASE_URL`
* `JWT_SECRET`

---

### 3. Setup database

```bash id="z2jvta"
npm run prisma:generate
npm run prisma:migrate
```

---

### 4. Run the application

Development:

```bash id="r7kplx"
npm run dev
```

Production:

```bash id="tqvsh8"
npm start
```

---

## Access

* Frontend: http://localhost:5000/
* API Base: http://localhost:5000/api/v1
* API Docs: http://localhost:5000/api-docs

---

## API Endpoints

### Auth

* POST `/auth/register`
* POST `/auth/login`

### Tasks (Protected)

* POST `/tasks`
* GET `/tasks`
* GET `/tasks/all` (Admin only)
* GET `/tasks/:id`
* PUT `/tasks/:id`
* DELETE `/tasks/:id`

---

## Security Practices

* Password hashing with bcrypt
* JWT authentication with expiration
* Role-based authorization
* Input validation and sanitization
* Rate limiting
* Centralized error handling

---

## Database Schema

### User

* id, name, email, password, role, createdAt

### Task

* id, title, description, status, userId, createdAt

---

## Limitations

* No caching layer (e.g., Redis)
* No background job processing
* No containerization (Docker)
* Not deployed to production

---

## Future Improvements

* Add Redis caching
* Implement background jobs (queues)
* Dockerize the application
* Deploy to cloud (AWS / Render)
* Add monitoring and logging

---

## Author

Anoushka Navale

---

## License

MIT License
