"""
AI-Powered Learning Recommendation Platform - Backend API
============================================================
Flask REST API providing authentication, course management, an AI-driven
recommendation engine (TF-IDF + cosine similarity content-based filtering),
a resume analyzer, a retrieval-based chatbot, a quiz engine, and an admin
dashboard.

Run:
    pip install -r requirements.txt
    python seed_data.py     # one-time: creates & seeds database.db
    python app.py           # starts server on http://localhost:5000
"""

import os
import io
import re
import json
import datetime
from functools import wraps

from flask import Flask, request, jsonify, g
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
import jwt
import sqlite3

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# ---------------------------------------------------------------------------
# App configuration
# ---------------------------------------------------------------------------
app = Flask(__name__)
CORS(app)  # allow the React dev server to call this API

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "database.db")
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY", "dev-secret-change-me")
app.config["JWT_EXP_HOURS"] = 24


# ---------------------------------------------------------------------------
# Database helpers
# ---------------------------------------------------------------------------
def get_db():
    if "db" not in g:
        g.db = sqlite3.connect(DB_PATH)
        g.db.row_factory = sqlite3.Row
        g.db.execute("PRAGMA foreign_keys = ON")
    return g.db


@app.teardown_appcontext
def close_db(exception=None):
    db = g.pop("db", None)
    if db is not None:
        db.close()


def query(sql, params=(), one=False, commit=False):
    db = get_db()
    cur = db.execute(sql, params)
    if commit:
        db.commit()
        return cur.lastrowid
    rows = cur.fetchall()
    if one:
        return dict(rows[0]) if rows else None
    return [dict(r) for r in rows]


# ---------------------------------------------------------------------------
# Auth helpers
# ---------------------------------------------------------------------------
def create_token(user_id, role):
    payload = {
        "user_id": user_id,
        "role": role,
        "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=app.config["JWT_EXP_HOURS"]),
    }
    return jwt.encode(payload, app.config["SECRET_KEY"], algorithm="HS256")


def token_required(roles=None):
    """Decorator enforcing a valid JWT, optionally restricted to certain roles."""
    def decorator(f):
        @wraps(f)
        def wrapped(*args, **kwargs):
            auth_header = request.headers.get("Authorization", "")
            if not auth_header.startswith("Bearer "):
                return jsonify({"error": "Missing or invalid Authorization header"}), 401
            token = auth_header.split(" ", 1)[1]
            try:
                data = jwt.decode(token, app.config["SECRET_KEY"], algorithms=["HS256"])
            except jwt.ExpiredSignatureError:
                return jsonify({"error": "Token expired"}), 401
            except jwt.InvalidTokenError:
                return jsonify({"error": "Invalid token"}), 401
            if roles and data["role"] not in roles:
                return jsonify({"error": "Insufficient permissions"}), 403
            g.current_user_id = data["user_id"]
            g.current_role = data["role"]
            return f(*args, **kwargs)
        return wrapped
    return decorator


# ---------------------------------------------------------------------------
# AUTH ROUTES
# ---------------------------------------------------------------------------
@app.post("/api/auth/register")
def register():
    body = request.get_json(force=True)
    name = (body.get("name") or "").strip()
    email = (body.get("email") or "").strip().lower()
    password = body.get("password") or ""
    role = body.get("role", "student")

    if not name or not email or len(password) < 6:
        return jsonify({"error": "Name, valid email and password (6+ chars) are required"}), 400
    if role not in ("student", "faculty"):
        role = "student"

    existing = query("SELECT id FROM users WHERE email = ?", (email,), one=True)
    if existing:
        return jsonify({"error": "An account with this email already exists"}), 409

    pw_hash = generate_password_hash(password)
    user_id = query(
        """INSERT INTO users (name, email, password_hash, role, created_at)
           VALUES (?, ?, ?, ?, ?)""",
        (name, email, pw_hash, role, datetime.datetime.utcnow().isoformat()),
        commit=True,
    )
    token = create_token(user_id, role)
    return jsonify({"token": token, "user": {"id": user_id, "name": name, "email": email, "role": role}}), 201


