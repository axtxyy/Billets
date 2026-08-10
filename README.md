# Billets - AI Resume Coach

## Project Structure
```
billets/
├── .github/workflows/ci-cd.yml    # GitHub Actions CI/CD
├── fly.toml                        # Fly.io backend config
├── vercel.json                     # Vercel frontend config
├── package.json                    # Frontend dependencies
├── src/                            # React frontend
├── server/                         # Python FastAPI backend
│   ├── main.py                     # FastAPI app
│   ├── ai_service.py               # NVIDIA LLM integration
│   ├── pdf_parser.py               # PDF text extraction
│   ├── requirements.txt            # Python dependencies
│   └── Dockerfile                  # Docker config for Fly.io
└── .env.example                    # Environment variables template
```

## Quick Start

### 1. Create GitHub Repository
```bash
# In the billets directory:
git init
git add .
git commit -m "Initial commit: billets project"
gh repo create billets --public --source=. --remote=origin --push
```

### 2. Set Up GitHub Secrets
Go to **Settings → Secrets and variables → Actions** and add:

| Secret | Value |
|--------|-------|
| `FLY_API_TOKEN` | From https://fly.io/user/personal_access_tokens |
| `NVIDIA_API_KEY` | Your NVIDIA API key |
| `VERCEL_TOKEN` | From Vercel account settings |
| `VERCEL_ORG_ID` | From `vercel inspect` or project settings |
| `VERCEL_PROJECT_ID` | From `vercel inspect` or project settings |

### 3. Deploy Backend to Fly.io (First Time)
```bash
# Install flyctl locally (one-time)
# Windows: iwr https://fly.io/install.ps1 -useb | iex
# Mac/Linux: curl -L https://fly.io/install.sh | sh

# Login and create app
flyctl auth login
flyctl apps create billets-api --org personal
flyctl secrets set NVIDIA_API_KEY=your_key --app billets-api
flyctl deploy --config fly.toml --app billets-api
```

### 4. Deploy Frontend to Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
# Follow prompts, link to GitHub repo
```

### 5. Connect Frontend to Backend
After backend deploys, get the Fly.io URL:
```bash
flyctl status --app billets-api
# Copy the hostname (e.g., https://billets-api.fly.dev)
```

Add to Vercel:
```bash
vercel env add VITE_API_URL production
# Enter: https://billets-api.fly.dev
vercel --prod
```

### 6. Enable Auto-Deploy
Push to main branch triggers CI/CD:
```bash
git push origin main
```

## Local Development

### Frontend
```bash
npm install
npm run dev
# http://localhost:5173
```

### Backend
```bash
cd server
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your NVIDIA_API_KEY
python main.py
# http://127.0.0.1:8000
# Swagger: http://127.0.0.1:8000/docs
```

## Environment Variables

### Frontend (.env)
```env
VITE_API_URL=https://billets-api.fly.dev
```

### Backend (server/.env)
```env
NVIDIA_API_KEY=nvapi-xxxxxxxxxxxxx
```

## Services URLs (After Deploy)
- **Frontend**: https://billets.vercel.app
- **Backend API**: https://billets-api.fly.dev
- **Swagger Docs**: https://billets-api.fly.dev/docs

## Free Tier Limits
- **Fly.io**: 3 shared-cpu-1x VMs, 160GB-month, 3M requests/month
- **Vercel**: 100GB bandwidth, unlimited personal projects
- **GitHub Actions**: 2000 min/month free