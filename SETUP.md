# Setup Guide

## Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Redis (for job queue)
- OpenAI API key
- Notion API key and database ID

## Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

4. Configure your `.env` file:
```env
PORT=3001
NODE_ENV=development
DATABASE_URL="postgresql://user:password@localhost:5432/ai_study_platform?schema=public"
REDIS_HOST=localhost
REDIS_PORT=6379
OPENAI_API_KEY=your_openai_api_key
NOTION_API_KEY=your_notion_api_key
NOTION_DATABASE_ID=your_notion_database_id
```

5. Set up database:
```bash
npx prisma generate
npx prisma migrate dev
```

6. Start Redis (if not running):
```bash
redis-server
```

7. Start the backend:
```bash
npm run dev
```

## Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```env
VITE_API_URL=http://localhost:3001/api
```

4. Start the frontend:
```bash
npm run dev
```

## Notion Setup

1. Go to https://www.notion.so/my-integrations
2. Create a new integration
3. Copy the API key to your backend `.env` file
4. Create a database in Notion
5. Share the database with your integration
6. Copy the database ID (from the URL) to your backend `.env` file

## Running the Application

1. Start Redis
2. Start the backend server (port 3001)
3. Start the frontend server (port 3000)
4. Open http://localhost:3000 in your browser

## Project Structure

```
ai-study-platform/
├── backend/
│   ├── src/
│   │   ├── config/          # Database, Redis, Logger config
│   │   ├── services/         # Core business logic services
│   │   ├── routes/           # API routes
│   │   ├── workers/          # Job queue workers
│   │   ├── middleware/       # Express middleware
│   │   └── types/            # TypeScript types
│   └── prisma/               # Database schema
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/           # Page components
│   │   ├── lib/             # Utilities and API client
│   │   └── types/           # TypeScript types
│   └── public/
└── shared/                   # Shared types (future)
```

## Key Features

- **Document Upload**: Support for PDF, URL, and text input
- **Content Extraction**: Automatic text extraction from various sources
- **Intelligent Chunking**: Smart content chunking with metadata preservation
- **Prompt Management**: Reusable, versioned prompts
- **Context Blueprints**: Exam patterns, rubrics, and custom contexts
- **LLM Processing**: AI-powered content transformation
- **Notion Integration**: Automatic publishing to Notion
- **Job Queue**: Async processing with BullMQ and Redis

## Next Steps

1. Implement authentication (JWT or OAuth)
2. Add more LLM providers (Anthropic, etc.)
3. Implement RAG (Retrieval Augmented Generation)
4. Add more output formats
5. Implement user management and sharing
6. Add analytics and monitoring

