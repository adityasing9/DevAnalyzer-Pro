# 🚀 DevAnalyzer Pro

![Modern Midnight Design](https://img.shields.io/badge/Design-Modern_Midnight-blue?style=for-the-badge)
![Serverless](https://img.shields.io/badge/Architecture-Serverless-green?style=for-the-badge)
![GitHub API](https://img.shields.io/badge/Data-GitHub_API_v3-black?style=for-the-badge)

**DevAnalyzer Pro** is a professional-grade, serverless platform designed to provide a deep, multi-dimensional analysis of any GitHub profile. Using a weighted scoring engine and domain inference logic, it transforms raw repository data into actionable career insights.

---

## 🌐 Live Access
- **Frontend**: [http://soft-biscochitos-0b28e5.netlify.app](http://soft-biscochitos-0b28e5.netlify.app)
- **API (Edge)**: Hosted on Supabase Edge Functions

---

## ✨ Features
- **🎯 0-1000 Weighted Scoring**: A complex algorithm that evaluates Volume, Quality, Activity, and Technological Diversity.
- **🧠 Domain Inference**: Automatically identifies whether a developer is focused on Frontend, Backend, Data/ML, Systems, or Mobile.
- **📊 Real-time Visualizations**: Dynamic language distribution charts powered by Recharts.
- **💡 Career Insights**: AI-driven (deterministic logic) identification of Strengths, Gaps, and Actionable Steps.
- **🌌 Premium UI**: A "Modern Midnight" design system featuring mesh gradients, glassmorphism, and responsive Bento-box layouts.

---

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React 19, Vite, Tailwind CSS v4 |
| **Charts** | Recharts (Responsive Vector Graphics) |
| **Backend** | Supabase Edge Functions (Deno / TypeScript) |
| **Deployment** | Netlify (Frontend) + Supabase (Backend) |
| **Architecture** | 100% Serverless |

---

## 🧮 The Scoring Engine
Our proprietary algorithm calculates the **Developer IQ** using the following weighted dimensions:

> [!TIP]
> **Formula:** `Score = 200 * log10(Volume + Quality + Activity + Diversity + 1)`

- **Volume (15%)**: Public Repositories & Followers.
- **Quality (40%)**: Total Stars & Forks (Community impact).
- **Activity (25%)**: Recent PushEvents within the last 30 days.
- **Diversity (20%)**: Number of unique programming languages mastered.

---

## 🚀 Local Development

### 1. Clone & Install
```bash
git clone https://github.com/adityasing9/DevAnalyzer-Pro.git
cd DevAnalyzer-Pro/frontend
npm install
```

### 2. Environment Setup
Create a `.env` file in the frontend folder:
```env
VITE_API_URL=https://uomkrgqgxbvdmvcikdhh.supabase.co/functions/v1
```

### 3. Run
```bash
npm run dev
```

---

## 📂 Project Structure
```text
├── frontend/               # React + Tailwind Source
│   ├── src/App.jsx         # Main Dashboard Logic
│   └── src/index.css       # Premium Design Tokens
├── backend/                # Original FastAPI Logic (for reference)
└── supabase/               # Production Edge Function Source
    └── functions/index.ts  # Live Serverless Logic
```

---

> [!IMPORTANT]
> This project was built for high-performance profile auditing. It utilizes the GitHub API v3. For high-volume usage, ensure a `GITHUB_TOKEN` is configured in the Supabase Secret vault.

Developed by **Aditya Sing** 🚀
