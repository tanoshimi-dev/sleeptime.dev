# User Management for Sleeptime.dev

## 1. Introduction

sleeptime.devは、複数のサブシステム（例：prj1.sleeptime.dev、prj2.sleeptime.dev）を持つ大規模なプロジェクトであり、これらのサブシステム全体で統一されたユーザー管理と認証基盤が必要です。
prj0はそのための**中央集権的なユーザーポータル**を構築するプロジェクトです。このポータルは、Auth0をアイデンティティプロバイダーとして利用し、ユーザー登録、ログイン、プロファイル管理、組織管理、サブシステムへのアクセス制御などの機能を提供します。

## 2. Infrastructure

### 2.1 Servers

- VPS 1: Portal Server
  - Dockerコンテナで運用
  - Next.jsフロントエンドとSpring Bootバックエンドをホスト
  - Traefik v3をリバースプロキシとして使用し、ドメインごとにルーティング
  - PostgreSQLとRedisも同じVPS内でホスト（将来的には分離も検討）
- VPS 2: Mail Server
  - Postfix + Dovecotで構築
  - VPS 1からSMTPでメール送信（ユーザー招待、パスワードリセットなど）

### 2.2 URL Structure

```
sleeptime.dev (Portal) / backend.sleeptime.dev (API)
├── prj1.sleeptime.dev (Sub-system 1) / backend-prj1.sleeptime.dev
├── prj2.sleeptime.dev (Sub-system 2) / backend-prj2.sleeptime.dev
├── prj3.sleeptime.dev (Sub-system 3) / backend-prj3.sleeptime.dev
└── ... (future sub-systems)
```

### 2.3 Project Directory Structure

```
sleeptime.dev/               ← Portal (prj0) — this repository
├── doc/                     ← documents, design docs, API specs
│   └── dev-plan/            ← development plans
└── sys/                     ← system resources (programs, configs, web assets)
    ├── backend/             ← Spring Boot API
    └── frontend/            ← Next.js SPA

※ monorepo構成の場合、backend/frontend の分離は不要
```

## 3. Target Users

| Role                 | Description                                                       |
| -------------------- | ----------------------------------------------------------------- |
| Super Admin          | Portal-level admin — manages all users, orgs, sub-systems         |
| End User             | Regular user — logs in, manages own profile, accesses sub-systems |
| Sub-system (Machine) | Downstream application that validates tokens and syncs users      |

---

## 4. Architecture Overview

### 4.1 High-Level Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                         Clients                              │
│  Portal SPA          │  prj1 App        │  prj2 App         │
│  sleeptime.dev       │  prj1.sleep...   │  prj2.sleep...    │
└──────┬───────────────┴───────┬──────────┴────────┬──────────┘
       │                       │                    │
       │            ┌──────────▼────────────────────▼──────┐
       │            │  Token Validation (JWKS endpoint)    │
       │            │  Sub-systems validate JWTs locally    │
       │            └──────────────────────────────────────┘
       │
┌──────▼──────────────────────────────────────────────────────┐
│               VPS 1 — Portal Server (Docker)                │
│                                                              │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  Traefik v3 (reverse proxy, auto SSL, label routing)    ││
│  └────┬──────────┬──────────┬──────────┬───────────────────┘│
│       │          │          │          │                     │
│  ┌────▼───┐ ┌────▼─────┐ ┌─▼──────┐ ┌▼──────┐             │
│  │Next.js │ │Spring    │ │prj1    │ │prj2   │             │
│  │Frontend│ │Boot API  │ │App     │ │App    │             │
│  └────────┘ └────┬──┬──┘ └────────┘ └───────┘             │
│                  │  │                                       │
│  ┌──────────┐    │  │    ┌────────┐                        │
│  │  Auth0   │◄───┘  └───►│ Redis  │                        │
│  │(Identity)│            └────────┘                        │
│  └──────────┘    ┌────────────┐                            │
│                  │ PostgreSQL │                             │
│                  └────────────┘                             │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│               VPS 2 — Mail Server                            │
│  Postfix + Dovecot (SMTP :587 from VPS 1, invitations)      │
└──────────────────────────────────────────────────────────────┘
```

### 4.2 Tech Stack

| Layer                   | Technology                                                  |
| ----------------------- | ----------------------------------------------------------- |
| Frontend                | Next.js 14+ (App Router), React 18, TailwindCSS, Zustand    |
| Backend                 | Java 21, Spring Boot 3, Spring Security, Spring Data JPA    |
| Job Queues              | Spring Scheduler + Redis (or Quartz for complex scheduling) |
| API Contracts           | TypeSpec                                                    |
| Identity Provider       | Auth0                                                       |
| Database                | PostgreSQL (self-hosted on VPS)                             |
| Cache / Sessions        | Redis (self-hosted on VPS)                                  |
| Email                   | Self-hosted mail server on VPS 2 (Postfix + Dovecot)        |
| Reverse Proxy / Ingress | Traefik v3 (Docker-native, auto SSL, routing via labels)    |
| Containers              | Docker + Docker Compose                                     |
| Build Tools             | Gradle (backend), pnpm (frontend)                           |

### 4.3 Authentication Providers (via Auth0)

| Provider         | Auth0 Connection Type | Notes                                  |
| ---------------- | --------------------- | -------------------------------------- |
| Email / Password | Database connection   | Auth0 managed, with email verification |
| Google           | Social (OAuth2/OIDC)  | Google Workspace + personal accounts   |
| GitHub           | Social (OAuth2)       | Developer-focused login                |
| Microsoft        | Social (OAuth2/OIDC)  | Azure AD + personal Microsoft accounts |
| Apple            | Social (OAuth2/OIDC)  | Sign in with Apple                     |
| LINE             | Social (OAuth2)       | Custom social connection in Auth0      |

---

## 5. Authentication & Authorization Flow

### 5.1 Login Flow (Authorization Code Flow with PKCE)

```
User → Portal SPA → Auth0 /authorize → Auth0 Login Page
  → Auth0 callback → Portal SPA receives authorization code
  → Portal Backend exchanges code for tokens
  → Backend returns session cookie to SPA
