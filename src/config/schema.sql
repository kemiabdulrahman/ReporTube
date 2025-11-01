-- ==========================================
-- ReporTube Database Schema (Final Version)
-- ==========================================
-- Transparent: Teachers record and approve their own scores
-- Scalable: Supports both primary (class-level) and secondary (subject-level) teaching
-- Secure: Approved scores cannot be edited

-- ==========================================
-- DROP TABLES (reverse order)
-- ==========================================
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

-- ==========================================
-- USERS (Admin and Teachers)
-- ==========================================
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin','teacher')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- ACADEMIC YEARS
-- ==========================================
CREATE TABLE academic_years (
    id SERIAL PRIMARY KEY,
    year_label VARCHAR(20) UNIQUE NOT NULL,  -- e.g. '2025/2026'
    is_current BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- CLASSES
-- ==========================================
CREATE TABLE classes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL, -- e.g. 'JSS1', 'SS2'
    category VARCHAR(20) NOT NULL CHECK (category IN ('JUNIOR','SCIENCE','ART','COMMERCIAL')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(name, category)
);

-- ==========================================
-- STUDENTS
-- ==========================================
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
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- SUBJECTS
-- ==========================================
CREATE TABLE subjects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (LOWER(name))
);

-- ==========================================
-- CLASS SUBJECTS (Bridge: Class ↔ Subject)
-- ==========================================
CREATE TABLE class_subjects (
    id SERIAL PRIMARY KEY,
    class_id INTEGER REFERENCES classes(id) ON DELETE CASCADE,
    subject_id INTEGER REFERENCES subjects(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (class_id, subject_id)
);

-- ==========================================
-- CLASS TEACHERS (Primary: Whole-class assignment)
-- ==========================================
CREATE TABLE class_teachers (
    id SERIAL PRIMARY KEY,
    teacher_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    class_id INTEGER REFERENCES classes(id) ON DELETE CASCADE,
    academic_year_id INTEGER REFERENCES academic_years(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (teacher_id, class_id, academic_year_id)
);

-- ==========================================
-- CLASS-SUBJECT TEACHERS (Secondary: Per subject)
-- ==========================================
CREATE TABLE class_subject_teachers (
    id SERIAL PRIMARY KEY,
    teacher_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    class_subject_id INTEGER REFERENCES class_subjects(id) ON DELETE CASCADE,
    academic_year_id INTEGER REFERENCES academic_years(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (teacher_id, class_subject_id, academic_year_id)
);

-- ==========================================
-- SCORES (Teacher enters and approves their own scores)
-- ==========================================
CREATE TABLE scores (
    id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
    class_subject_id INTEGER REFERENCES class_subjects(id) ON DELETE CASCADE,
    class_id INTEGER REFERENCES classes(id) ON DELETE CASCADE,
    teacher_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    academic_year_id INTEGER REFERENCES academic_years(id) ON DELETE CASCADE,
    term VARCHAR(20) NOT NULL, -- 'First', 'Second', 'Third'

    ca_score NUMERIC(5,2) DEFAULT 0 CHECK (ca_score >= 0 AND ca_score <= 40),
    exam_score NUMERIC(5,2) DEFAULT 0 CHECK (exam_score >= 0 AND exam_score <= 60),
    total_score NUMERIC(6,2) GENERATED ALWAYS AS (ca_score + exam_score) STORED,
    grade VARCHAR(3),
    remark TEXT,

    is_approved BOOLEAN DEFAULT FALSE,
    approved_at TIMESTAMP,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE (student_id, class_subject_id, academic_year_id, term)
);

-- ==========================================
-- SESSIONS (Express-session store)
-- ==========================================
CREATE TABLE sessions (
    sid VARCHAR NOT NULL COLLATE "default",
    sess JSON NOT NULL,
    expire TIMESTAMP(6) NOT NULL,
    PRIMARY KEY (sid)
);

CREATE INDEX IDX_session_expire ON sessions (expire);

-- ==========================================
-- INDEXES
-- ==========================================
CREATE INDEX idx_students_class ON students(class_id);
CREATE INDEX idx_scores_student ON scores(student_id);
CREATE INDEX idx_scores_class_subject ON scores(class_subject_id);
CREATE INDEX idx_scores_class ON scores(class_id);
CREATE INDEX idx_scores_term_year ON scores(academic_year_id, term);
CREATE INDEX idx_class_teachers_teacher ON class_teachers(teacher_id);
CREATE INDEX idx_class_subject_teachers_teacher ON class_subject_teachers(teacher_id);

-- ==========================================
-- TIMESTAMP AUTO-UPDATE TRIGGERS
-- ==========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

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

-- ==========================================
-- GRADING FUNCTION
-- ==========================================
CREATE OR REPLACE FUNCTION calculate_grade(score NUMERIC)
RETURNS VARCHAR AS $$
BEGIN
    IF score >= 90 THEN RETURN 'A+';
    ELSIF score >= 80 THEN RETURN 'A';
    ELSIF score >= 70 THEN RETURN 'B';
    ELSIF score >= 60 THEN RETURN 'C';
    ELSIF score >= 50 THEN RETURN 'D';
    ELSIF score >= 40 THEN RETURN 'E';
    ELSE RETURN 'F';
    END IF;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION auto_calculate_grade()
RETURNS TRIGGER AS $$
BEGIN
    NEW.grade = calculate_grade(NEW.ca_score + NEW.exam_score);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calculate_grade_trigger
BEFORE INSERT OR UPDATE OF ca_score, exam_score ON scores
FOR EACH ROW EXECUTE FUNCTION auto_calculate_grade();

-- ==========================================
-- LOCK APPROVED SCORES (teacher transparency)
-- ==========================================
CREATE OR REPLACE FUNCTION lock_approved_scores()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.is_approved = TRUE THEN
        RAISE EXCEPTION 'Cannot modify a score once approved by the teacher.';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER prevent_edit_after_approval
BEFORE UPDATE ON scores
FOR EACH ROW
WHEN (OLD.is_approved = TRUE AND (NEW.ca_score <> OLD.ca_score OR NEW.exam_score <> OLD.exam_score))
EXECUTE FUNCTION lock_approved_scores();

-- ==========================================
-- SET CURRENT ACADEMIC YEAR FUNCTION
-- ==========================================
CREATE OR REPLACE FUNCTION set_current_academic_year(target_id INT)
RETURNS VOID AS $$
BEGIN
    UPDATE academic_years SET is_current = FALSE WHERE is_current = TRUE;
    UPDATE academic_years SET is_current = TRUE WHERE id = target_id;
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- END OF SCHEMA
-- ==========================================
