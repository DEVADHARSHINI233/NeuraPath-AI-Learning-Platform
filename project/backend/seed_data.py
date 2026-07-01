"""
Creates database.db (SQLite) with the full schema and seeds it with
realistic synthetic data: courses, quiz questions, an admin/faculty/demo
student account, and sample students with interests/skills so the
recommendation engine has something to work with immediately.

Run once:  python seed_data.py
Re-run any time to reset the demo database (it drops & recreates tables).
"""
import os
import json
import random
import sqlite3
import datetime
from werkzeug.security import generate_password_hash

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "database.db")

random.seed(42)

SCHEMA = """
DROP TABLE IF EXISTS certificates;
DROP TABLE IF EXISTS chat_logs;
DROP TABLE IF EXISTS resume_analyses;
DROP TABLE IF EXISTS quiz_attempts;
DROP TABLE IF EXISTS quiz_questions;
DROP TABLE IF EXISTS enrollments;
DROP TABLE IF EXISTS courses;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    name            TEXT NOT NULL,
    email           TEXT NOT NULL UNIQUE,
    password_hash   TEXT NOT NULL,
    role            TEXT NOT NULL DEFAULT 'student',
    career_goal     TEXT,
    interests       TEXT DEFAULT '[]',
    skills          TEXT DEFAULT '[]',
    skill_level     TEXT DEFAULT 'Beginner',
    profile_photo   TEXT,
    streak          INTEGER DEFAULT 0,
    xp              INTEGER DEFAULT 0,
    created_at      TEXT
);

CREATE TABLE courses (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    title           TEXT NOT NULL,
    category        TEXT NOT NULL,
    difficulty      TEXT NOT NULL,
    description     TEXT,
    tags            TEXT,
    instructor      TEXT,
    duration_hours  INTEGER DEFAULT 10,
    rating          REAL DEFAULT 4.5,
    thumbnail       TEXT,
    created_at      TEXT
);

CREATE TABLE enrollments (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id         INTEGER NOT NULL,
    course_id       INTEGER NOT NULL,
    progress        INTEGER DEFAULT 0,
    enrolled_at     TEXT,
    completed_at    TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    UNIQUE (user_id, course_id)
);

CREATE TABLE quiz_questions (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    category        TEXT NOT NULL,
    question        TEXT NOT NULL,
    option_a        TEXT,
    option_b        TEXT,
    option_c        TEXT,
    option_d        TEXT,
    correct_option  TEXT NOT NULL,
    difficulty      TEXT DEFAULT 'Medium'
);

CREATE TABLE quiz_attempts (
    id                INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id           INTEGER NOT NULL,
    category          TEXT NOT NULL,
    total_questions   INTEGER NOT NULL,
    correct_answers   INTEGER NOT NULL,
    score_pct         REAL NOT NULL,
    attempted_at      TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE resume_analyses (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id         INTEGER NOT NULL,
    target_role     TEXT,
    ats_score       INTEGER,
    found_skills    TEXT,
    missing_skills  TEXT,
    analyzed_at     TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE chat_logs (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id         INTEGER,
    message         TEXT NOT NULL,
    reply           TEXT NOT NULL,
    confidence      REAL,
    created_at      TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE certificates (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id         INTEGER NOT NULL,
    course_id       INTEGER NOT NULL,
    certificate_code TEXT UNIQUE NOT NULL,
    issued_at       TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);
"""

CATEGORIES = [
    "Full Stack Development", "Data Science", "Machine Learning", "Cloud Computing",
    "Cyber Security", "DevOps", "Android Development", "Web Development",
    "UI UX Design", "Game Development", "Artificial Intelligence",
]

