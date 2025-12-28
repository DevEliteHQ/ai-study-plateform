# Universal AI Study & Preparation Automation Platform

A generic, scalable, AI-powered automation platform that converts raw learning material (PDFs, websites, documents) into structured, goal-oriented study outputs, automatically published into Notion.

## 🎯 Core Concept

This system is **prompt-driven** and **domain-agnostic**. It operates on four configurable inputs:

1. **Primary Content** - PDFs, URLs, or text
2. **User Prompt** - Defines transformation requirements
3. **Contextual Blueprint** - Exam syllabus, patterns, rubrics (optional)
4. **Output Target** - Notion (mandatory)

## 🏗️ Architecture

```
ai-study-platform/
├── backend/          # Node.js + Express + TypeScript + PostgreSQL
├── frontend/         # React + TypeScript + Vite + Tailwind + shadcn/ui
└── shared/           # Shared types and utilities
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Redis (for job queue)
- Notion API token

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Configure your .env file
npx prisma migrate dev
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
# Configure your .env file
npm run dev
```

## 📦 Tech Stack

### Frontend
- React 18 + TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- React Query
- Zustand
- Zod

### Backend
- Node.js + Express
- TypeScript
- PostgreSQL + Prisma
- BullMQ + Redis
- OpenAI API (or other LLM providers)
- Notion API

## 🧩 Core Services

1. **File Ingestion Service** - Handles PDF/URL/text uploads
2. **Content Extraction Service** - Extracts text from various sources
3. **Chunking Service** - Intelligently chunks content with metadata
4. **Prompt Management Service** - Manages reusable, versioned prompts
5. **Context Blueprint Service** - Handles exam patterns and rubrics
6. **LLM Execution Service** - Orchestrates AI transformations
7. **Output Normalization Service** - Converts LLM output to structured format
8. **Notion Publishing Service** - Publishes to Notion automatically

## 📝 License

MIT

