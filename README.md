<div align="center">

# 🌌 Developer Skill Analyzer Pro
### **Professional GitHub Profile Auditing & Insights**

![Hero Mockup](./hero_mockup.png)

[![Architecture: Serverless](https://img.shields.io/badge/Architecture-Serverless-green?style=for-the-badge)](#)
[![Stack: React + Supabase](https://img.shields.io/badge/Stack-React_%2B_Supabase-blue?style=for-the-badge)](#)
[![Design: Minimalist Neon](https://img.shields.io/badge/Design-Minimalist_Neon-cyan?style=for-the-badge)](#)

---

</div>

## 📖 Overview
**Developer Skill Analyzer Pro** is a high-performance, AI-driven platform designed to provide a deep, multi-dimensional analysis of any GitHub profile. By leveraging real-time data analysis and a serverless backend, it transforms raw repository data into actionable career insights.

---

## 🏗️ System Architecture: **Serverless Monolith**

This project utilizes a **Modern Serverless Architecture**. Unlike traditional server-based applications, this platform is decentralized across edge providers to ensure 99.9% uptime and global scalability.

### **Architecture Workflow**
```mermaid
graph TD
    User((User)) -->|HTTPS| Frontend[Netlify Edge CDN]
    Frontend -->|React 19 UI| Browser(Browser)
    Browser -->|API Request| EdgeFn[Supabase Edge Functions]
    EdgeFn -->|Logic Execution| GitHubAPI[GitHub v3 API]
    GitHubAPI -->|JSON Data| EdgeFn
    EdgeFn -->|Processed Insights| Browser
```

### **Why Serverless?**
- **Zero Cold Starts**: Leveraging Deno-based Supabase Functions for near-instant execution.
- **Auto-Scaling**: Seamlessly handles traffic spikes without manual intervention.
- **Edge Execution**: Code runs at the network edge, closest to the user, for sub-100ms latency.

---

## 🛠️ Technical Stack

### **Frontend Layer**
- **React 19**: Utilizing the latest concurrent rendering features.
- **Vite**: Ultra-fast build tool and development server.
- **Tailwind CSS v4**: Modular, utility-first styling for a premium "Modern Midnight" UI.
- **Recharts**: High-performance SVG charts for data visualization.

### **Backend & Compute Layer**
- **Supabase Edge Functions**: Serverless Deno runtime for core logic.
- **FastAPI (Reference)**: Original logic prototyped in Python for the scoring engine.
- **Axios**: Robust HTTP client for secure API orchestration.

---

## 🧮 The AI Scoring Engine
The platform uses a weighted multi-dimensional algorithm to analyze developer impact:

> [!NOTE]
> **Score Normalization**: The final IQ is calculated using a logarithmic scale to ensure a fair 0-1000 distribution.

| Dimension | Weight | Metric Evaluated |
| :--- | :---: | :--- |
| **Output Volume** | 15% | Total repositories and contribution history. |
| **Impact Quality** | 40% | Stars, Forks, and community engagement. |
| **Activity Velocity** | 25% | Push events and commits in the last 30 days. |
| **Tech Diversity** | 20% | Unique language mastery and tool stack breadth. |

---

## 🚀 Installation & Setup

### **1. Clone the Repository**
```bash
git clone https://github.com/adityasing9/DevAnalyzer-Pro.git
```

### **2. Frontend Configuration**
```bash
cd DevAnalyzer-Pro/frontend
npm install
npm run dev
```

### **3. Environment Variables**
Configure your `.env` for production:
```env
VITE_API_URL=https://uomkrgqgxbvdmvcikdhh.supabase.co/functions/v1
```

---

<div align="center">
  <h2 style="color: #00ffcc;">AI-Inspire System</h2>
  <sub>Developed & Maintained by Aditya Sing</sub>
</div>