TOPIC_WORDS = {
    "Full Stack Development": ["React", "Node.js", "Flask", "REST APIs", "MongoDB", "Express", "JWT Auth"],
    "Data Science": ["Pandas", "NumPy", "Data Visualization", "Statistics", "SQL", "Power BI"],
    "Machine Learning": ["Scikit-learn", "TensorFlow", "PyTorch", "Regression", "Classification", "Model Deployment"],
    "Cloud Computing": ["AWS", "Azure", "GCP", "Docker", "Kubernetes", "Serverless"],
    "Cyber Security": ["Ethical Hacking", "Network Security", "Cryptography", "Penetration Testing", "SOC"],
    "DevOps": ["CI/CD", "Jenkins", "Terraform", "Docker", "Kubernetes", "GitHub Actions"],
    "Android Development": ["Kotlin", "Jetpack Compose", "Android SDK", "Firebase"],
    "Web Development": ["HTML5", "CSS3", "JavaScript", "Tailwind CSS", "Responsive Design"],
    "UI UX Design": ["Figma", "Wireframing", "Prototyping", "Design Systems", "User Research"],
    "Game Development": ["Unity", "C#", "Game Physics", "3D Modeling"],
    "Artificial Intelligence": ["Neural Networks", "NLP", "Computer Vision", "LangChain", "LLMs"],
}

DIFFICULTIES = ["Beginner", "Intermediate", "Advanced"]
INSTRUCTORS = ["Dr. A. Sharma", "Prof. R. Iyer", "Dr. N. Verma", "Prof. K. Menon",
               "Dr. S. Rao", "Prof. P. Nair", "Dr. M. Gupta"]


def gen_courses(n=60):
    courses = []
    for i in range(n):
        cat = CATEGORIES[i % len(CATEGORIES)]
        topics = TOPIC_WORDS[cat]
        level = DIFFICULTIES[i % 3]
        topic_focus = topics[i % len(topics)]
        title = f"{level} {cat}: {topic_focus} Mastery"
        tags = " ".join(topics + [cat, level])
        rating = round(random.uniform(3.9, 5.0), 1)
        duration = random.choice([6, 8, 10, 12, 15, 20, 30])
        description = (
            f"A {level.lower()}-level course covering {topic_focus} within {cat}. "
            f"Includes hands-on projects, quizzes, and real-world case studies to help "
            f"you build job-ready skills in {cat}."
        )
        courses.append((
            title, cat, level, description, tags,
            random.choice(INSTRUCTORS), duration, rating, "",
            datetime.datetime.utcnow().isoformat()
        ))
    return courses


