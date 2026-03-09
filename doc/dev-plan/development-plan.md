# Development Plan — prj0 (User Management Portal)

## Overview

sleeptime.devの中央ユーザー管理ポータルの開発計画。
フェーズごとに段階的に構築し、各フェーズ完了時に動作確認可能な状態を目指す。

---

## Phase 1: Project Scaffolding & Local Dev Environment

**Goal**: 開発環境の構築とプロジェクトの骨組みを作成

### 1.1 Backend Setup

- [ ] Spring Boot 3 プロジェクト初期化 (Java 21, Gradle)
- [ ] `sys/backend/` にプロジェクト配置
- [ ] application.yml（dev / prod プロファイル分離）
- [ ] PostgreSQL接続設定 (Spring Data JPA)
- [ ] Redis接続設定 (Spring Session)
- [ ] ヘルスチェックエンドポイント (`/actuator/health`)

### 1.2 Frontend Setup

- [ ] Next.js 14+ プロジェクト初期化 (App Router, pnpm)
- [ ] `sys/frontend/` にプロジェクト配置
- [ ] TailwindCSS セットアップ
- [ ] Zustand ストア初期構成
- [ ] 基本レイアウト（ヘッダー、サイドバー、メインコンテンツ）

### 1.3 Docker & Infrastructure

- [ ] `docker-compose.yml` 作成（dev profile）
  - traefik, frontend, backend, postgres, redis
- [ ] Traefik v3 設定（ローカル用ルーティング）
- [ ] PostgreSQL 初期化スクリプト
- [ ] `.env.example` 作成

### 1.4 Deliverables

- `docker compose up` でフロント・バックエンド・DB・Redisが起動する状態
- ヘルスチェックが通ること
- フロントエンドのトップページが表示されること

---

## Phase 2: Auth0 Integration & Authentication

**Goal**: Auth0を使った認証フローの実装

### 2.1 Auth0 Setup

- [ ] Auth0 テナント作成・設定
- [ ] Application 登録（SPA + Regular Web App）
- [ ] Auth0 Database connection（Email/Password）有効化
- [ ] Social connections 設定（Google, GitHub — 最小限から開始）
- [ ] API (Resource Server) 登録

### 2.2 Backend Auth

- [ ] Spring Security + OAuth2 Resource Server 設定
- [ ] JWT検証（Auth0 JWKS endpoint）
- [ ] `/api/auth/login` — Auth0へリダイレクト
- [ ] `/api/auth/callback` — コールバック処理、トークン交換
- [ ] `/api/auth/logout` — セッション破棄、Auth0ログアウト
- [ ] セッション管理（Redis-backed Spring Session）

### 2.3 Frontend Auth

- [ ] Auth0 SDK (`@auth0/nextjs-auth0`) 導入
- [ ] ログインページ（Auth0 Universal Login へリダイレクト）
- [ ] 認証状態管理（Zustand + Auth context）
- [ ] 認証ガード（未ログイン時リダイレクト）
- [ ] ログアウト処理

### 2.4 Deliverables

- Email/Password + Google でログイン・ログアウトできること
- 認証済みユーザーのみがダッシュボードにアクセスできること
- JWTが正しく検証されること

---

## Phase 3: User Profile & Data Model

**Goal**: ユーザープロファイル管理とデータモデルの実装

### 3.1 Database Schema

- [ ] Flyway (or Liquibase) によるマイグレーション管理導入
- [ ] `users` テーブル作成
- [ ] `subsystems` テーブル作成
- [ ] `user_subsystems` テーブル作成

### 3.2 Backend API

- [ ] `GET /api/users/me` — 自分のプロファイル取得
- [ ] `PATCH /api/users/me` — プロファイル更新（display_name, avatar_url, locale）
- [ ] Auth0 Post-Login Action — 初回ログイン時にローカルDBへユーザー自動作成
- [ ] Auth0 Management API 連携（ユーザー情報の双方向同期）

### 3.3 Frontend Pages

- [ ] ダッシュボード（ログイン後のホーム）
- [ ] プロファイル表示ページ
- [ ] プロファイル編集ページ（フォーム + バリデーション）
- [ ] アバターアップロード

### 3.4 Deliverables

- ユーザーが自分のプロファイルを表示・編集できること
- Auth0ログイン時にローカルDBにユーザーが自動作成されること
- DBマイグレーションが正しく動作すること

---

## Phase 4: Admin Features & User Management

**Goal**: 管理者機能とユーザー管理の実装

### 4.1 Admin API

- [ ] `GET /api/admin/users` — ユーザー一覧（ページネーション、検索）
- [ ] `GET /api/admin/users/:id` — ユーザー詳細
- [ ] `PATCH /api/admin/users/:id` — ユーザー情報更新（ロール変更など）
- [ ] `DELETE /api/admin/users/:id` — ユーザー無効化
- [ ] `GET /api/admin/subsystems` — サブシステム一覧

