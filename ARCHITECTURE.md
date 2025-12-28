# System Architecture

## Overview

The Universal AI Study & Preparation Automation Platform is a **prompt-driven, domain-agnostic** system that transforms raw learning materials into structured study outputs.

## Core Principles

1. **No Hardcoded Logic**: All transformation logic is driven by user-defined prompts
2. **Domain Agnostic**: Works for any exam, interview, or learning scenario
3. **Extensible**: Easy to add new output formats, LLM providers, and destinations
4. **Production Ready**: Built with scalability and reliability in mind

## Architecture Layers

### 1. Input Layer
- **File Ingestion Service**: Handles PDF, URL, and text uploads
- **Content Extraction Service**: Extracts text from various sources
- **Validation**: Ensures input quality and format

### 2. Preprocessing Layer
- **Chunking Service**: Intelligently chunks content with metadata preservation
- **Token Management**: Ensures LLM token limits are respected
- **Context Preservation**: Maintains page numbers, chapters, sections

### 3. Intelligence Layer
- **Prompt Management Service**: Manages reusable, versioned prompts
- **Context Blueprint Service**: Handles exam patterns, rubrics, and custom contexts
- **Prompt Builder**: Dynamically injects context into prompts

### 4. LLM Orchestration Layer
- **LLM Execution Service**: Processes chunks and synthesizes outputs
- **Multi-Chunk Processing**: Handles large documents efficiently
- **Synthesis**: Combines partial outputs into coherent final output

### 5. Output Normalization Layer
- **Output Normalization Service**: Converts LLM output to structured format
- **Notion Block Mapping**: Transforms markdown-like content to Notion blocks
- **Format Support**: Headings, lists, toggles, callouts, tables

### 6. Publishing Layer
- **Notion Publishing Service**: Automatically publishes to Notion
- **Page Hierarchy**: Creates parent and child pages
- **Block Management**: Handles complex Notion block structures

## Data Flow

```
User Input (PDF/URL/Text)
    ↓
File Ingestion Service
    ↓
Content Extraction Service
    ↓
Chunking Service
    ↓
[Job Queue: Document Extraction]
    ↓
[Job Queue: Content Chunking]
    ↓
[Job Queue: LLM Generation]
    ↓
Output Normalization Service
    ↓
[Job Queue: Notion Publishing]
    ↓
Notion Database
```

## Job Queue Architecture

The system uses **BullMQ** with **Redis** for async job processing:

1. **Document Extraction Queue**: Extracts text from uploaded files/URLs
2. **Content Chunking Queue**: Chunks extracted text intelligently
3. **LLM Generation Queue**: Processes chunks with AI and generates output
4. **Notion Publishing Queue**: Publishes structured output to Notion

Each queue has dedicated workers that process jobs asynchronously.

## Database Schema

### Core Entities

- **User**: Platform users
- **Project**: Container for a transformation job
- **Document**: Input documents (PDF, URL, text)
- **ContentChunk**: Chunked pieces of extracted content
- **Prompt**: Reusable, versioned prompts
- **ContextBlueprint**: Exam patterns, rubrics, custom contexts
- **GeneratedOutput**: Final transformed output
- **JobStatus**: Tracking for async jobs

## API Design

### RESTful Endpoints

- `POST /api/projects` - Create new project
- `GET /api/projects` - List user's projects
- `GET /api/projects/:id` - Get project details
- `POST /api/prompts` - Create prompt
- `GET /api/prompts` - List prompts
- `POST /api/blueprints` - Create blueprint
- `GET /api/blueprints` - List blueprints

## Frontend Architecture

### State Management
- **React Query**: Server state and caching
- **Zustand**: Global client state (if needed)
- **React Hook Form**: Form state management

### Component Structure
- **Pages**: Route-level components
- **Components**: Reusable UI components
- **UI Components**: shadcn/ui based components

## Security Considerations

1. **Authentication**: JWT-based (to be implemented)
2. **Authorization**: User-scoped resources
3. **File Upload**: Size limits and type validation
4. **API Rate Limiting**: Prevent abuse
5. **Input Validation**: Zod schemas for all inputs

## Scalability

1. **Horizontal Scaling**: Stateless API servers
2. **Job Queue**: Distributed workers
3. **Database**: PostgreSQL with proper indexing
4. **Caching**: Redis for job queue and potential caching
5. **CDN**: For static assets (future)

## Extensibility Points

1. **LLM Providers**: Easy to swap OpenAI for other providers
2. **Output Formats**: Add new normalization formats
3. **Destinations**: Add publishing to other platforms (Google Docs, etc.)
4. **Chunking Strategies**: Different chunking algorithms
5. **Prompt Templates**: Pre-built prompt templates for common use cases

## Monitoring & Observability

1. **Logging**: Structured logging with Pino
2. **Error Tracking**: Centralized error handling
3. **Job Monitoring**: BullMQ dashboard (future)
4. **Metrics**: Performance metrics (future)

## Future Enhancements

1. **RAG Integration**: Vector database for semantic search
2. **Multi-LLM Support**: Anthropic, Cohere, etc.
3. **Real-time Updates**: WebSocket for job progress
4. **Collaboration**: Share projects and prompts
5. **Analytics**: Usage analytics and insights
6. **Templates**: Pre-built prompt and blueprint templates