QUIZ_BANK = {
    "Full Stack Development": [
        ("Which HTTP method is idempotent and used to update a resource fully?", "GET", "PUT", "POST", "PATCH", "B"),
        ("In React, what hook manages local component state?", "useEffect", "useState", "useRef", "useMemo", "B"),
        ("Which status code means 'Unauthorized'?", "200", "301", "401", "500", "C"),
        ("What does JWT stand for?", "Java Web Token", "JSON Web Token", "Joint Web Transfer", "JS Web Type", "B"),
        ("Which of these is a NoSQL database?", "MySQL", "PostgreSQL", "MongoDB", "SQLite", "C"),
        ("What does CORS stand for?", "Cross-Origin Resource Sharing", "Client Origin Request Service",
         "Central Object Resource System", "Cross Object Rendering Service", "A"),
        ("Which CSS property creates flexible box layouts?", "grid", "flex", "float", "position", "B"),
        ("REST API responses are commonly returned in which format?", "XML only", "CSV", "JSON", "YAML only", "C"),
    ],
    "Machine Learning": [
        ("Which algorithm is primarily used for classification with a linear decision boundary?",
         "Linear Regression", "Logistic Regression", "K-Means", "PCA", "B"),
        ("What does 'overfitting' mean?", "Model performs well on unseen data", "Model performs poorly on training data",
         "Model memorizes training data but fails to generalize", "Model has too few parameters", "C"),
        ("Which metric balances precision and recall?", "Accuracy", "F1 Score", "RMSE", "R-squared", "B"),
        ("K-Means is an example of which type of learning?", "Supervised", "Unsupervised", "Reinforcement", "Semi-supervised", "B"),
        ("Which library is primarily used for deep learning in Python?", "Pandas", "TensorFlow", "Matplotlib", "Flask", "B"),
        ("What is the purpose of cross-validation?", "Speed up training", "Estimate model generalization performance",
         "Reduce dataset size", "Increase overfitting", "B"),
    ],
    "Data Science": [
        ("Which Python library is primarily used for dataframes?", "NumPy", "Pandas", "Flask", "Requests", "B"),
        ("What does EDA stand for in data science?", "Extra Data Analysis", "Exploratory Data Analysis",
         "Estimated Data Accuracy", "Extended Data Array", "B"),
        ("Which chart best shows the distribution of a numeric variable?", "Pie chart", "Histogram", "Bar chart", "Scatter plot", "B"),
        ("Correlation of 0.9 between two variables indicates?", "No relationship", "Weak relationship",
         "Strong positive relationship", "Strong negative relationship", "C"),
        ("Which SQL clause filters grouped results?", "WHERE", "HAVING", "ORDER BY", "GROUP", "B"),
    ],
    "Cloud Computing": [
        ("Which AWS service provides object storage?", "EC2", "S3", "RDS", "Lambda", "B"),
        ("What does IaaS stand for?", "Infrastructure as a Service", "Internet as a Service",
         "Integration as a Service", "Instance as a Service", "A"),
        ("Docker containers share which part of the host?", "Hardware only", "Kernel", "GPU only", "Nothing", "B"),
        ("Kubernetes is primarily used for?", "Container orchestration", "Video editing", "Web design", "Database backup", "A"),
        ("Which is a serverless compute service on AWS?", "EC2", "Lambda", "S3", "VPC", "B"),
    ],
    "Cyber Security": [
        ("What does SQL Injection exploit?", "Weak passwords", "Unsanitized user input in queries",
         "Slow network speed", "Outdated browsers", "B"),
        ("What is the purpose of a firewall?", "Speed up internet", "Filter network traffic based on rules",
         "Encrypt files", "Compress data", "B"),
        ("What does 'HTTPS' add over 'HTTP'?", "Faster loading", "Encryption via TLS/SSL", "Better SEO", "Smaller file size", "B"),
        ("Phishing is a type of?", "Malware", "Social engineering attack", "Firewall", "Encryption algorithm", "B"),
        ("What does 2FA stand for?", "Two Factor Authentication", "Two File Access",
         "Twin Firewall Application", "Two Function API", "A"),
    ],
    "DevOps": [
        ("What does CI/CD stand for?", "Continuous Integration/Continuous Deployment",
         "Code Inspection/Code Delivery", "Central Index/Central Deploy", "Compile Instantly/Compile Directly", "A"),
        ("Which tool is commonly used for Infrastructure as Code?", "Terraform", "Photoshop", "Excel", "Postman", "A"),
        ("What is the purpose of a Docker image?", "Store databases", "A blueprint to create containers",
         "Manage DNS", "Encrypt traffic", "B"),
        ("Jenkins is primarily a tool for?", "Automation/CI-CD pipelines", "Video editing", "3D rendering", "Word processing", "A"),
    ],
    "Android Development": [
        ("Which language is officially recommended for Android development today?", "Java", "Kotlin", "Swift", "Dart", "B"),
        ("What is used to build modern declarative Android UIs?", "XML only", "Jetpack Compose", "AWT", "Swing", "B"),
        ("Which file declares an Android app's permissions?", "build.gradle", "AndroidManifest.xml", "settings.xml", "README.md", "B"),
    ],
}


def gen_quiz_rows():
    rows = []
    for category, items in QUIZ_BANK.items():
        for q, a, b, c, d, correct in items:
            diff = random.choice(["Easy", "Medium", "Hard"])
            rows.append((category, q, a, b, c, d, correct, diff))
    return rows


FIRST_NAMES = ["Aarav", "Vivaan", "Aditya", "Ishaan", "Kabir", "Ananya", "Diya", "Meera",
               "Priya", "Riya", "Sai", "Arjun", "Kavya", "Neha", "Rohan", "Sneha"]
LAST_NAMES = ["Sharma", "Verma", "Iyer", "Nair", "Reddy", "Menon", "Gupta", "Rao", "Patel", "Singh"]


