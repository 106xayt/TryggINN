-- =========================================================
--  TryggINN - PostgreSQL schema.sql
--  Works on empty DB + can be re-run safely (clears data)
-- =========================================================

-- Optional: make timestamps sane
SET TIME ZONE 'UTC';

-- ---------------------------------------------------------
--  1) TABLES
-- ---------------------------------------------------------

CREATE TABLE IF NOT EXISTS daycare (
    id           BIGSERIAL PRIMARY KEY,
    name         VARCHAR(200) NOT NULL,
    org_number   VARCHAR(20)  NOT NULL UNIQUE,
    address      VARCHAR(255) NOT NULL,
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS users (
    id             BIGSERIAL PRIMARY KEY,
    full_name      VARCHAR(200) NOT NULL,
    email          VARCHAR(255) NOT NULL UNIQUE,
    phone_number   VARCHAR(50),
    role           VARCHAR(50)  NOT NULL,
    password_hash  VARCHAR(255) NOT NULL,
    created_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

    CONSTRAINT users_role_check
        CHECK (role IN ('PARENT', 'STAFF', 'ADMIN'))
);

CREATE TABLE IF NOT EXISTS daycare_group (
    id          BIGSERIAL PRIMARY KEY,
    daycare_id  BIGINT NOT NULL REFERENCES daycare(id) ON DELETE CASCADE,
    name        VARCHAR(200) NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT daycare_group_unique_name_per_daycare
        UNIQUE (daycare_id, name)
);

CREATE TABLE IF NOT EXISTS children (
    id               BIGSERIAL PRIMARY KEY,
    daycare_group_id  BIGINT NOT NULL REFERENCES daycare_group(id) ON DELETE CASCADE,
    first_name       VARCHAR(100) NOT NULL,
    last_name        VARCHAR(100) NOT NULL,
    birth_date       DATE,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Which guardians (users) are connected to which children
CREATE TABLE IF NOT EXISTS guardians_children (
    guardian_user_id  BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    child_id          BIGINT NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    relationship      VARCHAR(50) DEFAULT 'GUARDIAN',

    PRIMARY KEY (guardian_user_id, child_id)
);

-- Which users are connected to which daycare (for access/permissions)
CREATE TABLE IF NOT EXISTS guardians_daycare (
    user_id     BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    daycare_id  BIGINT NOT NULL REFERENCES daycare(id) ON DELETE CASCADE,
    access_role VARCHAR(50) NOT NULL DEFAULT 'PARENT',

    PRIMARY KEY (user_id, daycare_id),

    CONSTRAINT guardians_daycare_access_role_check
        CHECK (access_role IN ('PARENT', 'STAFF', 'ADMIN'))
);

-- Access codes for joining a daycare
CREATE TABLE IF NOT EXISTS daycare_access_code (
    id                 BIGSERIAL PRIMARY KEY,
    daycare_id          BIGINT NOT NULL REFERENCES daycare(id) ON DELETE CASCADE,
    code               VARCHAR(64) NOT NULL UNIQUE,
    max_uses           INT NOT NULL,
    used_count         INT NOT NULL DEFAULT 0,
    created_by_user_id BIGINT NOT NULL REFERENCES users(id),
    is_active          BOOLEAN NOT NULL DEFAULT TRUE,
    created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT daycare_access_code_max_uses_check CHECK (max_uses > 0),
    CONSTRAINT daycare_access_code_used_count_check CHECK (used_count >= 0 AND used_count <= max_uses)
    );


-- Attendance events (check-in/out etc.)
CREATE TABLE IF NOT EXISTS attendance (
    id          BIGSERIAL PRIMARY KEY,
    child_id    BIGINT NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    event_type  VARCHAR(50) NOT NULL,
    event_time  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT attendance_event_type_check
        CHECK (event_type IN ('CHECK_IN', 'CHECK_OUT', 'ABSENT', 'LATE'))
);

-- Vacation periods
CREATE TABLE IF NOT EXISTS vacation (
    id          BIGSERIAL PRIMARY KEY,
    child_id    BIGINT NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    start_date  DATE NOT NULL,
    end_date    DATE NOT NULL,
    note        VARCHAR(500),

    CONSTRAINT vacation_date_check
        CHECK (end_date >= start_date)
);

-- Helpful indexes (not required but nice)
CREATE INDEX IF NOT EXISTS idx_children_group ON children(daycare_group_id);
CREATE INDEX IF NOT EXISTS idx_attendance_child_time ON attendance(child_id, event_time);
CREATE INDEX IF NOT EXISTS idx_vacation_child_start ON vacation(child_id, start_date);



