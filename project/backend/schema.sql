-- ============================================================================
-- AI Learning Platform — Normalized Relational Schema (MySQL 8 compatible)
-- The Flask backend uses an equivalent SQLite schema (see seed_data.py) for
-- zero-config local/demo use. This script is the reference design for
-- production deployment on MySQL, and matches the documentation ER diagram.
-- ============================================================================

CREATE DATABASE IF NOT EXISTS ai_learning_platform;
USE ai_learning_platform;

-- ---------------------------------------------------------------- users ----
CREATE TABLE users (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(120) NOT NULL,
    email           VARCHAR(150) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    role            ENUM('student','faculty','admin') NOT NULL DEFAULT 'student',
    career_goal     VARCHAR(120),
    interests       JSON,
    skills          JSON,
    skill_level     VARCHAR(30) DEFAULT 'Beginner',
    profile_photo   VARCHAR(255),
    streak          INT DEFAULT 0,
    xp              INT DEFAULT 0,
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_users_role (role),
    INDEX idx_users_email (email)
);

-- -------------------------------------------------------------- courses ----
CREATE TABLE courses (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    title           VARCHAR(200) NOT NULL,
    category        VARCHAR(100) NOT NULL,
    difficulty      ENUM('Beginner','Intermediate','Advanced') NOT NULL,
    description     TEXT,
    tags            VARCHAR(500),
    instructor      VARCHAR(120),
    duration_hours  INT DEFAULT 10,
    rating          DECIMAL(2,1) DEFAULT 4.5,
    thumbnail       VARCHAR(255),
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_courses_category (category),
    INDEX idx_courses_difficulty (difficulty),
    FULLTEXT idx_courses_search (title, tags)
);

-- ---------------------------------------------------------- enrollments ----
CREATE TABLE enrollments (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    user_id         INT NOT NULL,
    course_id       INT NOT NULL,
    progress        TINYINT DEFAULT 0,          -- 0-100
    enrolled_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
    completed_at    DATETIME NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    UNIQUE KEY uq_user_course (user_id, course_id),
    INDEX idx_enrollments_user (user_id)
);

-- ------------------------------------------------------- quiz_questions ----
CREATE TABLE quiz_questions (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    category        VARCHAR(100) NOT NULL,
    question        TEXT NOT NULL,
    option_a        VARCHAR(255),
    option_b        VARCHAR(255),
    option_c        VARCHAR(255),
    option_d        VARCHAR(255),
    correct_option  CHAR(1) NOT NULL,           -- 'A' | 'B' | 'C' | 'D'
    difficulty      ENUM('Easy','Medium','Hard') DEFAULT 'Medium',
    INDEX idx_quiz_category (category)
);

-- --------------------------------------------------------- quiz_attempts --
CREATE TABLE quiz_attempts (
    id                INT AUTO_INCREMENT PRIMARY KEY,
    user_id           INT NOT NULL,
    category          VARCHAR(100) NOT NULL,
    total_questions   INT NOT NULL,
    correct_answers   INT NOT NULL,
    score_pct         DECIMAL(5,1) NOT NULL,
    attempted_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_attempts_user (user_id)
);

-- ------------------------------------------------------ resume_analyses ---
CREATE TABLE resume_analyses (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    user_id         INT NOT NULL,
    target_role     VARCHAR(120),
    ats_score       INT,
    found_skills    JSON,
    missing_skills  JSON,
    analyzed_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ------------------------------------------------------------ chat_logs ---
CREATE TABLE chat_logs (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    user_id         INT NULL,
    message         TEXT NOT NULL,
    reply           TEXT NOT NULL,
    confidence      DECIMAL(4,3),
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- ---------------------------------------------------------- certificates --
CREATE TABLE certificates (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    user_id         INT NOT NULL,
    course_id       INT NOT NULL,
    certificate_code VARCHAR(40) UNIQUE NOT NULL,
    issued_at       DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);
