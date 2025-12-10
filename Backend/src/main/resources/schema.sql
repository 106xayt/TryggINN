-- ==============================
-- TESTDATA FOR UTVIKLING
-- ==============================
-- ==============================
-- DEV: TØM TABELLER FØR TESTDATA
-- ==============================
TRUNCATE
    attendance,
    vacation,
    guardians_children,
    guardians_daycare,
    daycare_access_code,
    children,
    daycare_group,
    daycare,
    users
    RESTART IDENTITY CASCADE;

-- BARNEHAGE
INSERT INTO daycare (name, org_number, address)
VALUES ('Eventyrhagen Barnehage', '999888777', 'Eventyrveien 12');

-- Etter denne er daycare.id = 1

-- ANSATTE
INSERT INTO users (full_name, email, phone_number, role, password_hash)
VALUES
    ('Anna Ansatt', 'anna@eventyr.no', '12345678', 'STAFF', 'hemmelig'),
    ('Per Personal', 'per@eventyr.no', '98765432', 'STAFF', 'hemmelig');

-- Etter dette:
--  Anna -> id = 1
--  Per  -> id = 2

-- FORESATTE
INSERT INTO users (full_name, email, phone_number, role, password_hash)
VALUES
    ('Per Foresatt', 'per@forelder.no', '99999999', 'PARENT', 'hemmelig'),
    ('Line Mamma', 'line@forelder.no', '88888888', 'PARENT', 'hemmelig');

-- Etter dette:
--  Per  -> id = 3
--  Line -> id = 4

-- AVDELINGER
INSERT INTO daycare_group (daycare_id, name, description)
VALUES
    (1, 'Lillebjørn', 'Småbarnsavdeling'),
    (1, 'Månebarna', 'Storebarnsavdeling');

-- Etter dette:
--  Lillebjørn -> id = 1
--  Månebarna  -> id = 2

-- BARN
INSERT INTO children (first_name, last_name, date_of_birth, daycare_group_id)
VALUES
    ('Oliver', 'Nordmann', '2019-04-15', 1),
    ('Emma',   'Nordmann', '2018-11-02', 2);

-- Etter dette:
--  Oliver -> id = 1
--  Emma   -> id = 2

-- KNYTT FORELDRE TIL BARN
INSERT INTO guardians_children (guardian_id, child_id)
VALUES
    (3, 1), -- Per -> Oliver
    (4, 1), -- Line -> Oliver
    (3, 2), -- Per -> Emma
    (4, 2); -- Line -> Emma

-- KNYTT FORESATTE TIL BARNEHAGE
INSERT INTO guardians_daycare (guardian_id, daycare_id)
VALUES
    (3, 1), -- Per -> Eventyrhagen
    (4, 1); -- Line -> Eventyrhagen

-- TILGANGSKODE (kan brukes på forsiden)
INSERT INTO daycare_access_code (
    code,
    daycare_id,
    created_by_user_id,
    max_uses,
    used_count,
    is_active
) VALUES (
             'RQD2VC',  -- koden du skriver inn i frontend
             1,         -- Eventyrhagen
             1,         -- laget av Anna (id 1)
             10,
             0,
             TRUE
         );

-- NOEN EKSEMPEL INN/UT-REGISTRERINGER
INSERT INTO attendance (
    child_id,
    event_type,
    event_time,
    note,
    performed_by_user_id
) VALUES
      (1, 'IN',  NOW() - INTERVAL '2 hours', 'Morgensjekk', 1),  -- Oliver inn
      (2, 'IN',  NOW() - INTERVAL '1 hour',  'Kom litt senere', 2); -- Emma inn
