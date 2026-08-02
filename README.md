# Clinic Backend

NestJS backend source base for the Clinic Management System.

The `src` layout follows `docs/high_level_design.md`.

```text
src/
├── main.ts
├── app.module.ts
├── config/
├── domain/
│   ├── entities/
│   ├── enums/
│   ├── repositories/
│   ├── types/
│   └── value-objects/
├── application/
│   ├── dtos/
│   ├── ports/
│   └── use-cases/
├── infrastructure/
│   └── persistence/
│       ├── prisma/
│       └── repositories/
└── presentation/
    ├── controllers/
    ├── decorators/
    ├── filters/
    ├── guards/
    ├── interceptors/
    └── response/
```

There is intentionally no `src/common` folder. Shared behavior is placed in the layer that owns it:

- Domain primitives: `domain/*`
- Use cases, ports, DTOs: `application/*`
- External adapters and persistence: `infrastructure/*`
- HTTP controllers, guards, filters, interceptors, decorators: `presentation/*`

## Local Database (Docker)

Starts MySQL (port 3306) and Redis (port 6379) matching `.env.example`. On first run, MySQL auto-applies `database/schema.sql` then `database/seed.sql`.

```bash
docker compose up -d
docker compose down       # stop containers, keep data
docker compose down -v    # stop and wipe the database volume (re-seeds next run)
```

## Local Commands

```bash
npm install
cp .env.example .env
npm run prisma:generate
npm run start:dev
```

Health endpoint:

```http
GET /api/v1/health
```

Message lookup endpoint:

```http
GET /api/v1/messages/MSG_INFO_0001
```
