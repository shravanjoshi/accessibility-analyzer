# 🧪 Accessibility Analyzer – Web Accessibility Testing Tool

A web-based application that allows users to perform **automated accessibility audits** on any web page by simply providing its URL. Built using **Next.js**, the app integrates the **Axe-core API** to identify WCAG violations and leverages the **Gemini API** to suggest smart code fixes and best practices.

---

## 🚀 Features

- **WCAG Compliance Testing** via Axe-core
- **AI-Powered Fixes & Suggestions** using Google Gemini API
- Simple UI: Just input the website URL and analyze
- Identifies accessibility issues: violated, incomplete, and passed rules
- Displays detailed audit results with actionable insights

---

## 🛠️ Tech Stack

- **Frontend**: Next.js, Tailwind CSS
- **Backend**: Node.js (serverless functions)
- **Accessibility Testing**: [Axe-core](https://www.deque.com/axe/)
- **AI Suggestions**: Google Gemini API
- **Database**: MongoDB (For storing Analysis reports)

---

## 🧪 How It Works

1. User inputs a website URL.
2. Axe-core performs a real-time accessibility audit.
3. Violations, incomplete checks, and passes are shown with details.
4. Users can use AI(Gemini API) to get fixes and best practices for each issue.
5. Results are displayed in a clean, categorized format.

---

## 📦 Installation (Local Development)

```bash
git clone https://github.com/shravanjoshi/accessibility-analyzer.git
cd accessibility-analyzer
npm install
```
- Configure .env.local with your API keys:
```javascript
GEMINI_API_KEY=your-key-here
MONGODB_URI=mongodb-connection-string
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=strong-next-auth-secret
```

- Run the server
```bash
npm run dev
```