def gen_students(n=40):
    students = []
    for i in range(n):
        name = f"{random.choice(FIRST_NAMES)} {random.choice(LAST_NAMES)}"
        email = f"student{i+1}@demo.edu"
        interests = random.sample(sum(TOPIC_WORDS.values(), []), k=3)
        skills = random.sample(sum(TOPIC_WORDS.values(), []), k=2)
        goal = random.choice(CATEGORIES)
        level = random.choice(DIFFICULTIES)
        students.append((
            name, email, generate_password_hash("password123"), "student", goal,
            json.dumps(interests), json.dumps(skills), level, None,
            random.randint(0, 30), random.randint(0, 5000),
            datetime.datetime.utcnow().isoformat()
        ))
    return students


CHATBOT_KB = [
    {"q": "What is machine learning", "a": "Machine learning is a branch of AI where systems learn patterns from data instead of being explicitly programmed, improving their performance on a task through experience."},
    {"q": "How do I prepare for placements", "a": "Focus on: 1) DSA practice daily, 2) Build 2-3 solid projects, 3) Mock interviews, 4) Revise core CS subjects (OS, DBMS, CN, OOP), 5) Polish your resume and GitHub profile."},
    {"q": "What is the difference between supervised and unsupervised learning", "a": "Supervised learning trains on labeled data (input-output pairs) to predict outcomes, while unsupervised learning finds hidden patterns or groupings in unlabeled data."},
    {"q": "How do I improve my resume", "a": "Keep it to one page, quantify achievements, list relevant projects with tech stacks, add a GitHub/portfolio link, tailor keywords to the job description, and proofread carefully."},
    {"q": "What is REST API", "a": "A REST API is a web service that follows REST architectural principles, using HTTP methods (GET, POST, PUT, DELETE) to perform operations on resources identified by URLs, typically exchanging JSON."},
    {"q": "Explain time complexity of binary search", "a": "Binary search runs in O(log n) time because it halves the search space with every comparison, requiring the array to be sorted beforehand."},
    {"q": "What is the difference between SQL and NoSQL", "a": "SQL databases are relational, use structured schemas and tables (e.g. MySQL), while NoSQL databases are non-relational and store flexible/schema-less data such as documents or key-value pairs (e.g. MongoDB)."},
    {"q": "How do I debug my code", "a": "Reproduce the bug reliably, add print/log statements or use a debugger to inspect variable state, isolate the smallest failing case, check assumptions, and test the fix against edge cases."},
    {"q": "What skills are needed for cloud computing career", "a": "Core skills include Linux fundamentals, networking basics, a cloud platform (AWS/Azure/GCP), Docker & Kubernetes, Infrastructure as Code (Terraform), and cloud security practices."},
    {"q": "What is a hash table and its time complexity", "a": "A hash table stores key-value pairs using a hash function to map keys to array indices, giving average O(1) time complexity for insert, delete and lookup."},
    {"q": "How does gradient descent work", "a": "Gradient descent iteratively updates model parameters in the direction that reduces the loss function, using the negative gradient scaled by a learning rate, until it converges to a minimum."},
    {"q": "What is overfitting and how to prevent it", "a": "Overfitting happens when a model learns noise in training data rather than the underlying pattern. Prevent it with more data, regularization, cross-validation, simpler models, or early stopping."},
    {"q": "What is the difference between authentication and authorization", "a": "Authentication verifies who a user is (e.g. login), while authorization determines what an authenticated user is allowed to do (e.g. permissions/roles)."},
    {"q": "How do I explain a project in an interview", "a": "Use the STAR method: describe the Situation/problem, your Task, the Actions you took (tech stack, your specific contribution), and the measurable Result or impact."},
    {"q": "What is Big O notation", "a": "Big O notation describes the upper bound of an algorithm's time or space complexity as input size grows, helping compare algorithm efficiency independent of hardware."},
    {"q": "What is Docker used for", "a": "Docker packages an application with all its dependencies into a lightweight, portable container that runs consistently across different environments."},
    {"q": "How can AI help with adaptive learning", "a": "Adaptive learning systems track quiz scores, study time, and topic mastery to dynamically adjust content difficulty and recommend the most relevant material for each learner."},
    {"q": "What is the difference between a stack and a queue", "a": "A stack follows LIFO (Last In, First Out) order, while a queue follows FIFO (First In, First Out) order, affecting how elements are added and removed."},
    {"q": "How do I choose a career path in tech", "a": "Reflect on what problems excite you (building products, data, security, infrastructure), try small projects in 2-3 areas, and use our Career Guidance module to compare roadmaps, skills, and salary ranges."},
    {"q": "What is normalization in databases", "a": "Normalization organizes relational database tables to reduce data redundancy and improve integrity, typically by decomposing tables according to normal forms (1NF, 2NF, 3NF)."},
]


