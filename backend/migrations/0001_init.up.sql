-- Sumly initial schema.
--
-- The backend runs GORM AutoMigrate on boot, so applying these files manually
-- is optional. They are provided as the canonical, reviewable schema and for
-- teams that prefer to manage migrations explicitly (e.g. with golang-migrate).

CREATE TABLE IF NOT EXISTS users (
    id            BIGSERIAL PRIMARY KEY,
    name          VARCHAR(120)  NOT NULL,
    email         VARCHAR(255)  NOT NULL,
    password_hash VARCHAR(255)  NOT NULL,
    created_at    TIMESTAMPTZ   NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ   NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users (email);

CREATE TABLE IF NOT EXISTS categories (
    id         BIGSERIAL PRIMARY KEY,
    user_id    BIGINT       NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    name       VARCHAR(120) NOT NULL,
    type       VARCHAR(10)  NOT NULL,
    created_at TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ  NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_categories_user_id ON categories (user_id);

CREATE TABLE IF NOT EXISTS payment_methods (
    id         BIGSERIAL PRIMARY KEY,
    user_id    BIGINT       NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    name       VARCHAR(120) NOT NULL,
    is_card    BOOLEAN      NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ  NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_payment_methods_user_id ON payment_methods (user_id);

CREATE TABLE IF NOT EXISTS transactions (
    id                BIGSERIAL PRIMARY KEY,
    user_id           BIGINT         NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    type              VARCHAR(10)    NOT NULL,
    amount            NUMERIC(14, 2) NOT NULL,
    currency          VARCHAR(3)     NOT NULL DEFAULT 'UZS',
    amount_base       NUMERIC(16, 2) NOT NULL DEFAULT 0,
    category_id       BIGINT         NOT NULL REFERENCES categories (id),
    payment_method_id BIGINT         NOT NULL REFERENCES payment_methods (id),
    description       VARCHAR(500),
    card_last4        VARCHAR(4),
    transaction_date  DATE           NOT NULL,
    created_at        TIMESTAMPTZ    NOT NULL DEFAULT now(),
    updated_at        TIMESTAMPTZ    NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions (user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions (type);
CREATE INDEX IF NOT EXISTS idx_transactions_category_id ON transactions (category_id);
CREATE INDEX IF NOT EXISTS idx_transactions_payment_method_id ON transactions (payment_method_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions (transaction_date);
-- Composite index supporting the common "my transactions, newest first" query.
CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON transactions (user_id, transaction_date DESC);
