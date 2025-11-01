-- ReporTube (rewired) Database Schema
-- Designed: classes with categories, centralized academic_years, subjects + class_subjects bridge,
-- flexible teacher assignments for primary (class-level) and secondary (class-subject-level),
-- scores tied to class_subject offerings.

-- Drop in reverse dependency order for clean setup
DROP TABLE IF EXISTS sessions CASCADE;
DROP TABLE IF EXISTS scores CASCADE;
DROP TABLE IF EXISTS class_subject_teachers CASCADE;
DROP TABLE IF EXISTS class_teachers CASCADE;
DROP TABLE IF EXISTS class_subjects CASCADE;
DROP TABLE IF EXISTS subjects CASCADE;
DROP TABLE IF EXISTS students CASCADE;
DROP TABLE IF EXISTS classes CASCADE;
DROP TABLE IF EXISTS academic_years CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Users table (Admin and Teachers)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin','teacher')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Centralized Academic Years table
CREATE TABLE academic_years (
    id SERIAL PRIMARY KEY,
    year_label VARCHAR(20) UNIQUE NOT NULL, -- e.g. '2025/2026'
    is_current BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Classes table (no level, no academic_year; use category to split streams)
CREATE TABLE classes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL, -- e.g. 'JSS1', 'SS1'
    category VARCHAR(20) NOT NULL CHECK (category IN ('JUNIOR','SCIENCE','ART','COMMERCIAL')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(name, category) -- prevents duplicate exact rows like two identical 'SS1' science rows
);

-- Students table
CREATE TABLE students (
    id SERIAL PRIMARY KEY,
    admission_number VARCHAR(50) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    middle_name VARCHAR(100),
    date_of_birth DATE,
    gender VARCHAR(10) CHECK (gender IN ('Male','Female')),
    class_id INTEGER REFERENCES classes(id) ON DELETE SET NULL,
    parent_name VARCHAR(255),
    parent_email VARCHAR(255),
    parent_phone VARCHAR(20),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Master Subjects table (no code)
CREATE TABLE subjects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (LOWER(name)) -- avoid exact-name duplicates (case-insensitive)
);

-- Bridge table: a subject offered for a specific class (unique per class + subject)
CREATE TABLE class_subjects (
    id SERIAL PRIMARY KEY,
    class_id INTEGER REFERENCES classes(id) ON DELETE CASCADE,
    subject_id INTEGER REFERENCES subjects(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (class_id, subject_id)
);

-- Class-level teacher assignment (useful for primary where teacher covers whole class)
CREATE TABLE class_teachers (
    id SERIAL PRIMARY KEY,
    teacher_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    class_id INTEGER REFERENCES classes(id) ON DELETE CASCADE,
    academic_year_id INTEGER REFERENCES academic_years(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (teacher_id, class_id, academic_year_id)
);

-- Class-subject teacher assignment (secondary: teacher -> specific class_subject for an academic year)
CREATE TABLE class_subject_teachers (
    id SERIAL PRIMARY KEY,
    teacher_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    class_subject_id INTEGER REFERENCES class_subjects(id) ON DELETE CASCADE,
    academic_year_id INTEGER REFERENCES academic_years(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (teacher_id, class_subject_id, academic_year_id)
);

-- Scores table: tie each score to the exact class_subject offering and academic year
CREATE TABLE scores (
    id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
    class_subject_id INTEGER REFERENCES class_subjects(id) ON DELETE CASCADE,
    -- For convenience we also keep class_id (denormalized) to simplify some queries;
    -- it is redundant with class_subjects.class_id but handy for indexing and simpler joins.
    class_id INTEGER REFERENCES classes(id) ON DELETE CASCADE,
    teacher_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    academic_year_id INTEGER REFERENCES academic_years(id) ON DELETE CASCADE,
    term VARCHAR(20) NOT NULL, -- e.g. 'First', 'Second', 'Third'
    ca_score NUMERIC(5,2) DEFAULT 0 CHECK (ca_score >= 0 AND ca_score <= 40),
    exam_score NUMERIC(5,2) DEFAULT 0 CHECK (exam_score >= 0 AND exam_score <= 60),
    total_score NUMERIC(6,2) GENERATED ALWAYS AS (ca_score + exam_score) STORED,
    grade VARCHAR(3),
    remark TEXT,
    is_approved BOOLEAN DEFAULT FALSE,
    approved_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    approved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    -- ensure single score per student per class_subject per academic_year per term
    UNIQUE (student_id, class_subject_id, academic_year_id, term)
);

-- Sessions table for express-session
CREATE TABLE sessions (
    sid VARCHAR NOT NULL COLLATE "default",
    sess JSON NOT NULL,
    expire TIMESTAMP(6) NOT NULL,
    PRIMARY KEY (sid)
);

CREATE INDEX IDX_session_expire ON sessions (expire);

-- INDEXES to improve performance
CREATE INDEX idx_students_class ON students(class_id);
CREATE INDEX idx_students_admission ON students(admission_number);
CREATE INDEX idx_scores_student ON scores(student_id);
CREATE INDEX idx_scores_class_subject ON scores(class_subject_id);
CREATE INDEX idx_scores_class ON scores(class_id);
CREATE INDEX idx_scores_term_year ON scores(academic_year_id, term);
CREATE INDEX idx_class_teachers_teacher ON class_teachers(teacher_id);
CREATE INDEX idx_class_teachers_class ON class_teachers(class_id);
CREATE INDEX idx_class_subject_teachers_teacher ON class_subject_teachers(teacher_id);
CREATE INDEX idx_class_subjects_class ON class_subjects(class_id);
CREATE INDEX idx_subjects_name ON subjects(name);

-- Timestamp trigger helper
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_academic_years_updated_at BEFORE UPDATE ON academic_years
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_classes_updated_at BEFORE UPDATE ON classes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON students
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subjects_updated_at BEFORE UPDATE ON subjects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_class_subjects_updated_at BEFORE UPDATE ON class_subjects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_scores_updated_at BEFORE UPDATE ON scores
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grade calculation function (customize scale if you want different cutoffs)
CREATE OR REPLACE FUNCTION calculate_grade(score NUMERIC)
RETURNS VARCHAR AS $$
BEGIN
    IF score >= 90 THEN
        RETURN 'A+';
    ELSIF score >= 80 THEN
        RETURN 'A';
    ELSIF score >= 70 THEN
        RETURN 'B';
    ELSIF score >= 60 THEN
        RETURN 'C';
    ELSIF score >= 50 THEN
        RETURN 'D';
    ELSIF score >= 40 THEN
        RETURN 'E';
    ELSE
        RETURN 'F';
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-calculate grade when scores are inserted or updated
CREATE OR REPLACE FUNCTION auto_calculate_grade()
RETURNS TRIGGER AS $$
BEGIN
    -- total_score is GENERATED ALWAYS AS (ca_score + exam_score) so compute from ca + exam
    NEW.grade = calculate_grade(NEW.ca_score + NEW.exam_score);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calculate_grade_trigger
BEFORE INSERT OR UPDATE OF ca_score, exam_score ON scores
FOR EACH ROW EXECUTE FUNCTION auto_calculate_grade();

-- Convenience: function to set a single academic year as current (ensures only one current)
CREATE OR REPLACE FUNCTION set_current_academic_year(target_id INT)
RETURNS VOID AS $$
BEGIN
    UPDATE academic_years SET is_current = FALSE WHERE is_current = TRUE;
    UPDATE academic_years SET is_current = TRUE WHERE id = target_id;
END;
$$ LANGUAGE plpgsql;

-- End of schema
