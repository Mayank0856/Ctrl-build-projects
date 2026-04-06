# Smart Education — AI-Powered Learning Platform

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18
- MongoDB (local or Atlas)
- OpenAI API key (optional - app uses mock mode without it)

### 1. Clone & Setup Server
```bash
cd server
cp .env.example .env
# Fill in your MONGO_URI and OPENAI_API_KEY in .env
npm install
npm run dev
```

### 2. Setup Client
```bash
cd client
npm install
npm run dev
```

### 3. Access the App
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000

---

## 📋 Demo Credentials
Sign up with any email, or use:
- **Student**: student@demo.com / password123
- **Admin**: admin@demo.com / password123

---

## 🧠 Features
| Feature | Description |
|---------|-------------|
| 🤖 AI Tutor | GPT-powered chat tutor with emotion-adaptive responses |
| 🎯 Smart Quiz | AI-generated quizzes with timer and detailed review |
| 📸 Focus Monitor | Webcam face detection for real-time concentration tracking |
| 👥 Study Groups | Real-time collaborative chat rooms via Socket.io |
| 📄 Resources | AI-powered document summarizer (PDF/DOCX) |
| 🛡️ Admin Portal | Dashboard with student analytics and management |
| 💬 Floating Chatbot | Persistent AI assistant on every page |

---

## ⚙️ Environment Variables

| Variable | Description |
|----------|-------------|
| `PORT` | Express server port (default: 5000) |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret for JWT signing |
| `OPENAI_API_KEY` | OpenAI API key (mock mode if missing) |

---

## 🏗️ Architecture
```
smart-education/
├── client/    # React + Vite + Tailwind CSS
└── server/    # Node.js + Express + MongoDB + Socket.io
```