def main():
    if os.path.exists(DB_PATH):
        os.remove(DB_PATH)

    conn = sqlite3.connect(DB_PATH)
    conn.executescript(SCHEMA)

    # --- Demo accounts ---
    conn.execute(
        "INSERT INTO users (name, email, password_hash, role, career_goal, interests, skills, "
        "skill_level, streak, xp, created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)",
        ("Admin User", "admin@demo.edu", generate_password_hash("admin123"), "admin", None,
         "[]", "[]", "Advanced", 0, 0, datetime.datetime.utcnow().isoformat())
    )
    conn.execute(
        "INSERT INTO users (name, email, password_hash, role, career_goal, interests, skills, "
        "skill_level, streak, xp, created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)",
        ("Faculty Demo", "faculty@demo.edu", generate_password_hash("faculty123"), "faculty", None,
         "[]", "[]", "Advanced", 0, 0, datetime.datetime.utcnow().isoformat())
    )
    conn.execute(
        "INSERT INTO users (name, email, password_hash, role, career_goal, interests, skills, "
        "skill_level, streak, xp, created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)",
        ("Demo Student", "student@demo.edu", generate_password_hash("student123"), "student",
         "Machine Learning", json.dumps(["Python", "Neural Networks", "TensorFlow"]),
         json.dumps(["Python", "Statistics"]), "Intermediate", 5, 1250,
         datetime.datetime.utcnow().isoformat())
    )

    # --- Synthetic students ---
    conn.executemany(
        "INSERT INTO users (name, email, password_hash, role, career_goal, interests, skills, "
        "skill_level, profile_photo, streak, xp, created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)",
        gen_students(40)
    )

    # --- Courses ---
    conn.executemany(
        "INSERT INTO courses (title, category, difficulty, description, tags, instructor, "
        "duration_hours, rating, thumbnail, created_at) VALUES (?,?,?,?,?,?,?,?,?,?)",
        gen_courses(60)
    )

    # --- Quiz questions ---
    conn.executemany(
        "INSERT INTO quiz_questions (category, question, option_a, option_b, option_c, option_d, "
        "correct_option, difficulty) VALUES (?,?,?,?,?,?,?,?)",
        gen_quiz_rows()
    )

    # --- Some sample enrollments & quiz attempts for the demo student (id=3) ---
    course_ids = [r[0] for r in conn.execute("SELECT id FROM courses LIMIT 10").fetchall()]
    for cid in random.sample(course_ids, 4):
        conn.execute(
            "INSERT INTO enrollments (user_id, course_id, progress, enrolled_at) VALUES (?,?,?,?)",
            (3, cid, random.choice([20, 45, 70, 100]), datetime.datetime.utcnow().isoformat())
        )
    for cat in ["Machine Learning", "Full Stack Development", "Data Science"]:
        conn.execute(
            "INSERT INTO quiz_attempts (user_id, category, total_questions, correct_answers, "
            "score_pct, attempted_at) VALUES (?,?,?,?,?,?)",
            (3, cat, 10, random.randint(5, 9), random.choice([55.0, 65.0, 75.0, 85.0]),
             datetime.datetime.utcnow().isoformat())
        )

    conn.commit()
    conn.close()

    with open(os.path.join(BASE_DIR, "chatbot_kb.json"), "w", encoding="utf-8") as f:
        json.dump(CHATBOT_KB, f, indent=2)

    print("Database seeded successfully at", DB_PATH)
    print("Demo logins:")
    print("  Admin:   admin@demo.edu   / admin123")
    print("  Faculty: faculty@demo.edu / faculty123")
    print("  Student: student@demo.edu / student123")


if __name__ == "__main__":
    main()
