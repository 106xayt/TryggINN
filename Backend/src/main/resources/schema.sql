CREATE TABLE IF NOT EXISTS daycare (
                                       id              BIGSERIAL PRIMARY KEY,
                                       name            VARCHAR(255) NOT NULL,
    org_number      VARCHAR(50),
    address         VARCHAR(255),
    created_at      TIMESTAMP NOT NULL DEFAULT NOW()
    );

CREATE TABLE IF NOT EXISTS users (
                                     id               BIGSERIAL PRIMARY KEY,
                                     full_name        VARCHAR(255) NOT NULL,
    email            VARCHAR(255) UNIQUE,
    phone_number     VARCHAR(50),

    role             VARCHAR(20) NOT NULL,
    CONSTRAINT chk_users_role CHECK (role IN ('PARENT', 'STAFF', 'ADMIN')),

    password_hash    VARCHAR(255),

    -- For senere BankID-integrasjon
    external_auth_id VARCHAR(255),
    auth_provider    VARCHAR(50),

    created_at       TIMESTAMP NOT NULL DEFAULT NOW()
    );

CREATE TABLE IF NOT EXISTS daycare_group (
                                             id              BIGSERIAL PRIMARY KEY,
                                             daycare_id      BIGINT NOT NULL REFERENCES daycare(id) ON DELETE CASCADE,
    name            VARCHAR(255) NOT NULL,
    description     VARCHAR(255),
    created_at      TIMESTAMP NOT NULL DEFAULT NOW()
    );

CREATE TABLE IF NOT EXISTS children (
                                        id               BIGSERIAL PRIMARY KEY,
                                        first_name       VARCHAR(100) NOT NULL,
    last_name        VARCHAR(100),
    date_of_birth    DATE,
    daycare_group_id BIGINT REFERENCES daycare_group(id),
    active           BOOLEAN NOT NULL DEFAULT TRUE,
    created_at       TIMESTAMP NOT NULL DEFAULT NOW()
    );

CREATE TABLE IF NOT EXISTS guardians_children (
                                                  guardian_id      BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    child_id         BIGINT NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    PRIMARY KEY (guardian_id, child_id)
    );

CREATE TABLE IF NOT EXISTS guardians_daycare (
                                                 guardian_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    daycare_id  BIGINT NOT NULL REFERENCES daycare(id) ON DELETE CASCADE,
    PRIMARY KEY (guardian_id, daycare_id)
    );

CREATE TABLE IF NOT EXISTS daycare_access_code (
                                                   id                  BIGSERIAL PRIMARY KEY,
                                                   code                VARCHAR(32) NOT NULL UNIQUE,
    daycare_id          BIGINT NOT NULL REFERENCES daycare(id) ON DELETE CASCADE,
    created_by_user_id  BIGINT NOT NULL REFERENCES users(id),

    max_uses            INT NOT NULL DEFAULT 100,   --mange foreldre kan bruke samme kode
    used_count          INT NOT NULL DEFAULT 0,

    is_active           BOOLEAN NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMP NOT NULL DEFAULT NOW(),
    expires_at          TIMESTAMP
    );

CREATE TABLE IF NOT EXISTS attendance (
                                          id                  BIGSERIAL PRIMARY KEY,
                                          child_id            BIGINT NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    marked_by_user_id   BIGINT NOT NULL REFERENCES users(id),
    event_type          VARCHAR(10) NOT NULL,
    CONSTRAINT chk_attendance_event_type CHECK (event_type IN ('IN', 'OUT')),

    event_time          TIMESTAMP NOT NULL DEFAULT NOW(),
    note                VARCHAR(255),
    event_reason        VARCHAR(100)
    );

CREATE INDEX IF NOT EXISTS idx_children_group
    ON children (daycare_group_id);

CREATE INDEX IF NOT EXISTS idx_attendance_child_time
    ON attendance (child_id, event_time DESC);

CREATE INDEX IF NOT EXISTS idx_guardians_children_guardian
    ON guardians_children (guardian_id);

CREATE INDEX IF NOT EXISTS idx_guardians_daycare_guardian
    ON guardians_daycare (guardian_id);

CREATE INDEX IF NOT EXISTS idx_daycare_access_code_code
    ON daycare_access_code (code);
