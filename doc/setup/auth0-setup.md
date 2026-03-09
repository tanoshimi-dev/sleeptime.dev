# Auth0 Setup Guide — sleeptime.dev

## 1. テナント情報

- **Tenant Name**: `dev-ll413keejpz65qwc`
- **Domain**: `dev-ll413keejpz65qwc.us.auth0.com`

※ テナント名は変更不可

---

## 2. Application 登録

### 2.1 Regular Web Application（Backend用）

Auth0 Dashboard → Applications → Create Application

| Setting               | Value                                                                                                                 |
| --------------------- | --------------------------------------------------------------------------------------------------------------------- |
| Name                  | Sleeptime Portal Backend                                                                                              |
| Application Type      | Regular Web Application                                                                                               |
| Allowed Callback URLs | `http://localhost:8080/login/oauth2/code/auth0` (dev), `https://backend.sleeptime.dev/login/oauth2/code/auth0` (prod) |
| Allowed Logout URLs   | `http://localhost:3000` (dev), `https://sleeptime.dev` (prod)                                                         |
| Allowed Web Origins   | `http://localhost:3000` (dev), `https://sleeptime.dev` (prod)                                                         |

記録する値:

- **Domain**: `dev-ll413keejpz65qwc.us.auth0.com`
- **Client ID**: （自動生成される）
- **Client Secret**: （自動生成される）

### 2.2 Single Page Application（Frontend用 — 任意）

> Next.js の Server-Side を使用する場合は、2.1 の Regular Web App のみで十分。
> SPA として直接 Auth0 に接続する場合のみ作成。

---

## 3. API (Resource Server) 登録

Auth0 Dashboard → Applications → APIs → Create API

| Setting    | Value                       |
| ---------- | --------------------------- |
| Name       | Sleeptime Portal API        |
| Identifier | `https://api.sleeptime.dev` |
| Signing    | RS256                       |

### 3.1 Permissions (Scopes)

APIs → Sleeptime Portal API → Permissions タブで追加:

| Permission         | Description         |
| ------------------ | ------------------- |
| `read:profile`     | Read own profile    |
| `write:profile`    | Update own profile  |
| `admin:users`      | Manage all users    |
| `admin:subsystems` | Manage sub-systems  |
| `m2m:read_users`   | M2M: Read user data |
| `m2m:sync_users`   | M2M: Sync user data |

---

## 4. Authentication Connections

### 4.1 Database Connection（デフォルトで有効）

Auth0 Dashboard → Authentication → Database

- Username-Password-Authentication が有効であることを確認
- パスワードポリシー: Good 以上を推奨

### 4.2 Social Connections（最小構成）

Auth0 Dashboard → Authentication → Social

#### Google

1. Social → Google を有効化
2. Google Cloud Console で OAuth 2.0 Client ID を作成
   - Authorized redirect URI: `https://dev-ll413keejpz65qwc.us.auth0.com/login/callback`
3. Client ID と Client Secret を Auth0 に設定

#### GitHub

1. Social → GitHub を有効化
2. GitHub → Settings → Developer settings → OAuth Apps で新規作成
   - Authorization callback URL: `https://dev-ll413keejpz65qwc.us.auth0.com/login/callback`
3. Client ID と Client Secret を Auth0 に設定

---

## 5. Auth0 Action（Post-Login）

Auth0 Dashboard → Actions → Triggers → post-login → Add Action → Build from Scratch

**Name**: `Add Custom Claims`

```javascript
exports.onExecutePostLogin = async (event, api) => {
  const namespace = "https://sleeptime.dev";

  // Add role claim
  const roles = event.authorization?.roles || [];
  api.idToken.setCustomClaim(`${namespace}/role`, roles[0] || "END_USER");
  api.accessToken.setCustomClaim(`${namespace}/role`, roles[0] || "END_USER");

  // Add email claim
  api.accessToken.setCustomClaim(`${namespace}/email`, event.user.email);
};
```

