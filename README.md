# be-worker-template

Cloudflare Worker backend API template built with Hono, OpenAPI, and Drizzle ORM.

This project provides a modular API foundation with JWT authentication, role-based protection, PostgreSQL access through Cloudflare Hyperdrive, and generated API documentation.

## Tech Stack

- Runtime: Cloudflare Workers
- Framework: Hono + @hono/zod-openapi
- API docs: OpenAPI 3.1 + Swagger UI
- ORM: Drizzle ORM + drizzle-kit
- Database: PostgreSQL (via Hyperdrive binding)
- Validation: Zod
- Auth: JWT + role middleware

## Features

- Modular architecture (Auth, User, Post)
- OpenAPI route definitions using Zod schemas
- Built-in Swagger UI
- Unified response shape for success and errors
- Validation error formatting
- Query exception mapping for common database errors

## Project Structure

```text
src/
  index.ts                  # Root worker app, OpenAPI registration
  api-app.ts                # API app composition + middlewares + modules
  core/
    base/                   # Base classes for module/controller/service/repository
    config/                 # OpenAPI + error code config
    dtos/                   # Shared filter/pagination DTOs
    exception/              # App exception classes
    middlewares/            # Auth, DB, validation, error middlewares
    types/                  # Shared app types
  db/
    base-schemas.ts
    migrations/
  modules/
    auth/
    user/
    post/
```

## Prerequisites

- Node.js 20+
- Corepack enabled (for Yarn 4)
- PostgreSQL instance for local development
- Cloudflare account (for deployment)

## Installation

```bash
corepack enable
yarn install
# Optional (for local overrides/tooling)
cp .env.example .env
```

## Configuration

### 1) JWT secret

Set `JWT_SECRET` in Worker bindings:

- `wrangler.jsonc` under `vars`

For deployed environments, set it as a Cloudflare secret:

```bash
wrangler secret put JWT_SECRET
```

The repository also includes `.env.example`; use `.env` only if your local workflow/tooling reads it.

### 2) Hyperdrive/PostgreSQL connection

Update `wrangler.jsonc` Hyperdrive config:

- `hyperdrive[].id` for your Cloudflare Hyperdrive resource
- `hyperdrive[].localConnectionString` for local migration/dev database access

Example:

```jsonc
"hyperdrive": [
  {
    "binding": "HYPERDRIVE",
    "id": "<your-hyperdrive-id>",
    "localConnectionString": "postgresql://user:password@localhost:5432/db_name"
  }
]
```

## Database Workflow

Drizzle reads the local DB connection from `wrangler.jsonc` (`HYPERDRIVE.localConnectionString`).

```bash
# Generate new migration files from schema changes
yarn db:generate

# Apply migrations
yarn db:migrate

# Open Drizzle Studio
yarn db:studio
```

Current schema includes:

- `users` table
- `posts` table
- enums: `user_role`, `user_status`, `post_status`

## Run Locally

```bash
yarn dev
```

Default local URL: `http://localhost:8787`

- Swagger UI: `/`
- OpenAPI JSON: `/openapi.json`
- API base path: `/api`

## API Overview

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`

### Users

- `GET /api/users`
- `GET /api/users/profile` (auth required)
- `PATCH /api/users/profile` (auth required)

### Posts

- `GET /api/posts`
- `GET /api/posts/{id}`
- `POST /api/posts` (auth required)
- `PATCH /api/posts/{id}` (auth + owner)
- `DELETE /api/posts/{id}` (auth + owner)

## Authentication

Authenticated endpoints expect:

```http
Authorization: Bearer <jwt_token>
```

JWT is issued from register/login responses.

## Response Format

Successful responses:

```json
{
    "statusCode": 200,
    "message": "OK",
    "data": {}
}
```

Validation failures:

```json
{
    "statusCode": 422,
    "message": "Validation Failed",
    "data": [{ "field": "fieldName", "message": "error message" }]
}
```

Application/database errors:

```json
{
    "statusCode": 400,
    "message": "Error message",
    "errorCode": 1006,
    "data": null
}
```

## Available Scripts

- `yarn dev`: run Worker locally with Wrangler
- `yarn deploy`: deploy Worker (`--minify`)
- `yarn cf-typegen`: regenerate Cloudflare binding types
- `yarn db:generate`: generate Drizzle migration files
- `yarn db:migrate`: apply migrations
- `yarn db:studio`: open Drizzle Studio
- `yarn format`: format repository with Prettier
- `yarn commitlint`: lint commit message

## Deployment

1. Ensure production bindings/secrets are configured in Cloudflare.
2. Set secret values as needed (example):

```bash
wrangler secret put JWT_SECRET
```

3. Deploy:

```bash
yarn deploy
```

## Notes

- Path aliases are configured in `tsconfig.json` (for example `@/`, `@core/`, `@modules/`).
- If bindings change in `wrangler.jsonc`, rerun `yarn cf-typegen`.
- No automated test script is currently defined.
