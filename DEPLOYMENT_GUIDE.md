# Production Deployment Guide — Digital Forensics Platform

This guide outlines how to deploy your custom **Digital Forensics Platform** to the web as your live operational website.

---

## Deployment Options Summary

| Method | Recommended For | Cost | Effort |
| :--- | :--- | :--- | :--- |
| **Option 1: Vercel (Frontend) + Render/Railway (Backend)** | Quickest setup, separate scale | Free tier available | Low (15 mins) |
| **Option 2: Docker Container (Render / Railway)** | Single container, 1-click deploy | Free / $5/mo | Very Low |
| **Option 3: Custom VPS (DigitalOcean / Hetzner / AWS)** | Full control, custom SSL domain | ~$5–$10/mo | Medium |

---

## Option 1: Deploy on Vercel & Render (Free Tier)

### Step 1: Push Code to GitHub
1. Create a repository on GitHub (e.g. `my-forensics-platform`).
2. Initialize git and push your repository:
   ```bash
   git init
   git add .
   git commit -m "Initial commit of production forensics platform"
   git remote add origin https://github.com/YOUR_USERNAME/my-forensics-platform.git
   git push -u origin main
   ```

### Step 2: Deploy Backend to Render (or Railway)
1. Go to [Render.com](https://render.com) and create a **Web Service**.
2. Connect your GitHub repository.
3. Set up the environment:
   - **Root Directory**: `backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `python -m uvicorn main:app --host 0.0.0.0 --port $PORT`
4. Add Environment Variables:
   - `GEMINI_API_KEY`: *(Your Google Gemini API Key)*
   - `SECRET_KEY`: *(Random secure string)*
5. Click **Deploy**. Note your live API URL (e.g. `https://my-forensics-backend.onrender.com`).

### Step 3: Deploy Frontend to Vercel
1. Go to [Vercel.com](https://vercel.com) and click **Add New Project**.
2. Select your `my-forensics-platform` repository.
3. Configure project:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
4. In Environment Variables, add:
   - `VITE_API_BASE_URL`: `https://my-forensics-backend.onrender.com`
5. Click **Deploy**. Vercel will build and give you a custom domain (e.g. `https://my-forensics.vercel.app`).

---

## Option 2: 1-Click Docker Container Deployment

If using **Railway**, **Render Web Services (Docker)**, or **Fly.io**:

1. Simply connect your GitHub repository.
2. Select **Docker** as the runtime environment.
3. Render/Railway will detect `Dockerfile` in the root directory, build both frontend and backend in one image, and launch Uvicorn on port 8000 automatically!

---

## Option 3: VPS Host (DigitalOcean / AWS / Linode) with Nginx & SSL

### Step 1: Install Docker & Docker Compose on Ubuntu Server
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y docker.io docker-compose git nginx certbot python3-certbot-nginx
```

### Step 2: Clone & Launch App
```bash
git clone https://github.com/YOUR_USERNAME/my-forensics-platform.git /var/www/forensics
cd /var/www/forensics
echo "GEMINI_API_KEY=your_key_here" > .env
docker-compose up -d --build
```

### Step 3: Configure Nginx & SSL (Custom Domain)
1. Point your domain (e.g., `forensics.yourdomain.com`) A-record to your server IP.
2. Create `/etc/nginx/sites-available/forensics`:
   ```nginx
   server {
       server_name forensics.yourdomain.com;

       location / {
           proxy_pass http://127.0.0.1:8000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }
   ```
3. Enable site and issue SSL certificate:
   ```bash
   sudo ln -s /etc/nginx/sites-available/forensics /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl reload nginx
   sudo certbot --nginx -d forensics.yourdomain.com
   ```

---

## Production Security Checklists

- [x] Removed all hardcoded sample data and demo account buttons.
- [ ] Set `GEMINI_API_KEY` in environment variables.
- [ ] Change `SECRET_KEY` in `backend/app/config.py` or environment variables to a unique string.
- [ ] Verify CORS settings in `backend/main.py` restrict origins to your official domain.
