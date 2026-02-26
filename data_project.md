# InSquare — Social Media Content Calendar Generator

## Project Overview

**InSquare** is a full-stack web application that enables users to generate AI-powered social media content calendars. Users input their brand strategy (brand name, industry, audience, goals, tone, themes), and the app generates a complete content calendar with scheduled posts across multiple social platforms — **LinkedIn**, **Twitter/X**, **Instagram**, and **Facebook**.

The application features user authentication, calendar management, history tracking, post editing/regeneration, hashtag generation, and multi-provider AI failover architecture.

---

## Tech Stack

| Layer        | Technology                                                                   |
| ------------ | ---------------------------------------------------------------------------- |
| **Frontend** | React 19, TailwindCSS 3, Radix UI (shadcn/ui), Framer Motion, React Router 7 |
| **Backend**  | Python 3, FastAPI, Uvicorn, Pydantic v2                                      |
| **Database** | Google Firestore (NoSQL)                                                     |
| **Auth**     | Firebase Authentication (Email/Password + Google OAuth)                      |
| **AI**       | Gemini, OpenAI, Grok (xAI), OpenRouter — Multi-provider failover            |
| **Build**    | CRACO (Create React App Configuration Override)                              |

---

## Project Structure

```
26_02_2026/
├── README.md
├── backend/
│   ├── .env                          # Environment variables (API keys, config)
│   ├── server.py                     # Main FastAPI application (817 lines)
│   ├── ai_gateway.py                 # Multi-provider AI failover module
│   ├── auth_middleware.py            # Firebase token verification middleware
│   ├── firebase_config.py           # Firebase Admin SDK initialization
│   ├── firestore_service.py         # Firestore CRUD operations
│   ├── tester_api.py                # API testing utility
│   ├── firebase-service-account.json # Firebase service account credentials
│   ├── requirements.txt             # Python dependencies (124 packages)
│   └── venv/                        # Python virtual environment
│
└── frontend/
    ├── .env                          # Frontend environment variables
    ├── package.json                  # Node dependencies & scripts
    ├── craco.config.js               # CRACO build configuration
    ├── tailwind.config.js            # Tailwind CSS configuration
    ├── postcss.config.js             # PostCSS configuration
    ├── public/                       # Static assets
    ├── build/                        # Production build output
    └── src/
        ├── App.js                    # Root component with routing
        ├── App.css                   # Global app styles
        ├── index.js                  # React entry point
        ├── index.css                 # Base CSS / Tailwind imports
        ├── firebase.js               # Firebase client SDK config
        ├── contexts/
        │   └── AuthContext.js        # Authentication state management
        ├── hooks/
        │   └── use-toast.js          # Toast notification hook
        ├── lib/
        │   ├── axiosConfig.js        # Axios instance with auth headers
        │   └── utils.js              # Utility functions (cn helper)
        ├── components/
        │   ├── Navbar.js             # Navigation bar
        │   ├── ProtectedRoute.js     # Route guard (redirects unauthenticated)
        │   └── ui/                   # 46 Radix UI (shadcn/ui) components
        └── pages/
            ├── Dashboard.js          # Main dashboard — strategy form & calendar grid
            ├── CalendarView.js       # Detailed view of a single calendar
            ├── HistoryPage.js        # Paginated calendar history
            ├── LoginPage.js          # Login form (email + Google)
            ├── RegisterPage.js       # Registration form
            └── ProfilePage.js        # User profile & stats
```

---

## Architecture Diagram

