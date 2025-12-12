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
    id          BIGSERIAL PRIMARY KEY,
    daycare_id  BIGINT NOT NULL REFERENCES daycare(id) ON DELETE CASCADE,
    code        VARCHAR(64) NOT NULL UNIQUE,
    is_active   BOOLEAN NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
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



-- ---------------------------------------------------------
--  3) TESTDATA (OPTIONAL)
--     Remove this block if you don't want seed data.
-- ---------------------------------------------------------

-- Daycare
INSERT INTO daycare (name, org_number, address)
VALUES ('Eventyrhagen Barnehage', '999888777', 'Eventyrveien 12');

-- Users (password_hash are placeholders - replace with real hashes)
INSERT INTO users (full_name, email, phone_number, role, password_hash)
VALUES
('Admin Bruker', 'admin@trygginn.no', '90000000', 'ADMIN', '$2a$10$dummyhashadmin'),
('Ansatt Bruker', 'staff@trygginn.no', '91111111', 'STAFF', '$2a$10$dummyhashstaff'),
('Foresatt Bruker', 'parent@trygginn.no', '92222222', 'PARENT', '$2a$10$dummyhashparent');

-- Connect users to daycare
INSERT INTO guardians_daycare (user_id, daycare_id, access_role)
SELECT u.id, d.id,
       CASE u.role
           WHEN 'ADMIN' THEN 'ADMIN'
           WHEN 'STAFF' THEN 'STAFF'
           ELSE 'PARENT'
       END
FROM users u
CROSS JOIN daycare d;

-- Group
INSERT INTO daycare_group (daycare_id, name)
SELECT d.id, 'Maurene'
FROM daycare d;

-- Children
INSERT INTO children (daycare_group_id, first_name, last_name, birth_date)
SELECT g.id, 'Ola', 'Nordmann', DATE '2021-05-10'
FROM daycare_group g
WHERE g.name = 'Maurene';

INSERT INTO children (daycare_group_id, first_name, last_name, birth_date)
SELECT g.id, 'Kari', 'Nordmann', DATE '2020-11-22'
FROM daycare_group g
WHERE g.name = 'Maurene';

-- Link parent to both children
INSERT INTO guardians_children (guardian_user_id, child_id, relationship)
SELECT p.id, c.id, 'PARENT'
FROM users p
JOIN children c ON TRUE
WHERE p.email = 'parent@trygginn.no';

-- Access code
INSERT INTO daycare_access_code (daycare_id, code, is_active)
SELECT d.id, 'JOIN-TRYGGINN-1234', TRUE
FROM daycare d;

-- Attendance examples
INSERT INTO attendance (child_id, event_type, event_time)
SELECT c.id, 'CHECK_IN', NOW() - INTERVAL '2 hours'
FROM children c
WHERE c.first_name = 'Ola';

INSERT INTO attendance (child_id, event_type, event_time)
SELECT c.id, 'CHECK_OUT', NOW() - INTERVAL '30 minutes'
FROM children c
WHERE c.first_name = 'Ola';

-- Vacation example
INSERT INTO vacation (child_id, start_date, end_date, note)
SELECT c.id, DATE '2025-12-20', DATE '2026-01-02', 'Juleferie'
FROM children c
WHERE c.first_name = 'Kari';
