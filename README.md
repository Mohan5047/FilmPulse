# 🎬 CineVerse — Modern Full-Stack Movie Review & Rating Application

[![Live Demo](https://img.shields.io/badge/Live%20Demo-CineVerse%20App-f59e0b?style=for-the-badge&logo=googlechrome&logoColor=white)](https://sarathi092007cse2427-stack.github.io/movie-review-system/)
[![GitHub Actions CI/CD](https://img.shields.io/badge/Deploy-GitHub%20Pages-22c55e?style=for-the-badge&logo=githubactions&logoColor=white)](https://sarathi092007cse2427-stack.github.io/movie-review-system/)
[![React](https://img.shields.io/badge/React-18-61dafb?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-5-646cff?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-38bdf8?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Express](https://img.shields.io/badge/Express-4-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com)
[![SQLite](https://img.shields.io/badge/SQLite-sql.js-003B57?style=for-the-badge&logo=sqlite&logoColor=white)](https://sqlite.org)

> **🚀 DIRECT LIVE APPLICATION LINK:**
> ### 👉 **[https://sarathi092007cse2427-stack.github.io/movie-review-system/](https://sarathi092007cse2427-stack.github.io/movie-review-system/)**

---

## ✨ Features

- **🎥 Rich Movie Discovery:** Browse popular and curated movies with HD backdrops, posters, trailer embeds, cast, genres, and synopsis.
- **⭐ Interactive Reviews & Ratings:** Read and submit reviews with 5-star ratings, spoiler tags, and review upvoting.
- **🔍 Fast Search & Filter:** Filter dynamically by genre (Sci-Fi, Action, Drama, etc.) and search by title, director, or cast.
- **🔖 Personal Watchlist:** Add movies to your private watchlist with 1-click bookmarks.
- **👤 User Authentication:** Sign up, log in with JWT auth, and manage your review profile.
- **🌓 Cinematic Dark UI:** Built with sleek glassmorphism, Amber & Crimson accents, and smooth micro-animations.
- **⚡ Dual Mode (Live API & Offline/Static Demo):** Works natively with the Express + SQLite backend or standalone on GitHub Pages with instant mock fallback.

---

## 🛠️ Tech Stack

- **Frontend:** React 18, Vite, React Router (`HashRouter`), Tailwind CSS, Lucide Icons, Axios.
- **Backend:** Node.js, Express, SQL.js (SQLite), JWT (`jsonwebtoken`), bcryptjs, CORS.
- **Deployment:** GitHub Pages (automated CI/CD via GitHub Actions) & Render/Vercel unified support.

---

## 🚀 How to Run Locally

### 1. Clone the repository
```bash
git clone https://github.com/sarathi092007cse2427-stack/movie-review-system.git
cd movie-review-system
```

### 2. Install dependencies
```bash
npm run install:all
```

### 3. Start development server (Frontend + Backend concurrently)
```bash
npm run dev
```

- **Frontend:** [http://localhost:5173](http://localhost:5173)
- **Backend API:** [http://localhost:5000](http://localhost:5000)

---

## 🌐 Deploying to GitHub Pages (Direct App Link)

To have your repository automatically build and open the direct web app rather than rendering `README.md`:

1. Go to your repository on GitHub: `https://github.com/sarathi092007cse2427-stack/movie-review-system`
2. Click **Settings** (top tab) ➔ **Pages** (left sidebar).
3. Under **Build and deployment** ➔ **Source**, select **GitHub Actions** (instead of *Deploy from a branch*).
4. Commit and push any changes to `main`:
   ```bash
   git add .
   git commit -m "Configure GitHub Pages automated deployment"
   git push origin main
   ```
5. GitHub Actions will automatically run the `.github/workflows/deploy.yml` workflow, build the Vite app, and publish it to:
   **[https://sarathi092007cse2427-stack.github.io/movie-review-system/](https://sarathi092007cse2427-stack.github.io/movie-review-system/)**

---

## ☁️ Full-Stack Deployment (Render / Railway)

Because the project includes an Express backend and SQLite database:
1. Connect your GitHub repository to **[Render.com](https://render.com/)** as a **Web Service**.
2. Settings:
   - **Build Command:** `npm run build`
   - **Start Command:** `npm start`
   - **Environment Variables:**
     - `PORT=5000`
     - `JWT_SECRET=your_jwt_secret_key`
     - `NODE_ENV=production`
3. Render will install all dependencies, build the frontend bundle into `frontend/dist`, and launch the unified server hosting both the REST API and the frontend single-page app!

---

## 📄 License
MIT License © 2026 CineVerse
