CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE users (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth0_sub     VARCHAR(255) NOT NULL UNIQUE,
    email         VARCHAR(255) NOT NULL,
    display_name  VARCHAR(255),
    avatar_url    TEXT,
    role          VARCHAR(50)  NOT NULL DEFAULT 'END_USER',
    locale        VARCHAR(10)  DEFAULT 'ja',
    created_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_auth0_sub ON users(auth0_sub);
CREATE INDEX idx_users_email ON users(email);

CREATE TABLE subsystems (
    id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug       VARCHAR(100) NOT NULL UNIQUE,
    name       VARCHAR(255) NOT NULL,
    base_url   VARCHAR(500) NOT NULL,
    client_id  VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE user_subsystems (
    id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subsystem_id UUID NOT NULL REFERENCES subsystems(id) ON DELETE CASCADE,
    role         VARCHAR(50) NOT NULL DEFAULT 'USER',
    enabled      BOOLEAN NOT NULL DEFAULT TRUE,
    granted_at   TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    UNIQUE(user_id, subsystem_id)
);

CREATE INDEX idx_user_subsystems_user_id ON user_subsystems(user_id);
CREATE INDEX idx_user_subsystems_subsystem_id ON user_subsystems(subsystem_id);
