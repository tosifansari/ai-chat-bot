# ⚡ Nexus Core AI Chat Engine (Full-Stack)

A premium, highly responsive Full-Stack AI Chat Application featuring secure session authentication schemas, permanent cloud storage via MongoDB Atlas, and production-grade real-time response layouts driven by Llama-3 architectures.

🌐 **Live Demo:** [https://ai-chat-bot-delta-lilac.vercel.app](https://ai-chat-bot-delta-lilac.vercel.app)  
⚙️ **Backend Hub Service:** Hosted on Render Cloud Infrastructure

---

## 🚀 Key Architectural Features (What I Built)

- **Premium Responsive UX/UI:** Designed an immersive, premium dark-themed interface utilizing Tailwind CSS, glassmorphism design parameters, and dynamic custom scrollbars.
- **Dynamic Markdown Compilation:** Integrated `react-markdown` pipelines to natively render structured bullet points, clear code blocks, bold text layouts, and analytical headers directly from raw string streams.
- **Secure Authentication & Sessions:** Engineered an end-to-end user identity flow (Registration & Login) integrated with Mongoose data models and robust frontend LocalStorage state persistence.
- **Auto-Scroll Stream Lifecycle:** Formulated UI-focus hooks using React `useRef` and `useEffect` to ensure seamless viewport tracking during heavy AI reply loading cycles.
- **Llama 3 Core Integration:** Connected the backend directly to Groq Cloud API endpoints (`llama-3.3-70b-versatile`) to secure lightning-fast conversational response thresholds.

---

## 🛠️ High-Performance Tech Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend** | React.js (Vite), Tailwind CSS, Framer Motion, Axios, React-Markdown |
| **Backend** | Node.js, Express.js, Cors |
| **Database** | MongoDB Atlas, Mongoose ODM |
| **API / AI** | Groq Cloud Compute Engine, Llama Architecture |
| **Hosting** | Vercel (Frontend Ecosystem), Render (Backend Framework) |

---

## 📐 System Flow Diagram for Nerds
[Premium React Frontend]
│
▼ (Secured Axios JSON Payloads)
[Express REST API Routing Engine]
│
├─► [MongoDB Atlas Cloud Database] ── (Persists Identity & Chats)
│
└─► [Groq API Edge Network] ──────── (Fetches Llama-3 AI Tokens)


---

## 🛠️ How to Run Locally

### 1. Clone the Workspace Repository
```bash
git clone [https://github.com/YOUR_GITHUB_USERNAME/ai-chat-app.git](https://github.com/YOUR_GITHUB_USERNAME/ai-chat-app.git)
cd ai-chat-app
2. Configure Backend Engine
Navigate to the backend directory, install the required packages, create an .env file, and fill in your keys:

Bash
cd backend
npm install
Create .env inside the backend folder:

Code snippet
MONGO_URI=your_mongodb_connection_string
GROQ_API_KEY=your_groq_api_production_key
PORT=5000
Start server:

Bash
npm start
3. Initialize Frontend Workspace
Open a separate terminal window, navigate to the frontend directory, install packages, and boot the development engine:

Bash
cd frontend
npm install
npm run dev