```

### 5.2 Sub-system Token Validation

```
User → Sub-system App → sends JWT in Authorization header
  → Sub-system fetches JWKS from Auth0 (cached)
  → Validates JWT signature, expiry, audience, issuer
  → Grants or denies access
```

### 5.3 Role-Based Access Control (RBAC)

| Permission             | Super Admin | End User | Sub-system (M2M) |
| ---------------------- | :---------: | :------: | :--------------: |
| Manage all users       |      ✓      |          |                  |
| Manage organizations   |      ✓      |          |                  |
| View/edit own profile  |      ✓      |    ✓     |                  |
| Access sub-systems     |      ✓      |    ✓     |                  |
| Validate tokens (JWKS) |             |          |        ✓         |
| Sync user data         |             |          |        ✓         |

---

## 6. Data Model

### 6.1 Core Entities

```
┌─────────────┐       ┌──────────────────┐       ┌──────────────┐
│   users      │──────►│ user_org_roles    │◄──────│ organizations│
│              │       │                  │       │              │
│ id (PK)      │       │ user_id (FK)     │       │ id (PK)      │
│ auth0_sub    │       │ org_id (FK)      │       │ name         │
│ email        │       │ role             │       │ slug         │
│ display_name │       └──────────────────┘       │ created_at   │
│ avatar_url   │                                  └──────────────┘
│ locale       │
│ created_at   │       ┌──────────────────┐
│ updated_at   │──────►│ user_subsystems   │
└─────────────┘       │                  │       ┌──────────────┐
                       │ user_id (FK)     │◄──────│ subsystems   │
                       │ subsystem_id (FK)│       │              │
                       │ enabled          │       │ id (PK)      │
                       │ granted_at       │       │ slug         │
                       └──────────────────┘       │ name         │
                                                  │ base_url     │
                                                  │ client_id    │
                                                  └──────────────┘
```

### 6.2 Auth0 Sync Strategy

- ユーザー作成・更新時にAuth0 Management APIを使用してAuth0側と同期
- Auth0のuser_idは `auth0_sub` としてローカルDBに保存
- Auth0 Post-Login Actionでカスタムクレーム（roles, org_id）をトークンに付与

---

## 7. API Design (TypeSpec)

### 7.1 Key Endpoints

| Method | Path                     | Description                 |
| ------ | ------------------------ | --------------------------- |
| GET    | /api/auth/login          | Redirect to Auth0 login     |
| GET    | /api/auth/callback       | Auth0 callback handler      |
| POST   | /api/auth/logout         | Logout and revoke tokens    |
| GET    | /api/users/me            | Get current user profile    |
| PATCH  | /api/users/me            | Update current user profile |
| GET    | /api/admin/users         | List all users (admin)      |
| GET    | /api/admin/organizations | List organizations (admin)  |
| POST   | /api/admin/organizations | Create organization (admin) |
| GET    | /api/admin/subsystems    | List sub-systems (admin)    |

### 7.2 M2M Endpoints (for sub-systems)

| Method | Path                     | Description                    |
| ------ | ------------------------ | ------------------------------ |
| GET    | /api/m2m/users/:auth0Sub | Get user info by Auth0 subject |
| POST   | /api/m2m/users/sync      | Sync user data to sub-system   |
| GET    | /.well-known/jwks.json   | JWKS endpoint (proxied Auth0)  |

---

## 8. Deployment

### 8.1 Docker Compose Services

| Service  | Image / Build  | Port(s)         | Notes                   |
| -------- | -------------- | --------------- | ----------------------- |
| traefik  | traefik:v3     | 80, 443         | Reverse proxy, auto TLS |
| frontend | ./sys/frontend | 3000 (internal) | Next.js                 |
| backend  | ./sys/backend  | 8080 (internal) | Spring Boot             |
| postgres | postgres:16    | 5432 (internal) | Persistent volume       |
| redis    | redis:7-alpine | 6379 (internal) | Session & cache         |

### 8.2 Environment Separation

| Environment | Domain              | Notes                             |
| ----------- | ------------------- | --------------------------------- |
| Local Dev   | localhost:3000/8080 | Docker Compose (dev profile)      |
| Production  | sleeptime.dev       | VPS 1, Traefik with Let's Encrypt |