@app.post("/api/auth/login")
def login():
    body = request.get_json(force=True)
    email = (body.get("email") or "").strip().lower()
    password = body.get("password") or ""

    user = query("SELECT * FROM users WHERE email = ?", (email,), one=True)
    if not user or not check_password_hash(user["password_hash"], password):
        return jsonify({"error": "Invalid email or password"}), 401

    token = create_token(user["id"], user["role"])
    return jsonify({
        "token": token,
        "user": {"id": user["id"], "name": user["name"], "email": user["email"], "role": user["role"]},
    })


# ---------------------------------------------------------------------------
# PROFILE ROUTES
# ---------------------------------------------------------------------------
@app.get("/api/profile")
@token_required()
def get_profile():
    user = query("SELECT id, name, email, role, career_goal, interests, skills, "
                  "skill_level, streak, xp, created_at FROM users WHERE id = ?",
                  (g.current_user_id,), one=True)
    if not user:
        return jsonify({"error": "User not found"}), 404
    user["interests"] = json.loads(user["interests"] or "[]")
    user["skills"] = json.loads(user["skills"] or "[]")
    return jsonify(user)


@app.put("/api/profile")
@token_required()
def update_profile():
    body = request.get_json(force=True)
    fields, values = [], []
    for key in ("name", "career_goal", "skill_level"):
        if key in body:
            fields.append(f"{key} = ?")
            values.append(body[key])
    for key in ("interests", "skills"):
        if key in body:
            fields.append(f"{key} = ?")
            values.append(json.dumps(body[key]))
    if not fields:
        return jsonify({"error": "No valid fields to update"}), 400
    values.append(g.current_user_id)
    query(f"UPDATE users SET {', '.join(fields)} WHERE id = ?", values, commit=True)
    return jsonify({"message": "Profile updated"})


# ---------------------------------------------------------------------------
# COURSE ROUTES
# ---------------------------------------------------------------------------
@app.get("/api/courses")
def list_courses():
    search = request.args.get("q", "").strip()
    category = request.args.get("category", "").strip()
    difficulty = request.args.get("difficulty", "").strip()
    sql = "SELECT * FROM courses WHERE 1=1"
    params = []
    if search:
        sql += " AND (title LIKE ? OR tags LIKE ?)"
        params += [f"%{search}%", f"%{search}%"]
    if category:
        sql += " AND category = ?"
        params.append(category)
    if difficulty:
        sql += " AND difficulty = ?"
        params.append(difficulty)
    sql += " ORDER BY rating DESC LIMIT 100"
    return jsonify(query(sql, params))


@app.get("/api/courses/<int:course_id>")
def get_course(course_id):
    course = query("SELECT * FROM courses WHERE id = ?", (course_id,), one=True)
    if not course:
        return jsonify({"error": "Course not found"}), 404
    return jsonify(course)