Deploy後、post-login Trigger の画面でこの Action をドラッグして追加。

---

## 6. Roles 設定

Auth0 Dashboard → User Management → Roles → Create Role

| Role        | Description                |
| ----------- | -------------------------- |
| SUPER_ADMIN | Portal admin — full access |
| END_USER    | Regular user               |

---

## 7. M2M Application（サブシステム用 — Phase 5 で設定）

> Phase 5 で必要になったときに設定する。
> Auth0 Dashboard → Applications → Create Application → Machine to Machine

---

## 8. 環境変数

上記設定後、以下の値をアプリケーションの環境変数に設定する。

### 8.1 本番（VPSサーバー）

すべての変数を `.env.prod` に集約する。

ファイル: `/xxx/sleeptime.dev/.env.prod`

```
# === Database ===
POSTGRES_USER=sleeptime
POSTGRES_PASSWORD=（本番用パスワード）
POSTGRES_DB=sleeptime

# === Redis ===
REDIS_HOST=redis
REDIS_PORT=6379

# === Backend ===
SPRING_PROFILES_ACTIVE=prod
SERVER_PORT=8080

# === Auth0 ===
AUTH0_DOMAIN=dev-ll413keejpz65qwc.us.auth0.com
AUTH0_CLIENT_ID=（Auth0 で取得した Client ID）
AUTH0_CLIENT_SECRET=（Auth0 で取得した Client Secret）
AUTH0_AUDIENCE=https://api.sleeptime.dev
AUTH0_SECRET=（openssl rand -hex 32 で生成）
AUTH0_BASE_URL=https://sleeptime.dev
AUTH0_ISSUER_BASE_URL=https://dev-ll413keejpz65qwc.us.auth0.com

# === Frontend ===
NEXT_PUBLIC_API_URL=https://backend.sleeptime.dev
```

### 8.2 ローカル開発

2つのファイルに分けて設定する。

#### Backend用: `sys/.env`

```
DB_HOST=postgres
DB_PORT=5432
DB_NAME=sleeptime
DB_USERNAME=sleeptime
DB_PASSWORD=sleeptime_dev_password
REDIS_HOST=redis
REDIS_PORT=6379
SPRING_PROFILES_ACTIVE=dev
AUTH0_DOMAIN=dev-ll413keejpz65qwc.us.auth0.com
AUTH0_CLIENT_ID=（Auth0 で取得した Client ID）
AUTH0_CLIENT_SECRET=（Auth0 で取得した Client Secret）
AUTH0_AUDIENCE=https://api.sleeptime.dev
```

#### Frontend用: `sys/frontend/.env.local`

```
AUTH0_DOMAIN=dev-ll413keejpz65qwc.us.auth0.com
AUTH0_CLIENT_ID=（Auth0 で取得した Client ID）
AUTH0_CLIENT_SECRET=（Auth0 で取得した Client Secret）
AUTH0_SECRET=（openssl rand -hex 32 で生成）
AUTH0_BASE_URL=http://localhost:3000
AUTH0_ISSUER_BASE_URL=https://dev-ll413keejpz65qwc.us.auth0.com
AUTH0_AUDIENCE=https://api.sleeptime.dev
```

> ※ `sys/.env` と `sys/frontend/.env.local` は `.gitignore` で除外済み。
> ※ `application.yml` は `${AUTH0_DOMAIN}` 等で `.env` の値を参照する。

---

## 9. 確認チェックリスト

- [ ] テナント作成完了
- [ ] Regular Web Application 作成完了
- [ ] API (Resource Server) 作成完了、Permissions 追加完了
- [ ] Database Connection (Email/Password) 有効
- [ ] Google Social Connection 設定完了
- [ ] GitHub Social Connection 設定完了
- [ ] Post-Login Action 作成・デプロイ完了
- [ ] Roles (SUPER_ADMIN, END_USER) 作成完了
- [ ] 環境変数をメモ済み
