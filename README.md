# <img src="https://github.com/angelol-git/ai-recipe-manager/tree/main/.github/logo.png?raw=true" width="32" /> AI Recipe Manager

AI-powered recipe management application with a clean, intuitive interface. Save recipes from URLs, organize them with custom tags, and interact with an AI assistant to discover new recipes.

## Features

- **Recipe Import**: Import recipes directly from URLs with automatic scraping and AI-enhanced parsing
- **Custom Tags**: Organize recipes with color-coded tags
- **AI Chat Assistant**: Discover new recipes and get cooking advice through natural conversation
- **Tag Management**: Create, edit, and filter recipes by custom tags
- **Recipe Editing**: Full-featured recipe editor with drag-and-drop ingredient and instruction reordering
- **Google Authentication**: Secure login via Google OAuth
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Tech Stack

### Frontend

- React 19
- Vite 7
- Tailwind CSS 4
- React Router 7
- TanStack Query 5
- @dnd-kit (drag and drop)
- Lucide React icons

### Backend

- Node.js with Express 5
- SQLite (better-sqlite3)
- Google GenAI API
- Cheerio (web scraping)
- Google OAuth 2.0
- Zod (validation)

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Google Cloud Console account (for OAuth and AI API)

### Installation

1. Clone the repository

```bash
git clone https://github.com/angelol-git/ai-recipe-manager.git
cd ai-recipe-manager
```

2. Install server dependencies

```bash
cd server
npm install
```

3. Install client dependencies

```bash
cd ../client
npm install
```

4. Set up environment variables

Create a `.env` file in the `server/` directory:

```env
NODE_ENV=development
PORT=8080
CLIENT_URL=http://localhost:5173
DATABASE_URL=./recipes.db
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GENAI_API_KEY=your_google_genai_api_key
```

To obtain these credentials:

- **Google OAuth**: [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Credentials
- **GenAI API**: [Google AI Studio](https://aistudio.google.com/app/apikey)

## Development

### Running the Server

```bash
cd server
npm run dev
```

The server will start on `http://localhost:8080` with auto-reload via nodemon.

### Running the Client

```bash
cd client
npm run dev
```

The client will start on `http://localhost:5173` with hot module replacement.

### Production

**Server:**

```bash
cd server
NODE_ENV=production npm start
```

**Client:**

```bash
cd client
npm run build
npm run preview
```

## Project Structure

```
ai-recipe-manager/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── context/        # React contexts
│   │   └── index.css       # Global styles & Tailwind config
│   └── index.html          # HTML entry point
├── server/                 # Node.js backend
│   ├── routes/             # API routes
│   ├── services/           # Business logic
│   ├── validation/         # Zod schemas
│   ├── utils/              # Utility functions
│   ├── server.js           # Express server entry
│   └── db.js               # Database setup
└── README.md
```

## API Routes

- `GET /api/auth/*` - Authentication (Google OAuth)
- `GET/POST /api/recipes` - Recipe CRUD operations
- `GET/POST /api/tags` - Tag management
- `POST /api/chat` - AI chat interactions

## Environment Variables

| Variable               | Description                          | Required |
| ---------------------- | ------------------------------------ | -------- |
| `NODE_ENV`             | Environment (development/production) | Yes      |
| `PORT`                 | Server port (default: 8080)          | No       |
| `CLIENT_URL`           | Frontend URL for CORS                | Yes      |
| `GOOGLE_CLIENT_ID`     | Google OAuth client ID               | Yes      |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret           | Yes      |
| `GENAI_API_KEY`        | Google GenAI API key                 | Yes      |
| `DATABASE_URL`         | SQLite database path                 | Yes      |