@app.post("/api/courses")
@token_required(roles=["admin", "faculty"])
def create_course():
    body = request.get_json(force=True)
    required = ["title", "category", "difficulty", "description", "tags"]
    if not all(body.get(f) for f in required):
        return jsonify({"error": f"Required fields: {', '.join(required)}"}), 400
    course_id = query(
        """INSERT INTO courses (title, category, difficulty, description, tags,
           instructor, duration_hours, rating, thumbnail, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
        (body["title"], body["category"], body["difficulty"], body["description"], body["tags"],
         body.get("instructor", "Staff"), body.get("duration_hours", 10), body.get("rating", 4.5),
         body.get("thumbnail", ""), datetime.datetime.utcnow().isoformat()),
        commit=True,
    )
    return jsonify({"id": course_id, "message": "Course created"}), 201


@app.post("/api/courses/<int:course_id>/enroll")
@token_required()
def enroll_course(course_id):
    existing = query("SELECT id FROM enrollments WHERE user_id=? AND course_id=?",
                      (g.current_user_id, course_id), one=True)
    if existing:
        return jsonify({"message": "Already enrolled"})
    query("""INSERT INTO enrollments (user_id, course_id, progress, enrolled_at)
              VALUES (?, ?, 0, ?)""",
          (g.current_user_id, course_id, datetime.datetime.utcnow().isoformat()), commit=True)
    return jsonify({"message": "Enrolled successfully"}), 201


@app.get("/api/my/enrollments")
@token_required()
def my_enrollments():
    rows = query("""SELECT e.*, c.title, c.category, c.thumbnail, c.difficulty
                     FROM enrollments e JOIN courses c ON c.id = e.course_id
                     WHERE e.user_id = ? ORDER BY e.enrolled_at DESC""",
                 (g.current_user_id,))
    return jsonify(rows)


# ---------------------------------------------------------------------------
# AI RECOMMENDATION ENGINE  (Content-Based Filtering: TF-IDF + Cosine Sim)
# ---------------------------------------------------------------------------
def build_recommendations(user_id, top_n=8):
    user = query("SELECT * FROM users WHERE id = ?", (user_id,), one=True)
    if not user:
        return []
    interests = json.loads(user["interests"] or "[]")
    skills = json.loads(user["skills"] or "[]")
    career_goal = user["career_goal"] or ""

    courses = query("SELECT * FROM courses")
    if not courses:
        return []

    # Build the corpus: each course's document is its tags+category+title.
    corpus = [f"{c['title']} {c['category']} {c['tags']} {c['difficulty']}" for c in courses]
    # The user's "document" is built from their declared interests/skills/goal.
    user_doc = " ".join(interests + skills + [career_goal, user["skill_level"] or ""])
    if not user_doc.strip():
        # Cold start -> fall back to highest rated courses
        return sorted(courses, key=lambda c: c["rating"], reverse=True)[:top_n]

    corpus.append(user_doc)
    vectorizer = TfidfVectorizer(stop_words="english")
    tfidf_matrix = vectorizer.fit_transform(corpus)

    user_vector = tfidf_matrix[-1]
    course_vectors = tfidf_matrix[:-1]
    sims = cosine_similarity(user_vector, course_vectors).flatten()

    scored = list(zip(courses, sims))
    scored.sort(key=lambda x: x[1], reverse=True)

    results = []
    for course, score in scored[:top_n]:
        c = dict(course)
        c["match_score"] = round(float(score) * 100, 1)
        results.append(c)
    return results


@app.get("/api/recommendations")
@token_required()
def get_recommendations():
    recs = build_recommendations(g.current_user_id)
    return jsonify(recs)


# ---------------------------------------------------------------------------
# RESUME ANALYZER
# ---------------------------------------------------------------------------
SKILL_BANK = [
    "python", "java", "c++", "javascript", "typescript", "react", "node.js", "flask",
    "django", "sql", "mysql", "mongodb", "html", "css", "tailwind", "git", "docker",
    "kubernetes", "aws", "azure", "gcp", "machine learning", "deep learning",
    "tensorflow", "pytorch", "pandas", "numpy", "scikit-learn", "nlp", "data structures",
    "algorithms", "rest api", "graphql", "linux", "ci/cd", "agile", "figma",
    "android", "kotlin", "swift", "cybersecurity", "networking", "devops", "spring boot",
]

ROLE_SKILL_REQUIREMENTS = {
    "Full Stack Development": ["javascript", "react", "node.js", "sql", "git", "rest api", "html", "css"],
    "Data Science": ["python", "pandas", "numpy", "scikit-learn", "sql", "machine learning"],
    "Machine Learning": ["python", "tensorflow", "pytorch", "machine learning", "deep learning", "numpy"],
    "Cloud Computing": ["aws", "azure", "gcp", "docker", "kubernetes", "linux", "ci/cd"],
    "Cyber Security": ["networking", "linux", "cybersecurity", "python"],
    "DevOps": ["docker", "kubernetes", "ci/cd", "linux", "aws", "git"],
    "Android Development": ["kotlin", "java", "android"],
}


def extract_text_from_pdf(file_stream):
    try:
        from pypdf import PdfReader
    except ImportError:
        from PyPDF2 import PdfReader
    reader = PdfReader(file_stream)
    return "\n".join((page.extract_text() or "") for page in reader.pages)


@app.post("/api/resume/analyze")
@token_required()
def analyze_resume():
    if "resume" not in request.files:
        return jsonify({"error": "No resume file uploaded (field name 'resume')"}), 400
    file = request.files["resume"]
    target_role = request.form.get("target_role", "Full Stack Development")
    filename = secure_filename(file.filename)

    if filename.lower().endswith(".pdf"):
        text = extract_text_from_pdf(io.BytesIO(file.read()))
    else:
        text = file.read().decode("utf-8", errors="ignore")

    text_lower = text.lower()

    found_skills = sorted({s for s in SKILL_BANK if s in text_lower})
    required = ROLE_SKILL_REQUIREMENTS.get(target_role, ROLE_SKILL_REQUIREMENTS["Full Stack Development"])
    missing_skills = [s for s in required if s not in found_skills]

    # --- Simple, transparent ATS scoring heuristic ---
    score = 40
    score += min(len(found_skills), 15) * 2          # up to +30 for skill breadth
    if re.search(r"\b(project|experience|internship)\b", text_lower):
        score += 10
    if re.search(r"\b(education|b\.?tech|bachelor|university|college)\b", text_lower):
        score += 5
    if re.search(r"[\w.+-]+@[\w-]+\.[\w.-]+", text):   # has an email
        score += 5
    if len(text.split()) > 150:
        score += 10
    score = max(0, min(100, score))

    suggestions = []
    if missing_skills:
        suggestions.append(f"Add these in-demand skills for {target_role}: {', '.join(missing_skills)}.")
    if "summary" not in text_lower and "objective" not in text_lower:
        suggestions.append("Add a short professional summary at the top of your resume.")
    if not re.search(r"\b(github|portfolio)\b", text_lower):
        suggestions.append("Include a link to your GitHub or portfolio.")
    if len(text.split()) < 150:
        suggestions.append("Your resume looks short — add more detail about projects and achievements.")
    if not suggestions:
        suggestions.append("Great job! Your resume covers the key bases for this role.")

    recommended_courses = query(
        "SELECT id, title, category, rating FROM courses WHERE category = ? ORDER BY rating DESC LIMIT 5",
        (target_role,),
    )

    result = {
        "target_role": target_role,
        "ats_score": score,
        "found_skills": found_skills,
        "missing_skills": missing_skills,
        "suggestions": suggestions,
        "recommended_courses": recommended_courses,
        "word_count": len(text.split()),
    }

    query("""INSERT INTO resume_analyses (user_id, target_role, ats_score, found_skills,
             missing_skills, analyzed_at) VALUES (?, ?, ?, ?, ?, ?)""",
          (g.current_user_id, target_role, score, json.dumps(found_skills),
           json.dumps(missing_skills), datetime.datetime.utcnow().isoformat()), commit=True)

    return jsonify(result)


# ---------------------------------------------------------------------------
# CAREER GUIDANCE
# ---------------------------------------------------------------------------
CAREER_PATHS = {
    "Full Stack Development": {
        "roadmap": ["HTML/CSS/JS fundamentals", "React & component design", "Node.js/Flask APIs",
                    "Databases (SQL/NoSQL)", "Auth & security", "Deployment (Docker/CI-CD)"],
        "skills": ["JavaScript", "React", "Node.js/Flask", "SQL", "Git", "REST APIs"],
        "salary_range_inr": "6-18 LPA",
        "roles": ["Frontend Developer", "Backend Developer", "Full Stack Engineer"],
        "companies": ["TCS", "Infosys", "Amazon", "Flipkart", "Zoho"],
    },
    "Data Science": {
        "roadmap": ["Python & statistics", "Pandas/NumPy", "Data visualization", "ML algorithms",
                    "Model evaluation", "Deployment of ML models"],
        "skills": ["Python", "SQL", "Pandas", "Scikit-learn", "Statistics"],
        "salary_range_inr": "7-20 LPA",
        "roles": ["Data Analyst", "Data Scientist", "ML Engineer"],
        "companies": ["Mu Sigma", "Fractal", "Google", "Microsoft"],
    },
    "Machine Learning": {
        "roadmap": ["Python", "Linear algebra & probability", "Classical ML", "Deep learning",
                    "NLP/CV specialization", "MLOps"],
        "skills": ["Python", "TensorFlow/PyTorch", "Math for ML", "Model deployment"],
        "salary_range_inr": "8-24 LPA",
        "roles": ["ML Engineer", "AI Researcher", "Applied Scientist"],
        "companies": ["NVIDIA", "Google DeepMind", "Microsoft Research"],
    },
    "Cloud Computing": {
        "roadmap": ["Linux fundamentals", "Networking basics", "AWS/Azure core services",
                    "IaC (Terraform)", "Containers (Docker/K8s)", "Cloud security"],
        "skills": ["AWS/Azure/GCP", "Docker", "Kubernetes", "Linux", "Terraform"],
        "salary_range_inr": "7-20 LPA",
        "roles": ["Cloud Engineer", "Solutions Architect", "Site Reliability Engineer"],
        "companies": ["AWS", "Microsoft", "Google Cloud", "IBM"],
    },
    "Cyber Security": {
        "roadmap": ["Networking", "OS internals", "Security fundamentals", "Ethical hacking",
                    "Security tools", "Compliance & GRC"],
        "skills": ["Networking", "Linux", "Penetration testing", "SIEM tools"],
        "salary_range_inr": "6-18 LPA",
        "roles": ["Security Analyst", "Penetration Tester", "SOC Engineer"],
        "companies": ["Palo Alto Networks", "CrowdStrike", "Deloitte", "TCS"],
    },
    "DevOps": {
        "roadmap": ["Linux & shell scripting", "Git & CI/CD", "Docker & Kubernetes",
                    "IaC", "Monitoring & logging", "Cloud platforms"],
        "skills": ["Docker", "Kubernetes", "Jenkins/GitHub Actions", "Terraform", "AWS"],
        "salary_range_inr": "7-22 LPA",
        "roles": ["DevOps Engineer", "SRE", "Platform Engineer"],
        "companies": ["Amazon", "Atlassian", "Red Hat"],
    },
    "Android Development": {
        "roadmap": ["Java/Kotlin basics", "Android SDK", "UI with Jetpack Compose",
                    "Local storage & networking", "Publishing to Play Store"],
        "skills": ["Kotlin", "Android Studio", "Jetpack Compose", "REST APIs"],
        "salary_range_inr": "5-16 LPA",
        "roles": ["Android Developer", "Mobile Engineer"],
        "companies": ["Google", "Swiggy", "PhonePe"],
    },
}


@app.get("/api/career-guidance/<path:career>")
def career_guidance(career):
    data = CAREER_PATHS.get(career)
    if not data:
        return jsonify({"error": "Unknown career path", "available": list(CAREER_PATHS.keys())}), 404
    courses = query("SELECT id, title, rating FROM courses WHERE category = ? ORDER BY rating DESC LIMIT 6",
                     (career,))
    return jsonify({**data, "career": career, "recommended_courses": courses})


@app.get("/api/career-guidance")
def career_guidance_list():
    return jsonify(list(CAREER_PATHS.keys()))


# ---------------------------------------------------------------------------
# QUIZ SYSTEM
# ---------------------------------------------------------------------------
@app.get("/api/quiz/categories")
def quiz_categories():
    rows = query("SELECT DISTINCT category FROM quiz_questions")
    return jsonify([r["category"] for r in rows])


@app.get("/api/quiz/<category>")
def get_quiz(category):
    limit = int(request.args.get("limit", 10))
    questions = query(
        "SELECT id, category, question, option_a, option_b, option_c, option_d, difficulty "
        "FROM quiz_questions WHERE category = ? ORDER BY RANDOM() LIMIT ?",
        (category, limit),
    )
    return jsonify(questions)


@app.post("/api/quiz/submit")
@token_required()
def submit_quiz():
    body = request.get_json(force=True)
    category = body.get("category")
    answers = body.get("answers", {})  # {question_id: "A"/"B"/"C"/"D"}
    if not category or not answers:
        return jsonify({"error": "category and answers are required"}), 400

    q_ids = list(answers.keys())
    placeholders = ",".join("?" * len(q_ids))
    correct_rows = query(f"SELECT id, correct_option FROM quiz_questions WHERE id IN ({placeholders})", q_ids)
    correct_map = {str(r["id"]): r["correct_option"] for r in correct_rows}

    total = len(answers)
    correct = sum(1 for qid, ans in answers.items() if correct_map.get(str(qid)) == ans)
    score_pct = round((correct / total) * 100, 1) if total else 0

    query("""INSERT INTO quiz_attempts (user_id, category, total_questions, correct_answers,
             score_pct, attempted_at) VALUES (?, ?, ?, ?, ?, ?)""",
          (g.current_user_id, category, total, correct, score_pct,
           datetime.datetime.utcnow().isoformat()), commit=True)

    # Simple adaptive feedback
    if score_pct >= 80:
        feedback = "Excellent! You're ready for advanced material in this topic."
    elif score_pct >= 50:
        feedback = "Good work — a bit more practice on the tricky topics will help."
    else:
        feedback = "This topic needs reinforcement. We'll prioritize foundational content for it."

    return jsonify({"total": total, "correct": correct, "score_pct": score_pct, "feedback": feedback})


@app.get("/api/my/quiz-history")
@token_required()
def quiz_history():
    rows = query("SELECT * FROM quiz_attempts WHERE user_id = ? ORDER BY attempted_at DESC LIMIT 20",
                 (g.current_user_id,))
    return jsonify(rows)


# ---------------------------------------------------------------------------
# AI CHATBOT  (retrieval-based: TF-IDF similarity search over an FAQ/knowledge base)
# ---------------------------------------------------------------------------
with open(os.path.join(BASE_DIR, "chatbot_kb.json"), encoding="utf-8") as f:
    CHATBOT_KB = json.load(f)

_kb_questions = [item["q"] for item in CHATBOT_KB]
_kb_vectorizer = TfidfVectorizer(stop_words="english")
_kb_matrix = _kb_vectorizer.fit_transform(_kb_questions)


def chatbot_reply(message):
    user_vec = _kb_vectorizer.transform([message])
    sims = cosine_similarity(user_vec, _kb_matrix).flatten()
    best_idx = sims.argmax()
    best_score = sims[best_idx]
    if best_score < 0.15:
        return ("I'm not fully sure about that yet, but here's a tip: try rephrasing your question, "
                 "or browse Career Guidance / Courses for structured help on this topic."), best_score
    return CHATBOT_KB[best_idx]["a"], best_score


@app.post("/api/chatbot")
def chatbot():
    body = request.get_json(force=True)
    message = (body.get("message") or "").strip()
    if not message:
        return jsonify({"error": "message is required"}), 400
    reply, score = chatbot_reply(message)

    user_id = None
    auth_header = request.headers.get("Authorization", "")
    if auth_header.startswith("Bearer "):
        try:
            data = jwt.decode(auth_header.split(" ", 1)[1], app.config["SECRET_KEY"], algorithms=["HS256"])
            user_id = data["user_id"]
        except Exception:
            pass

    query("INSERT INTO chat_logs (user_id, message, reply, confidence, created_at) VALUES (?, ?, ?, ?, ?)",
          (user_id, message, reply, float(score), datetime.datetime.utcnow().isoformat()), commit=True)

    return jsonify({"reply": reply, "confidence": round(float(score), 2)})


# ---------------------------------------------------------------------------
# DASHBOARD / ANALYTICS
# ---------------------------------------------------------------------------
@app.get("/api/dashboard/stats")
@token_required()
def dashboard_stats():
    uid = g.current_user_id
    enrolled = query("SELECT COUNT(*) c FROM enrollments WHERE user_id=?", (uid,), one=True)["c"]
    completed = query("SELECT COUNT(*) c FROM enrollments WHERE user_id=? AND progress>=100", (uid,), one=True)["c"]
    quizzes = query("SELECT COUNT(*) c, AVG(score_pct) avg_score FROM quiz_attempts WHERE user_id=?",
                     (uid,), one=True)
    user = query("SELECT streak, xp FROM users WHERE id=?", (uid,), one=True)

    recent_attempts = query("""SELECT category, score_pct, attempted_at FROM quiz_attempts
                                WHERE user_id=? ORDER BY attempted_at DESC LIMIT 5""", (uid,))
    weak_topics = query("""SELECT category, AVG(score_pct) avg_score FROM quiz_attempts
                            WHERE user_id=? GROUP BY category ORDER BY avg_score ASC LIMIT 3""", (uid,))

    return jsonify({
        "enrolled_courses": enrolled,
        "completed_courses": completed,
        "quiz_attempts": quizzes["c"] or 0,
        "avg_quiz_score": round(quizzes["avg_score"] or 0, 1),
        "streak": user["streak"],
        "xp": user["xp"],
        "recent_quiz_attempts": recent_attempts,
        "weak_topics": weak_topics,
    })


@app.get("/api/admin/stats")
@token_required(roles=["admin"])
def admin_stats():
    total_users = query("SELECT COUNT(*) c FROM users WHERE role='student'", one=True)["c"]
    total_faculty = query("SELECT COUNT(*) c FROM users WHERE role='faculty'", one=True)["c"]
    total_courses = query("SELECT COUNT(*) c FROM courses", one=True)["c"]
    total_enrollments = query("SELECT COUNT(*) c FROM enrollments", one=True)["c"]
    total_quiz_attempts = query("SELECT COUNT(*) c FROM quiz_attempts", one=True)["c"]
    by_category = query("""SELECT category, COUNT(*) c FROM courses GROUP BY category ORDER BY c DESC""")
    top_courses = query("""SELECT c.title, COUNT(e.id) enrollments FROM courses c
                            LEFT JOIN enrollments e ON e.course_id = c.id
                            GROUP BY c.id ORDER BY enrollments DESC LIMIT 5""")
    return jsonify({
        "total_students": total_users,
        "total_faculty": total_faculty,
        "total_courses": total_courses,
        "total_enrollments": total_enrollments,
        "total_quiz_attempts": total_quiz_attempts,
        "courses_by_category": by_category,
        "top_courses": top_courses,
    })


# ---------------------------------------------------------------------------
# HEALTH CHECK
# ---------------------------------------------------------------------------
@app.get("/api/health")
def health():
    return jsonify({"status": "ok", "service": "ai-learning-platform-api"})


if __name__ == "__main__":
    if not os.path.exists(DB_PATH):
        print("Database not found. Run `python seed_data.py` first.")
    app.run(host="0.0.0.0", port=5000, debug=os.environ.get("FLASK_DEBUG", "0") == "1")
