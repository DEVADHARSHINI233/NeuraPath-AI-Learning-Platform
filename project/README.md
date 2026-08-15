# 🧠 NeuraPath — AI-Powered Learning Recommendation Platform

<p align="center">
  <strong>AI-powered personalized learning, career guidance, resume analysis, adaptive quizzes, and intelligent assistance in one platform.</strong>
</p>

<p align="center">
  🚀 <strong>Live Demo:</strong>
  <a href="https://neura-path-ai-learning-platform-pxr3-pkkc8sgsv.vercel.app/">NeuraPath Live Application</a>
</p>

---

## 📌 Overview

**NeuraPath** is a full-stack AI-powered learning and career guidance platform designed to help students discover suitable learning paths, evaluate their skills, improve their knowledge, and make better career decisions.

The platform combines learning resources, AI-based recommendations, resume analysis, quizzes, career guidance, and a retrieval-based chatbot into a single web application.

NeuraPath is designed as a final-year CSE project demonstrating the integration of **Artificial Intelligence, Web Development, Backend APIs, Database Management, and personalized learning systems**.

---

## 🚀 Live Deployment

### 🌐 Deployed Application

**Live URL:**
https://neura-path-ai-learning-platform-pxr3-pkkc8sgsv.vercel.app/

👉 **[Open NeuraPath](https://neura-path-ai-learning-platform-pxr3-pkkc8sgsv.vercel.app/)**

The frontend application is deployed using **Vercel**, providing a publicly accessible web interface for the project.

---

## ✨ Key Features

### 🔐 Authentication

* User registration and login
* Secure authentication flow
* User-specific dashboard
* Session-based access to application features

### 📚 Personalized Learning

* Course recommendations based on user interests and skills
* Organized learning content
* Personalized learning paths
* Progress-oriented learning experience

### 📄 Resume Analysis

Users can provide their resume information for analysis.

The platform can help identify:

* Skills
* Areas of expertise
* Potential career paths
* Learning requirements
* Skill gaps

### 🧭 Career Guidance

NeuraPath helps students explore possible career directions based on their skills and learning interests.

Example career areas include:

* Software Development
* Data Science
* Artificial Intelligence
* Machine Learning
* Web Development
* Cloud Computing

### 📝 Adaptive Quiz System

The platform includes quiz functionality to help students evaluate their understanding.

The quiz system can be used for:

* Knowledge assessment
* Topic-based practice
* Performance evaluation
* Learning improvement

### 🤖 AI-Based Chatbot

NeuraPath includes an intelligent chatbot designed to answer questions related to the available learning information.

The chatbot follows a retrieval-based approach to provide context-aware responses.

### 📊 Student Dashboard

The dashboard provides a centralized interface where users can access the major learning and career-related features of the platform.

---

## 🏗️ System Architecture

```text
                    ┌───────────────────────┐
                    │       Student         │
                    └───────────┬───────────┘
                                │
                                ▼
                    ┌───────────────────────┐
                    │    NeuraPath UI       │
                    │      Frontend         │
                    └───────────┬───────────┘
                                │
                         HTTP / REST API
                                │
                                ▼
                    ┌───────────────────────┐
                    │      Flask Backend    │
                    │       REST APIs       │
                    └───────────┬───────────┘
                                │
                ┌───────────────┼────────────────┐
                │               │                │
                ▼               ▼                ▼
          ┌──────────┐   ┌─────────────┐   ┌──────────────┐
          │ Database │   │ AI / Chatbot│   │ Application  │
          │          │   │   Logic     │   │    Data      │
          └──────────┘   └─────────────┘   └──────────────┘
```

---

## 🛠️ Technology Stack

### Frontend

* React.js
* HTML5
* CSS3
* JavaScript
* Vercel

### Backend

* Python
* Flask
* REST API

### Database

* SQLite

### AI / Intelligent Features

* Retrieval-based chatbot
* Resume analysis
* Recommendation logic
* AI-assisted learning features

### Development Tools

* Git
* GitHub
* Visual Studio Code
* Vercel

---

## 📂 Project Structure

```text
NeuraPath-AI-Learning-Platform/
│
├── project/
│   │
│   ├── backend/
│   │   ├── backend/
│   │   ├── Dockerfile
│   │   ├── app.py
│   │   ├── chatbot_kb.json
│   │   ├── requirements.txt
│   │   ├── schema.sql
│   │   └── seed_data.py
│   │
│   ├── frontend/
│   │   └── React application
│   │
│   ├── .gitignore
│   ├── README.md
│   └── docker-compose.yml
│
└── README.md
```

---

## ⚙️ Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/DEVADHARSHINI233/NeuraPath-AI-Learning-Platform.git
```

```bash
cd NeuraPath-AI-Learning-Platform
```

---

## 🔧 Backend Setup

Navigate to the backend directory:

```bash
cd project/backend
```

Create a virtual environment:

```bash
python -m venv venv
```

Activate the virtual environment.

### Windows

```bash
venv\Scripts\activate
```

### Linux / macOS

```bash
source venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Initialize the database:

```bash
python seed_data.py
```

Start the Flask backend:

```bash
python app.py
```

The backend will run locally according to the configuration in `app.py`.

---

## 💻 Frontend Setup

Open a new terminal and navigate to the frontend:

```bash
cd project/frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The frontend will then be available through the local development URL displayed by the React development server.

---

## 🗄️ Database

NeuraPath uses **SQLite** for local application data.

The database contains application information such as:

* Users
* Courses
* Quiz questions
* Learning-related data
* Other application records

The `seed_data.py` script is provided to initialize and populate the required database tables.

---

## 🔄 Application Workflow

```text
User
 │
 ▼
Registration / Login
 │
 ▼
Dashboard
 │
 ├──────────────► Course Recommendations
 │
 ├──────────────► Resume Analysis
 │
 ├──────────────► Career Guidance
 │
 ├──────────────► Adaptive Quizzes
 │
 └──────────────► AI Chatbot
                         │
                         ▼
                  Relevant Knowledge
                         │
                         ▼
                  Contextual Response
```

---

## 🎯 Problem Statement

Students often struggle to identify:

* Which skills they should learn
* Which courses are suitable for their career goals
* What skills are missing from their resumes
* Which career path matches their interests
* How to evaluate their technical knowledge
* Where to find reliable learning guidance

NeuraPath addresses these challenges by bringing **learning recommendations, resume analysis, career guidance, quizzes, and AI assistance** together in a single platform.

---

## 💡 Objectives

The main objectives of NeuraPath are:

1. To provide personalized learning recommendations.
2. To help students analyze their skills and resumes.
3. To provide career-oriented guidance.
4. To evaluate student knowledge through quizzes.
5. To provide an intelligent chatbot for learning assistance.
6. To demonstrate the practical use of AI in education.
7. To develop a complete full-stack web application.

---

## 🔒 Security Considerations

The project follows basic application security practices including:

* Authentication-based access
* Backend API validation
* Separation of frontend and backend
* Environment-based configuration for deployment
* Sensitive configuration kept outside source code where applicable

For production-scale deployment, additional security measures such as HTTPS enforcement, stronger authentication, rate limiting, secure secret management, and database hardening should be added.

---

## 🚀 Deployment

The frontend application is deployed using **Vercel**.

### Production Application

**NeuraPath:**
https://neura-path-ai-learning-platform-pxr3-pkkc8sgsv.vercel.app/

Vercel supports Git-based deployment workflows where updates can be deployed from the connected repository.

---

## 🧪 Verification

The project was locally verified for core functionality, including:

* Database initialization
* Database seeding
* Authentication endpoints
* Backend server startup
* API functionality
* Frontend integration
* Production frontend deployment

---

## 📈 Future Enhancements

The platform can be extended with:

* Advanced AI career prediction
* More personalized recommendation algorithms
* Resume scoring
* Resume-to-job matching
* Mock interview system
* AI-generated interview questions
* Real-time coding practice
* Skill-gap visualization
* Learning progress analytics
* Gamification and achievement badges
* Leaderboards
* More advanced RAG-based knowledge retrieval
* Cloud database integration
* Mobile application
* Advanced admin dashboard

---

## 👩‍💻 Project Information

**Project Name:** NeuraPath – AI-Powered Learning Recommendation Platform

**Project Type:** Full-Stack AI-Based Learning Platform

**Domain:** Artificial Intelligence / Education Technology / Web Development

**Deployment:** Vercel

**Repository:**
https://github.com/DEVADHARSHINI233/NeuraPath-AI-Learning-Platform

---

## ⭐ Conclusion

NeuraPath demonstrates how **Artificial Intelligence and full-stack web technologies** can be combined to create a personalized educational platform.

By integrating learning recommendations, resume analysis, career guidance, quizzes, and an intelligent chatbot, the system provides students with a centralized platform for improving their technical skills and planning their careers.

---

## 🌐 Links

| Resource             | Link                                                               |
| -------------------- | ------------------------------------------------------------------ |
| 🚀 Live Application  | https://neura-path-ai-learning-platform-pxr3-pkkc8sgsv.vercel.app/ |
| 💻 GitHub Repository | https://github.com/DEVADHARSHINI233/NeuraPath-AI-Learning-Platform |

---

<p align="center">
  <strong>NeuraPath — Learn Smarter. Build Skills. Shape Your Career. 🚀</strong>
</p>