### 4.2 RBAC Implementation

- [ ] Auth0 カスタムクレーム（role）をPost-Login Actionで付与
- [ ] Spring Security `@PreAuthorize` によるロールベースアクセス制御
- [ ] Super Admin / End User ロールの判定ロジック

### 4.3 Admin Frontend

- [ ] ユーザー管理画面（一覧、検索、詳細、編集）
- [ ] サブシステム管理画面
- [ ] Admin用ナビゲーション（ロールに応じた表示切替）

### 4.4 Deliverables

- Super Adminがユーザー・サブシステムを管理できること
- End Userは管理画面にアクセスできないこと
- RBACが正しく機能すること

---

## Phase 5: Sub-system Integration (M2M)

**Goal**: サブシステムとの連携機能の実装

### 5.1 M2M Authentication

- [ ] Auth0 Machine-to-Machine (Client Credentials) 設定
- [ ] M2M用のAPIスコープ定義
- [ ] M2Mトークン検証ロジック

### 5.2 M2M API

- [ ] `GET /api/m2m/users/:auth0Sub` — ユーザー情報取得
- [ ] `POST /api/m2m/users/sync` — ユーザーデータ同期
- [ ] `GET /.well-known/jwks.json` — JWKS proxy endpoint

### 5.3 SDK / Integration Guide

- [ ] サブシステム向けの認証統合ガイド作成
- [ ] JWT検証のサンプルコード（各言語）
- [ ] トークンに含まれるカスタムクレームの仕様書

### 5.4 Deliverables

- サブシステムがM2M APIでユーザー情報を取得できること
- サブシステムがJWKSでトークンをローカル検証できること

---

## Phase 6: Email & Notifications

**Goal**: メール通知機能の実装

### 6.1 Mail Server Integration

- [ ] VPS 2 のメールサーバー（Postfix + Dovecot）セットアップ
- [ ] Spring Boot からのSMTP送信設定
- [ ] メールテンプレートエンジン（Thymeleaf）

### 6.2 Email Features

- [ ] ユーザー招待メール
- [ ] パスワードリセット（Auth0 経由）
- [ ] メールアドレス変更確認
- [ ] アカウント関連通知（ロール変更、サブシステムアクセス付与など）

### 6.3 Deliverables

- 各種メール通知が正しく送信されること
- SPF / DKIM / DMARC が正しく設定されていること

---

## Phase 7: Additional Auth Providers & Polish

**Goal**: 追加の認証プロバイダーとUI/UXの改善

### 7.1 Additional Auth Providers

- [ ] Microsoft (Azure AD) 連携
- [ ] Apple Sign In 連携
- [ ] LINE ログイン連携（Custom Social Connection）

### 7.2 UI/UX Polish

- [ ] レスポンシブデザイン対応
- [ ] ダークモード対応
- [ ] ローディング・エラーステートの改善
- [ ] i18n（日本語 / 英語）

### 7.3 Deliverables

- 全認証プロバイダーでログインできること
- モバイル・デスクトップ両方で快適に使用できること

---

## Phase 8: Production Deployment & Hardening

**Goal**: 本番環境へのデプロイとセキュリティ強化

### 8.1 Production Infrastructure

- [ ] VPS 1 のセットアップ（Docker, Traefik, SSL）
- [ ] `docker-compose.prod.yml` 作成
- [ ] DNS設定（sleeptime.dev, backend.sleeptime.dev）
- [ ] Let's Encrypt 自動SSL証明書

### 8.2 Security Hardening

- [ ] CORS設定の最終確認
- [ ] Rate limiting（API）
- [ ] CSRF保護
- [ ] セキュリティヘッダー（CSP, HSTS, X-Frame-Options）
- [ ] Auth0 Attack Protection 設定（brute force, breached password detection）
- [ ] ログ・監査証跡

### 8.3 Monitoring & Operations

- [ ] アプリケーションログ集約
- [ ] ヘルスチェック & アラート
- [ ] データベースバックアップ設定
- [ ] CI/CDパイプライン（検討）

### 8.4 Deliverables

- `sleeptime.dev` で本番稼働していること
- セキュリティ要件を満たしていること
- 監視・バックアップが動作していること

---

## Phase Summary

| Phase | Name                          | Dependencies |
| ----- | ----------------------------- | ------------ |
| 1     | Project Scaffolding & Local Dev | —          |
| 2     | Auth0 Integration & Auth      | Phase 1      |
| 3     | User Profile & Data Model     | Phase 2      |
| 4     | Admin & User Management       | Phase 3      |
| 5     | Sub-system Integration (M2M)  | Phase 3      |
| 6     | Email & Notifications         | Phase 4      |
| 7     | Additional Auth & Polish       | Phase 4      |
| 8     | Production Deployment         | Phase 5–7    |

※ Phase 4 と 5 は並行開発可能。Phase 6 と 7 も並行開発可能。