```
┌──────────────────────────────────────────────────────────────────────┐
│                          FRONTEND (React)                            │
│                                                                      │
│  LoginPage ─► AuthContext ─► ProtectedRoute ─► Dashboard             │
│                                                  │                   │
│                              CalendarView ◄──────┤                   │
│                              HistoryPage  ◄──────┤                   │
│                              ProfilePage  ◄──────┘                   │
│                                                                      │
│  Axios (axiosConfig.js) ── attaches Firebase ID Token to all reqs    │
└───────────────────────────────┬──────────────────────────────────────┘
                                │ HTTP (REST API)
                                ▼
┌──────────────────────────────────────────────────────────────────────┐
│                        BACKEND (FastAPI)                              │
│                                                                      │
│  auth_middleware.py ── Verifies Firebase ID Token on every request    │
│                                                                      │
│  server.py ─┬─ Auth Endpoints (/api/auth/*)                          │
│             ├─ Calendar Endpoints (/api/calendars/*)                  │
│             ├─ History Endpoint (/api/history)                        │
│             ├─ Post Modification Endpoints (/api/posts/*)             │
│             └─ Platform Config Endpoints (/api/content-types/*)      │
│                                                                      │
│  ai_gateway.py ── Multi-provider failover (Gemini → OpenAI → ...)    │
│  firestore_service.py ── All Firestore CRUD operations               │
└────────────────┬─────────────────────────┬───────────────────────────┘
                 │                         │
                 ▼                         ▼
┌────────────────────────┐   ┌─────────────────────────────────────────┐
│   AI Providers          │   │   Firebase / Firestore                   │
│                         │   │                                          │
│  ① Gemini (key rotation)│   │  users/{uid}                            │
│  ② OpenAI              │   │    ├── profile data                      │
│  ③ Grok (xAI)          │   │    └── calendars/{cal_id}                │
│  ④ OpenRouter          │   │         ├── strategy                     │
│                         │   │         ├── pillars[]                    │
│  Two-level failover:    │   │         └── posts[]                     │
│  L1: Gemini key rotation│   │                                          │
│  L2: Provider fallback  │   │  Firebase Auth (email/Google OAuth)      │
└────────────────────────┘   └─────────────────────────────────────────┘
```

---

## Backend — API Endpoints

### Auth Endpoints (`/api/auth/`)

| Method | Endpoint           | Description                                     |
| ------ | ------------------ | ----------------------------------------------- |
| POST   | `/api/auth/profile` | Create or update user profile on login          |
| GET    | `/api/auth/me`      | Get current user's full profile with usage stats |
| PATCH  | `/api/auth/me`      | Update profile fields (name, picture)           |

### Calendar Endpoints (`/api/calendars/`)

| Method | Endpoint                          | Description                                        |
| ------ | --------------------------------- | -------------------------------------------------- |
| POST   | `/api/calendars/`                 | Generate a new content calendar from strategy input |
| GET    | `/api/calendars/`                 | Get all calendars for authenticated user            |
| GET    | `/api/calendars/{calendar_id}`    | Get a specific calendar                            |
| DELETE | `/api/calendars/{calendar_id}`    | Delete a calendar                                  |
| POST   | `/api/calendars/{id}/favorite`    | Toggle favorite status                             |

### History Endpoint

| Method | Endpoint        | Description                                              |
| ------ | --------------- | -------------------------------------------------------- |
| GET    | `/api/history`  | Paginated history with sorting (newest/oldest/most_posts) and filtering (all/favorites) |

### Post Modification Endpoints

| Method | Endpoint                     | Description                                         |
| ------ | ---------------------------- | --------------------------------------------------- |
| POST   | `/api/posts/regenerate`      | Regenerate a single post's content using AI         |
| POST   | `/api/posts/update-type`     | Change a post's content type                        |
| PUT    | `/api/posts/update-content`  | Update post content (inline editing)                |
| PUT    | `/api/posts/update-status`   | Update post status (draft/scheduled/published)      |
| POST   | `/api/posts/hashtags`        | Generate hashtags, CTA, and emoji suggestions via AI |

### Platform Configuration Endpoints

| Method | Endpoint                        | Description                          |
| ------ | ------------------------------- | ------------------------------------ |
| GET    | `/api/content-types/{platform}` | Get available content types          |
| GET    | `/api/platform-limits`          | Get character limits per platform    |
| GET    | `/api/content-lengths`          | Get content length presets           |

---

## Data Models

### StrategyInput
The primary input for generating a content calendar:
- `brand_name` — Name of the brand
- `industry` — Business industry
- `target_audience` — Who the content targets
- `goals` — List of goals (e.g., "engagement", "awareness")
- `tone` — Voice/tone (e.g., "professional", "casual")
- `content_themes` — List of content themes
- `preferred_content_types` — Dict of platform → content type preferences
- `content_length` — Short / Medium / Long
- `generation_mode` — "all" platforms or a single `selected_platform`
- `duration_days` — Number of days to generate (1–30)

