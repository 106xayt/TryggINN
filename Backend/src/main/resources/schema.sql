-- =========================================================
--  TryggINN - PostgreSQL schema.sql
--  Works on empty DB + can be re-run safely (clears data)
--  Matches JPA entities + DTOs
-- =========================================================

SET TIME ZONE 'UTC';

-- ---------------------------------------------------------
--  1) TABLES
-- ---------------------------------------------------------

CREATE TABLE IF NOT EXISTS daycare (
                                       id           BIGSERIAL PRIMARY KEY,
                                       name         VARCHAR(200) NOT NULL,
    org_number   VARCHAR(20)  NOT NULL UNIQUE,
    address      VARCHAR(255),
    created_at   TIMESTAMP    NOT NULL DEFAULT NOW()
    );

CREATE TABLE IF NOT EXISTS users (
                                     id                BIGSERIAL PRIMARY KEY,
                                     full_name         VARCHAR(200) NOT NULL,
    email             VARCHAR(255) NOT NULL UNIQUE,
    phone_number      VARCHAR(50),
    role              VARCHAR(50)  NOT NULL,
    password_hash     VARCHAR(255) NOT NULL,
    external_auth_id  VARCHAR(255),
    auth_provider     VARCHAR(100),
    created_at        TIMESTAMP NOT NULL DEFAULT NOW(),

    CONSTRAINT users_role_check
    CHECK (role IN ('PARENT', 'STAFF', 'ADMIN'))
    );

CREATE TABLE IF NOT EXISTS daycare_group (
                                             id          BIGSERIAL PRIMARY KEY,
                                             daycare_id  BIGINT NOT NULL REFERENCES daycare(id) ON DELETE CASCADE,
    name        VARCHAR(200) NOT NULL,
    description VARCHAR(500),
    created_at  TIMESTAMP NOT NULL DEFAULT NOW(),

    CONSTRAINT daycare_group_unique_name_per_daycare
    UNIQUE (daycare_id, name)
    );

CREATE TABLE IF NOT EXISTS children (
                                        id               BIGSERIAL PRIMARY KEY,
                                        daycare_group_id  BIGINT NOT NULL REFERENCES daycare_group(id) ON DELETE CASCADE,
    first_name       VARCHAR(100) NOT NULL,
    last_name        VARCHAR(100),
    date_of_birth    DATE,
    active           BOOLEAN NOT NULL DEFAULT TRUE,
    allergies        VARCHAR(500),
    medications      VARCHAR(500),
    favorite_food    VARCHAR(255),
    note             VARCHAR(2000),
    created_at       DATE NOT NULL DEFAULT CURRENT_DATE
    );

-- Which guardians (users) are connected to which children
-- NOTE: column names must match @JoinTable in User.java (guardian_id / child_id)
CREATE TABLE IF NOT EXISTS guardians_children (
                                                  guardian_id   BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    child_id      BIGINT NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    relationship  VARCHAR(50) DEFAULT 'GUARDIAN',

    PRIMARY KEY (guardian_id, child_id)
    );

-- Which users are connected to which daycare (for access/permissions)
-- NOTE: column names must match @JoinTable in User.java (guardian_id / daycare_id)
CREATE TABLE IF NOT EXISTS guardians_daycare (
                                                 guardian_id  BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    daycare_id   BIGINT NOT NULL REFERENCES daycare(id) ON DELETE CASCADE,
    access_role  VARCHAR(50) NOT NULL DEFAULT 'PARENT',

    PRIMARY KEY (guardian_id, daycare_id),

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
    created_at         TIMESTAMP NOT NULL DEFAULT NOW(),
    expires_at         TIMESTAMP,

    CONSTRAINT daycare_access_code_max_uses_check CHECK (max_uses > 0),
    CONSTRAINT daycare_access_code_used_count_check CHECK (used_count >= 0 AND used_count <= max_uses)
    );

-- Attendance events (check-in/out etc.)
CREATE TABLE IF NOT EXISTS attendance (
                                          id                   BIGSERIAL PRIMARY KEY,
                                          child_id             BIGINT NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    event_type           VARCHAR(50) NOT NULL,
    event_time           TIMESTAMP NOT NULL DEFAULT NOW(),
    note                 VARCHAR(1000),
    performed_by_user_id BIGINT NOT NULL REFERENCES users(id),
    created_at           TIMESTAMP NOT NULL DEFAULT NOW(),

    CONSTRAINT attendance_event_type_check
    CHECK (event_type IN ('IN', 'OUT', 'ABSENT', 'LATE'))
    );
-- Ensure constraint is correct even if table already existed from older schema
ALTER TABLE attendance
DROP CONSTRAINT IF EXISTS attendance_event_type_check;

ALTER TABLE attendance
    ADD CONSTRAINT attendance_event_type_check
        CHECK (event_type IN ('IN', 'OUT', 'ABSENT', 'LATE'));


