#!/user/bin/env node

import { Client } from 'pg';
import 'dotenv/config';

const main = async() => {
    console.log("Seeding...");
    const client = new Client({
        connectionString: process.env.POSTGRES_URL
    })
    try {
        await client.connect();

        // clean the data
        await client.query('DROP TABLE IF EXISTS users, patients, doctors, treatments, appointments, treatment_history, reminders CASCADE;');

        // users table
        await client.query(`
            CREATE TABLE users (
                id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                first_name VARCHAR(100) NOT NULL,
                last_name VARCHAR(100) NOT NULL,
                email VARCHAR(100) NOT NULL UNIQUE,
                password TEXT NOT NULL,
                role VARCHAR(20) DEFAULT 'receptionist' CHECK (role IN ('receptionist', 'doctor', 'admin'))
            );
            `)

        // patients table
        await client.query(`
            CREATE TABLE patients (
                id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                full_name VARCHAR(100) NOT NULL,
                date_of_birth DATE,
                gender VARCHAR(10),
                phone VARCHAR(10),
                email VARCHAR(100),
                address TEXT,
                allergies TEXT,
                notes TEXT,
                status VARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive', 'Overdue', 'Follow-up')),
                created_at TIMESTAMP DEFAULT NOW()
            );
            
            INSERT INTO patients (full_name, date_of_birth, gender, phone, email, address, allergies, notes, status) VALUES
                ('Somchai Wongkham',   '1985-03-12', 'Male',   '0812345678', 'somchai@email.com',    '12 Sukhumvit Rd, Bangkok',      'None',             'Long-term patient',             'Active'),
                ('Nattaya Panya',      '1990-07-22', 'Female', '0891234567', 'nattaya@email.com',    '45 Silom Rd, Bangkok',          'Penicillin',       'Anxious about procedures',      'Active'),
                ('Kasem Limthong',     '2000-01-05', 'Male',   '0867891234', 'kasem@email.com',      '8 Rama 9 Rd, Bangkok',          'None',             'Ongoing braces treatment',      'Active'),
                ('Pimchanok Aroon',    '1978-11-30', 'Female', '0823456789', 'pimchanok@email.com',  '3 Lat Phrao Rd, Bangkok',       'Ibuprofen',        'Needs extra reassurance',       'Active'),
                ('Anong Thipwan',      '1965-05-14', 'Female', '0834567890', 'anong@email.com',      '77 Phahon Yothin Rd, Bangkok',  'None',             'Diabetic — monitor gum health', 'Overdue'),
                ('Surin Boonmak',      '1988-09-09', 'Male',   '0856789012', 'surin@email.com',      '22 Charoen Nakhon Rd, Bangkok', 'None',             'Completed root canal',          'Follow-up'),
                ('Malee Saetan',       '1972-04-18', 'Female', '0845678901', 'malee@email.com',      '5 Ratchadaphisek Rd, Bangkok',  'Latex',            'Sensitive teeth',               'Overdue'),
                ('Prasert Kongkiat',   '1958-12-01', 'Male',   '0878901234', 'prasert@email.com',    '19 Ngam Wong Wan Rd, Bangkok',  'None',             'Annual check-up due',           'Active'),
                ('Wittaya Ratchanon',  '1995-06-25', 'Male',   '0890123456', 'wittaya@email.com',    '88 On Nut Rd, Bangkok',         'None',             'Interested in whitening',       'Active'),
                ('Ladda Charoenwong',  '2003-08-10', 'Female', '0801234567', 'ladda@email.com',      '14 Thonglor Rd, Bangkok',       'None',             'New patient referral',          'Active');
            `)

        // doctors table
        await client.query(`
            CREATE TABLE doctors (
                id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                full_name VARCHAR(100) NOT NULL,
                gender VARCHAR(10),
                phone VARCHAR(10),
                email VARCHAR(100),
                speciality VARCHAR(100),
                created_at TIMESTAMP DEFAULT NOW()
            );

            INSERT INTO doctors (full_name, speciality, phone, email) VALUES
                ('Dr. Wanchai Arunrat',   'General Dentistry',       '0812000001', 'wanchai@dentacare.th'),
                ('Dr. Siriporn Nakorn',   'Endodontics',             '0812000002', 'siriporn@dentacare.th'),
                ('Dr. Pattarapol Siri',   'Orthodontics',            '0812000003', 'pattarapol@dentacare.th'),
                ('Dr. Kanokwan Thong',    'Periodontics',            '0812000004', 'kanokwan@dentacare.th');
            `)

        // treatments table
        await client.query(`
            CREATE TABLE treatments (
                id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                category VARCHAR(50),
                duration_min INT,
                base_price NUMERIC(10,2)
            );

            INSERT INTO treatments (name, category, duration_min, base_price) VALUES
                ('Check-up & cleaning',     'Preventive',    45,   800.00),
                ('Annual X-ray',            'Diagnostic',    30,   500.00),
                ('Tooth filling',           'Restorative',   60,  1200.00),
                ('Root canal – session',    'Endodontic',    90,  4500.00),
                ('Tooth extraction',        'Surgical',      45,  1500.00),
                ('Braces adjustment',       'Orthodontic',   30,   800.00),
                ('Deep cleaning',           'Periodontic',   60,  2000.00),
                ('Teeth whitening',         'Cosmetic',      90,  3500.00),
                ('Crown fitting',           'Restorative',   90,  8000.00),
                ('Consultation',            'General',       20,   300.00);
            `)

        // appointments table
        await client.query(`
            CREATE TABLE appointments (
                id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                patient_id INT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
                doctor_id INT NOT NULL REFERENCES doctors(id),
                treatment_id INT REFERENCES treatments(id),
                scheduled_at TIMESTAMP NOT NULL,
                duration_min INT,
                status VARCHAR(20) DEFAULT 'Upcoming' CHECK (status IN ('Upcoming', 'In progress', 'Done', 'Cancelled', 'No-show')),
                notes TEXT,
                created_at TIMESTAMP DEFAULT NOW()
            );

            INSERT INTO appointments (patient_id, doctor_id, treatment_id, scheduled_at, duration_min, status, notes) VALUES
                (1,  1, 1,  '2026-04-11 09:00', 45,  'Done',        'Routine visit, no issues found'),
                (2,  2, 4,  '2026-04-11 10:30', 90,  'Done',        'Session 2 of 3 — going well'),
                (3,  3, 6,  '2026-04-11 13:00', 30,  'In progress', 'Monthly braces check'),
                (4,  2, 5,  '2026-04-11 14:30', 45,  'Upcoming',    'Lower right wisdom tooth'),
                (9,  1, 10, '2026-04-11 16:00', 20,  'Upcoming',    'Whitening consultation'),
                (5,  1, 1,  '2026-04-12 09:30', 45,  'Upcoming',    'Overdue 6-month check-up'),
                (6,  2, 10, '2026-04-13 11:00', 20,  'Upcoming',    'Post root canal review'),
                (8,  1, 2,  '2026-04-15 10:00', 30,  'Upcoming',    'Annual X-ray'),
                (1,  1, 1,  '2025-10-15 09:00', 45,  'Done',        'Filling upper left molar'),
                (2,  2, 4,  '2026-03-28 10:00', 90,  'Done',        'Root canal session 1'),
                (5,  4, 7,  '2025-10-01 14:00', 60,  'Done',        'Deep cleaning — gum care'),
                (7,  1, 10, '2026-04-01 09:00', 20,  'No-show',     'Patient did not attend'),
                (10, 1, 10, '2026-04-09 15:00', 20,  'Done',        'New patient intake consultation');
            `)

        // treatment_history
        await client.query(`
            CREATE TABLE treatment_history (
                id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                patient_id INT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
                appointment_id INT REFERENCES appointments(id),
                doctor_id INT REFERENCES doctors(id),
                treatment_id  INT REFERENCES treatments(id),
                performed_at DATE NOT NULL,
                notes TEXT,
                next_step TEXT
            );

            INSERT INTO treatment_history (patient_id, appointment_id, doctor_id, treatment_id, performed_at, notes, next_step) VALUES
                (1, 1,  1, 1, '2026-04-11', 'Teeth clean, no cavities',                    'Return in 6 months'),
                (1, 9,  1, 3, '2025-10-15', 'Composite filling placed on upper left molar', 'Monitor at next visit'),
                (1, NULL,1, 1, '2025-04-10', 'Annual check-up — all clear',                 'Annual X-ray next visit'),
                (2, 10, 2, 4, '2026-03-28', 'Root canal session 1 — pulp removed',         'Book session 2 in 2 weeks'),
                (2, 2,  2, 4, '2026-04-11', 'Root canal session 2 — canals shaped',        'Final session in 2 weeks'),
                (2, NULL,1, 1, '2025-09-02', 'Routine clean, minor tartar',                 'Consider whitening'),
                (3, 3,  3, 6, '2026-04-11', 'Wire tightened, good progress',               'Next adjustment in 4 weeks'),
                (3, NULL,3, 6, '2026-03-14', 'Adjustment — slight gap closing',             NULL),
                (3, NULL,3, 6, '2026-02-12', 'Braces placed — patient briefed',            NULL),
                (4, NULL,1, 10,'2026-03-02', 'Discussed extraction options',                'Schedule extraction April'),
                (4, NULL,1, 1, '2025-08-20', 'Routine clean',                               'Extraction consultation needed'),
                (5, 11, 4, 7, '2025-10-01', 'Deep clean, gum pockets 3–4mm',               '6-month recall overdue'),
                (5, NULL,4, 7, '2025-03-15', 'Initial deep cleaning',                       'Recheck in 6 months'),
                (6, 10, 2, 4, '2026-03-28', 'Root canal completed, temp crown placed',     'Follow-up in 2 weeks'),
                (8, NULL,1, 1, '2025-09-10', 'Check-up, minor staining noted',             'Annual X-ray due April 2026');
            `)
        // reminders table
        await client.query(`
            CREATE TABLE reminders (
                id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                patient_id INT NOT NULL REFERENCES patients(id),
                topic VARCHAR(50),
                due_date DATE NOT NULL,
                status VARCHAR(10) DEFAULT 'Upcoming' CHECK (status IN ('Upcoming', 'Sent', 'Overdue', 'Appointed', 'Cancelled')),
                notes TEXT,
                created_at TIMESTAMP DEFAULT NOW()
            ); 

            INSERT INTO reminders (patient_id, topic, due_date, status, notes) VALUES
                (5, '6-month check-up',          '2026-03-30', 'Overdue',   'Patient has not booked yet — call again'),
                (7, 'Treatment review',          '2026-04-08', 'Overdue',   'Missed last appointment — follow up'),
                (6, 'Post root canal follow-up', '2026-04-13', 'Upcoming',  'Check healing, discuss permanent crown'),
                (8, 'Annual X-ray',              '2026-04-15', 'Upcoming',  'Due for panoramic X-ray'),
                (2, 'Root canal – final session','2026-04-25', 'Upcoming',  'Book third and final session'),
                (4, 'Post extraction check',     '2026-04-18', 'Upcoming',  'Review healing after extraction'),
                (1, '6-month check-up',          '2026-10-09', 'Upcoming',  'Routine recall'),
                (9, 'Whitening follow-up',       '2026-05-01', 'Upcoming',  'Review whitening results'),
                (3, 'Braces adjustment',         '2026-05-09', 'Upcoming',  'Monthly adjustment due'),
                (10,'New patient 3-month check', '2026-07-09', 'Upcoming',  'First follow-up since intake');
            `)
    }catch(err) {
        console.error('Seeding failed', err.message);
    }finally {
        await client.end();
    }
    console.log('Done');
}

main();