### SocialPost
Each individual generated post:
- `id` — UUID
- `platform` — LinkedIn / Twitter / Instagram / Facebook
- `content` — Post text
- `pillar` — Which content pillar it belongs to
- `date` — Scheduled date
- `status` — draft / scheduled / published
- `content_type` — Type of content (tweet, article, reel, etc.)

### GeneratedCalendar
A complete generated calendar:
- `id` — UUID
- `strategy` — The input strategy
- `pillars` — List of content pillars with descriptions
- `posts` — List of SocialPost objects
- `created_at` — Timestamp
- `is_favorite` — Boolean

---

## Key Features

### 1. AI Content Generation
- Generates platform-specific social media posts using AI
- Supports 4 platforms: LinkedIn, Twitter/X, Instagram, Facebook
- Multiple content types per platform (tweet, thread, carousel, reel, article, etc.)
- Configurable content length (short/medium/long) with character limits
- Content pillars auto-generated based on brand strategy

### 2. Multi-Provider AI Failover
- **Level 1**: Gemini API key rotation (multiple keys, shuffled per request)
- **Level 2**: Provider fallback chain (Gemini → OpenAI → Grok → OpenRouter)
- Configurable provider order via `AI_PROVIDERS` environment variable
- 30-second timeout per provider request

### 3. User Authentication
- Firebase Authentication with Email/Password and Google OAuth
- JWT token verification on every API request
- Auto-profile creation on first login
- Protected routes on the frontend

### 4. Calendar Management
- Create, view, delete, and favorite calendars
- Toggle post status (draft → scheduled → published)
- Inline content editing
- Single post regeneration via AI
- Content type switching per post
- AI-generated hashtags, CTAs, and emoji suggestions

### 5. History & Analytics
- Paginated calendar history
- Sorting: newest, oldest, most posts
- Filtering: all or favorites only
- User profile stats: total calendars, total posts, favorites count

### 6. Export Capabilities
- PDF export (via jsPDF + jspdf-autotable)
- Excel export (via xlsx library)

---

## Firestore Database Schema

```
Firestore Root
└── users (collection)
    └── {uid} (document)
        ├── email: string
        ├── name: string
        ├── picture: string
        ├── joined_at: ISO timestamp
        ├── last_login: ISO timestamp
        ├── total_calendars: number
        ├── total_posts: number
        ├── favorites_count: number
        └── calendars (subcollection)
            └── {calendar_id} (document)
                ├── id: string
                ├── owner_uid: string
                ├── is_favorite: boolean
                ├── created_at: ISO timestamp
                ├── strategy: { brand_name, industry, ... }
                ├── pillars: [ { title, description, platforms } ]
                └── posts: [ { id, platform, content, pillar, date, status, content_type } ]
```

---

## Supported Platforms & Content Types

| Platform      | Content Types                            |
| ------------- | ---------------------------------------- |
| **LinkedIn**  | text_post, article, carousel, video, poll |
| **Twitter/X** | tweet, thread, poll                      |
| **Instagram** | post, reel, carousel, story              |
| **Facebook**  | post, video, event, poll                 |

---

## How to Run

### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt
uvicorn server:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run start
```

### Environment Variables

**Backend (`.env`)**:
- `GEMINI_API_KEYS` — Comma-separated Gemini API keys
- `OPENAI_API_KEY` — OpenAI API key
- `GROK_API_KEY` — Grok (xAI) API key
- `OPENROUTER_API_KEY` — OpenRouter API key
- `AI_PROVIDERS` — Provider priority order (default: `gemini,openai,openrouter,grok`)
- `CORS_ORIGINS` — Allowed CORS origins
- `FIREBASE_SERVICE_ACCOUNT_PATH` — Path to Firebase credentials

**Frontend (`.env`)**:
- Firebase client configuration (API key, auth domain, project ID, etc.)
- `REACT_APP_API_URL` — Backend API base URL

---

## Dependencies Summary

| Category       | Key Packages                                                      |
| -------------- | ----------------------------------------------------------------- |
| **Backend**    | FastAPI, Uvicorn, Pydantic, firebase-admin, google-generativeai, openai, litellm |
| **Frontend**   | React 19, react-router-dom, axios, framer-motion, firebase, recharts, lucide-react |
| **UI Library** | Radix UI (46 components), TailwindCSS, class-variance-authority   |
| **Export**      | jsPDF, jspdf-autotable, xlsx                                     |
| **Forms**      | react-hook-form, zod (validation)                                |