-- Absence (separate from attendance in backend)
CREATE TABLE IF NOT EXISTS absence (
                                       id                   BIGSERIAL PRIMARY KEY,
                                       child_id             BIGINT NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    reported_by_user_id  BIGINT NOT NULL REFERENCES users(id),
    date                 DATE NOT NULL,
    reason               VARCHAR(255) NOT NULL,
    note                 VARCHAR(2000),
    created_at           DATE NOT NULL DEFAULT CURRENT_DATE
    );

-- Vacation periods
CREATE TABLE IF NOT EXISTS vacation (
                                        id                   BIGSERIAL PRIMARY KEY,
                                        child_id             BIGINT NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    reported_by_user_id  BIGINT NOT NULL REFERENCES users(id),
    start_date           DATE NOT NULL,
    end_date             DATE NOT NULL,
    note                 VARCHAR(2000),
    created_at           TIMESTAMP NOT NULL DEFAULT NOW(),

    CONSTRAINT vacation_date_check
    CHECK (end_date >= start_date)
    );

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_children_group ON children(daycare_group_id);
CREATE INDEX IF NOT EXISTS idx_attendance_child_time ON attendance(child_id, event_time);
CREATE INDEX IF NOT EXISTS idx_vacation_child_start ON vacation(child_id, start_date);
CREATE INDEX IF NOT EXISTS idx_absence_child_date ON absence(child_id, date);

-- ---------------------------------------------------------
--  2) DEV/TEST RESET (clears data, safe to re-run)
-- ---------------------------------------------------------
TRUNCATE TABLE
    attendance,
    absence,
    vacation,
    guardians_children,
    guardians_daycare,
    daycare_access_code,
    children,
    daycare_group,
    users,
    daycare
RESTART IDENTITY CASCADE;

-- ---------------------------------------------------------
--  3) TEST DATA (matches DTO flows)
-- ---------------------------------------------------------

-- ---------------------------------------------------------
--  3) TEST DATA (matches DTO flows)
-- ---------------------------------------------------------

-- Daycare
INSERT INTO daycare (id, name, org_number, address, created_at)
VALUES
    (1, 'Solstrålen Barnehage', '999888777', 'Solgata 12, Oslo', NOW())
    ON CONFLICT DO NOTHING;

-- Users
-- NOTE: password_hash values are placeholders; replace with BCrypt hashes if you validate passwords in login.
INSERT INTO users (id, full_name, email, phone_number, role, password_hash, external_auth_id, auth_provider, created_at)
VALUES
    (1, 'Anne Hansen',  'anne.hansen@test.no', '90000001', 'PARENT', 'hashed_pw_anne', NULL, NULL, NOW()),
    (2, 'Per Hansen',   'per.hansen@test.no',  '90000002', 'PARENT', 'hashed_pw_per',  NULL, NULL, NOW()),
    (3, 'Kari Olsen',   'kari.olsen@test.no',  '90000003', 'STAFF',  'hashed_pw_kari', NULL, NULL, NOW()),
    (4, 'Admin Bruker', 'admin@test.no',       NULL,       'ADMIN',  'hashed_pw_admin', NULL, NULL, NOW())
    ON CONFLICT DO NOTHING;

-- Daycare groups
INSERT INTO daycare_group (id, daycare_id, name, description, created_at)
VALUES
    (1, 1, 'Marihøna', 'Småbarnsavdeling', NOW()),
    (2, 1, 'Bikuben',  'Storebarnsavdeling', NOW())
    ON CONFLICT DO NOTHING;

-- Children (includes details used by ChildDetailsResponse + note used by ChildNoteResponse)
INSERT INTO children (
    id, daycare_group_id, first_name, last_name, date_of_birth, active,
    allergies, medications, favorite_food, note, created_at
)
VALUES
    (1, 1, 'Ola',  'Hansen', '2020-05-12', TRUE,  'Egg',  NULL, 'Pasta', 'Trenger litt ekstra tid ved levering.', CURRENT_DATE),
    (2, 1, 'Emma', 'Hansen', '2019-09-03', TRUE,  NULL,  NULL, 'Taco',  NULL, CURRENT_DATE),
    (3, 2, 'Noah', 'Olsen',  '2021-01-20', TRUE,  NULL,  'Astma-inhalator ved behov', 'Banan', 'Kan bli urolig ved høye lyder.', CURRENT_DATE)
    ON CONFLICT DO NOTHING;

-- Guardians ↔ Children (matches join columns guardian_id/child_id)
INSERT INTO guardians_children (guardian_id, child_id, relationship)
VALUES
    (1, 1, 'MOTHER'),
    (2, 1, 'FATHER'),
    (1, 2, 'MOTHER'),
    (2, 2, 'FATHER'),
    (1, 3, 'GUARDIAN')
    ON CONFLICT DO NOTHING;

-- Users ↔ Daycare (guardian_id is join column in JPA)
INSERT INTO guardians_daycare (guardian_id, daycare_id, access_role)
VALUES
    (1, 1, 'PARENT'),
    (2, 1, 'PARENT'),
    (3, 1, 'STAFF'),
    (4, 1, 'ADMIN')
    ON CONFLICT DO NOTHING;


