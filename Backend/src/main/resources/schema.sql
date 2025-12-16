
SET TIME ZONE 'UTC';

--  1) TABLES

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

CREATE TABLE IF NOT EXISTS guardians_children (
                                                  guardian_id   BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    child_id      BIGINT NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    relationship  VARCHAR(50) DEFAULT 'GUARDIAN',
    PRIMARY KEY (guardian_id, child_id)
    );

CREATE TABLE IF NOT EXISTS guardians_daycare (
                                                 guardian_id  BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    daycare_id   BIGINT NOT NULL REFERENCES daycare(id) ON DELETE CASCADE,
    access_role  VARCHAR(50) NOT NULL DEFAULT 'PARENT',
    PRIMARY KEY (guardian_id, daycare_id),

    CONSTRAINT guardians_daycare_access_role_check
    CHECK (access_role IN ('PARENT', 'STAFF', 'ADMIN'))
    );

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

ALTER TABLE attendance
DROP CONSTRAINT IF EXISTS attendance_event_type_check;

ALTER TABLE attendance
    ADD CONSTRAINT attendance_event_type_check
        CHECK (event_type IN ('IN', 'OUT', 'ABSENT', 'LATE'));

CREATE TABLE IF NOT EXISTS absence (
                                       id                   BIGSERIAL PRIMARY KEY,
                                       child_id             BIGINT NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    reported_by_user_id  BIGINT NOT NULL REFERENCES users(id),
    date                 DATE NOT NULL,
    reason               VARCHAR(255) NOT NULL,
    note                 VARCHAR(2000),
    created_at           DATE NOT NULL DEFAULT CURRENT_DATE
    );

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

CREATE TABLE IF NOT EXISTS calendar_event (
                                              id                 BIGSERIAL PRIMARY KEY,
                                              daycare_id          BIGINT NOT NULL REFERENCES daycare(id) ON DELETE CASCADE,
    daycare_group_id    BIGINT REFERENCES daycare_group(id) ON DELETE SET NULL,
    title               VARCHAR(255) NOT NULL,
    description         VARCHAR(4000),
    location            VARCHAR(255),
    start_time          TIMESTAMP NOT NULL,
    end_time            TIMESTAMP,
    created_by_user_id  BIGINT NOT NULL REFERENCES users(id),
    created_at          TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP NOT NULL DEFAULT NOW(),

    CONSTRAINT calendar_event_time_check
    CHECK (end_time IS NULL OR end_time >= start_time)
    );

-- Indexes
CREATE INDEX IF NOT EXISTS idx_children_group ON children(daycare_group_id);
CREATE INDEX IF NOT EXISTS idx_attendance_child_time ON attendance(child_id, event_time);
CREATE INDEX IF NOT EXISTS idx_vacation_child_start ON vacation(child_id, start_date);
CREATE INDEX IF NOT EXISTS idx_absence_child_date ON absence(child_id, date);
CREATE INDEX IF NOT EXISTS idx_calendar_event_daycare_time ON calendar_event(daycare_id, start_time);
CREATE INDEX IF NOT EXISTS idx_calendar_event_group_time ON calendar_event(daycare_group_id, start_time);

--  2) RESET

TRUNCATE TABLE
    attendance,
  absence,
  vacation,
  calendar_event,
  guardians_children,
  guardians_daycare,
  daycare_access_code,
  children,
  daycare_group,
  users,
  daycare
RESTART IDENTITY CASCADE;

--  3) TEST DATA

INSERT INTO daycare (id, name, org_number, address, created_at)
VALUES (1, 'Solstrålen Barnehage', '999888777', 'Solgata 12, Oslo', NOW())
    ON CONFLICT DO NOTHING;

INSERT INTO users (id, full_name, email, phone_number, role, password_hash, external_auth_id, auth_provider, created_at)
VALUES
    (1, 'Anne Hansen',  'anne.hansen@test.no', '90000001', 'PARENT', 'hashed_pw_anne', NULL, NULL, NOW()),
    (2, 'Per Hansen',   'per.hansen@test.no',  '90000002', 'PARENT', 'hashed_pw_per',  NULL, NULL, NOW()),
    (3, 'Kari Olsen',   'kari.olsen@test.no',  '90000003', 'STAFF',  'hashed_pw_kari', NULL, NULL, NOW()),
    (4, 'Admin Bruker', 'admin@test.no',       NULL,       'ADMIN',  'hashed_pw_admin', NULL, NULL, NOW())
    ON CONFLICT DO NOTHING;

INSERT INTO daycare_group (id, daycare_id, name, description, created_at)
VALUES
    (1, 1, 'Marihøna', 'Småbarnsavdeling', NOW()),
    (2, 1, 'Bikuben',  'Storebarnsavdeling', NOW())
    ON CONFLICT DO NOTHING;

INSERT INTO children (
    id, daycare_group_id, first_name, last_name, date_of_birth, active,
    allergies, medications, favorite_food, note, created_at
)
VALUES
    (1, 1, 'Ola',  'Hansen', '2020-05-12', TRUE,  'Egg',  NULL, 'Pasta', 'Trenger litt ekstra tid ved levering.', CURRENT_DATE),
    (2, 1, 'Emma', 'Hansen', '2019-09-03', TRUE,  NULL,  NULL, 'Taco',  NULL, CURRENT_DATE),
    (3, 2, 'Noah', 'Olsen',  '2021-01-20', TRUE,  NULL,  'Astma-inhalator ved behov', 'Banan', 'Kan bli urolig ved høye lyder.', CURRENT_DATE)
    ON CONFLICT DO NOTHING;

INSERT INTO guardians_children (guardian_id, child_id, relationship)
VALUES
    (1, 1, 'MOTHER'),
    (2, 1, 'FATHER'),
    (1, 2, 'MOTHER'),
    (2, 2, 'FATHER'),
    (1, 3, 'GUARDIAN')
    ON CONFLICT DO NOTHING;

INSERT INTO guardians_daycare (guardian_id, daycare_id, access_role)
VALUES
    (1, 1, 'PARENT'),
    (2, 1, 'PARENT')
    ON CONFLICT DO NOTHING;

--  4) FIX SEQUENCES

SELECT setval(pg_get_serial_sequence('daycare', 'id'), (SELECT COALESCE(MAX(id), 1) FROM daycare));
SELECT setval(pg_get_serial_sequence('users', 'id'), (SELECT COALESCE(MAX(id), 1) FROM users));
SELECT setval(pg_get_serial_sequence('daycare_group', 'id'), (SELECT COALESCE(MAX(id), 1) FROM daycare_group));
SELECT setval(pg_get_serial_sequence('children', 'id'), (SELECT COALESCE(MAX(id), 1) FROM children));
SELECT setval(pg_get_serial_sequence('daycare_access_code', 'id'), (SELECT COALESCE(MAX(id), 1) FROM daycare_access_code));
SELECT setval(pg_get_serial_sequence('attendance', 'id'), (SELECT COALESCE(MAX(id), 1) FROM attendance));
SELECT setval(pg_get_serial_sequence('absence', 'id'), (SELECT COALESCE(MAX(id), 1) FROM absence));
SELECT setval(pg_get_serial_sequence('vacation', 'id'), (SELECT COALESCE(MAX(id), 1) FROM vacation));
SELECT setval(pg_get_serial_sequence('calendar_event', 'id'), (SELECT COALESCE(MAX(id), 1) FROM calendar_event));

