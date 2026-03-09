# CLAUDE.md — sleeptime.dev (prj0: User Management Portal)

## Project Overview

Central user management portal for the sleeptime.dev ecosystem. Provides unified authentication, user profiles, and access control across all sub-systems (prj1, prj2, ...).

## Tech Stack

- **Frontend**: Next.js 14+ (App Router), React 18, TailwindCSS, Zustand — in `sys/frontend/`
- **Backend**: Java 21, Spring Boot 3, Spring Security, Spring Data JPA — in `sys/backend/`
- **Identity Provider**: Auth0
- **Database**: PostgreSQL (self-hosted)
- **Cache/Sessions**: Redis (self-hosted)
- **API Contracts**: TypeSpec
- **Reverse Proxy**: Traefik v3 (production VPS only, not used in local dev)
- **Build Tools**: Gradle (backend), pnpm (frontend)
- **Containers**: Docker + Docker Compose

## Project Structure

```
sleeptime.dev/
├── CLAUDE.md
├── doc/                 ← design docs, API specs
│   ├── dev-plan/        ← development plans
│   └── system-design-prj0.md
└── sys/                 ← ALL system resources
    ├── docker-compose.yml
    ├── .env.example
    ├── backend/         ← Spring Boot API
    ├── frontend/        ← Next.js SPA
    └── db/              ← Database init scripts
```

## URL Convention

- Portal: `sleeptime.dev` / `backend.sleeptime.dev`
- Sub-systems: `prjN.sleeptime.dev` / `backend-prjN.sleeptime.dev`

## Development Notes

- Documentation is written in a mix of Japanese and English
- Design doc: `doc/system-design-prj0.md`
- Docker commands run from `sys/` directory: `cd sys && docker compose up --build`
