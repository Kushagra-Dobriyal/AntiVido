# ⚡ PulseQ — AI Video Learning & Knowledge Engine

<p align="center">
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Next.js%2015+-black?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/Express.js-404D59?style=for-the-badge" alt="Express" />
  <img src="https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white" alt="Redis" />
  <img src="https://img.shields.io/badge/BullMQ-E34F26?style=for-the-badge" alt="BullMQ" />
  <img src="https://img.shields.io/badge/ChromaDB-Vector_DB-FF6F61?style=for-the-badge" alt="ChromaDB" />
  <img src="https://img.shields.io/badge/Google_Gemini-4285F4?style=for-the-badge&logo=google&logoColor=white" alt="Gemini" />
  <img src="https://img.shields.io/badge/Turborepo-EF4444?style=for-the-badge&logo=turborepo&logoColor=white" alt="Turborepo" />
</p>

> **Transform long-form YouTube tutorials into interactive, high-retention learning hubs.**  
> Powered by an asynchronous event-driven architecture, distributed job workers, local vector search (RAG), and generative AI workflows.

---

## 🌟 Overview

**PulseQ** is an enterprise-grade AI video analysis platform built inside a high-performance **Turborepo monorepo**. Users submit a YouTube URL, and within seconds receive:
1. 🧠 **Interactive Mind Maps:** Visual knowledge graphs rendered using `@xyflow/react` and `dagre`.
2. 📝 **Comprehensive Summaries:** Structured breakdowns of key concepts, code snippets, and timestamps.
3. 🎯 **Dynamic Adaptive Assessments:** Categorized based on video type:
   - **Coding Videos:** Interactive LeetCode-style problem descriptions, starter boilerplate, constraints, test cases, and related platform links.
   - **Conceptual / General Videos:** Diagnostic multiple-choice quizzes with explanations.
4. 💬 **Retrieval-Augmented Generation (RAG) Chat:** Chat directly with the video transcript powered by **ChromaDB** with zero hallucinations.

---

## 🏗️ System Architecture

PulseQ decouples heavy AI computation from the web API using an **Asynchronous Producer-Consumer Pattern** with BullMQ and Redis. HTTP requests return immediately (`<50ms`), while real-time progress is streamed to the user via **Server-Sent Events (SSE)**.

```mermaid
flowchart TB
    subgraph ClientLayer ["Client Layer (Next.js 15)"]
        UI["🖥️ Web Client / Dashboard"]
        GraphUI["🕸️ XYFlow Mind Map"]
        SSEListener["📡 SSE Progress Listener"]
    end

    subgraph APILayer ["API Layer (Express Producer)"]
        API["Express Router (/job)"]
        RateLimiter["🛡️ Fixed-Window Rate Limiter"]
        CacheCheck["⚡ Redis Result Cache"]
        SSEEndpoint["📡 SSE Stream (/job/:id/progress)"]
    end

    subgraph QueueLayer ["State & Message Broker (Redis)"]
        BullQueue[("📥 BullMQ 'jobs' Queue<br/>ZSETs + Hashes")]
        RedisCache[("🗄️ Redis Result Store<br/>TTL: 1hr")]
        RedisEvents[("📢 Redis Stream Events")]
    end

    subgraph WorkerLayer ["Distributed Worker Pool"]
        Worker["⚙️ Background Worker (Concurrency: 5)"]
        TranscriptSvc["📜 YouTube Transcript Fetcher"]
        Classifier["🏷️ Video Classifier (Coding vs General)"]
        FanOut["⚡ Parallel Promise.all Fan-Out"]
    end

    subgraph AIEngine ["AI & Storage Engines"]
        GeminiPool["🤖 Task-Specific Gemini Key Pools<br/>(Summary, MindMap, Assessments, Related)"]
        ChromaStore[("🧠 ChromaDB Vector Store<br/>(HNSW Cosine Indexing)")]
        MongoDB[("🍃 MongoDB<br/>(User History & Submissions)")]
    end

    %% Flow Connections
    UI -->|1. POST /job { url }| API
    API --> RateLimiter
    RateLimiter --> CacheCheck
    CacheCheck -- Cache Hit --> UI
    CacheCheck -- Cache Miss -->|2. jobQueue.add()| BullQueue
    API -->|3. 202 Accepted { jobId }| UI

    UI -->|4. Connect SSE| SSEEndpoint
    BullQueue -->|5. Atomically Pop Job (Lua)| Worker
    
    Worker --> TranscriptSvc
    TranscriptSvc --> Classifier
    Classifier --> FanOut

    FanOut -->|Task 1: Summary| GeminiPool
    FanOut -->|Task 2: Mind Map JSON| GeminiPool
    FanOut -->|Task 3: Assessments/LeetCode| GeminiPool
    FanOut -->|Task 4: Related Problems| GeminiPool
    FanOut -->|Task 5: Chunk & Embed| ChromaStore

    Worker -.->|6. Emit Incremental Progress (48%→80%)| SSEEndpoint
    SSEEndpoint -.->|7. Real-Time Updates| SSEListener

    Worker -->|8. Store Completed Result| RedisCache
    Worker -->|9. Save History Record| MongoDB
    Worker -.->|10. 100% Progress Done| SSEEndpoint
```

---

## ⚡ Core Engineering Highlights

### 1. Non-Blocking Ingestion & Granular SSE Progress
- **Fast Response:** When a user submits a URL, the API responds in `<50ms` with `202 Accepted` and a `jobId`.
- **Granular Progress Tracker:** Instead of freezing at 40% while waiting for multiple Gemini calls, the worker registers each sub-task in `Promise.all` independently (`recordTaskDone()`), firing incremental progress updates (`48%` $\to$ `56%` $\to$ `65%` $\to$ `72%` $\to$ `80%`) over SSE.

### 2. Multi-Key Gemini Rate Limit Resiliency
- Rather than sharing a single API key across all generation tasks, PulseQ implements **task-specific key pools** (`GEMINI_KEY_MINDMAP`, `GEMINI_KEY_SUMMARY`, `GEMINI_KEY_ASSESSMENTS`, `GEMINI_KEY_RELATED`).
- Each pool independently tracks its rotation index. If any key hits a `429 RESOURCE_EXHAUSTED`, the service automatically rotates to the next available key and retries before falling back.

### 3. Local RAG with ChromaDB & Video Isolation
- Transcripts are split into overlapping 1,500-character chunks.
- Indexed into **ChromaDB** using **Cosine Distance** on an **HNSW (Hierarchical Navigable Small World)** vector graph.
- Every vector carries metadata (`{ jobId, url }`). User queries are strictly filtered by `where: { jobId }`, ensuring mathematical isolation between different videos.

### 4. BullMQ & Redis Under the Hood
- **Atomic State Transitions:** Uses Redis **Lua scripts (`EVALSHA`)** to transition jobs between states (`wait` $\to$ `active` $\to$ `completed`), preventing race conditions across distributed workers.
- **Worker Concurrency:** Configured with `concurrency: 5`, allowing single Node.js worker processes to interleave I/O-bound AI requests efficiently.
- **Memory Hygiene:** Uses `removeOnComplete: { count: 100 }` and `removeOnFail: { count: 50 }` alongside TTL-based cache expirations to prevent Redis RAM leaks.

---

## 📂 Monorepo Structure

```text
APP/
├── apps/
│   ├── web/                     # Next.js 15 App Router Frontend
│   │   ├── app/                 # Routes, pages, dashboard, RAG chat UI
│   │   ├── components/          # XYFlow Mind Map, Quiz Cards, Code Viewer
│   │   └── lib/                 # Client utilities & SSE hooks
│   │
│   └── PulseQ/                  # Express & BullMQ Backend Service
│       ├── src/
│       │   ├── config/          # Redis, ChromaDB, Queue & Gemini connections
│       │   ├── routes/          # Express route controllers (/job, /rag, /history)
│       │   ├── services/        # RAG service, caching, rate limiting, progress emitter
│       │   └── workers/         # BullMQ background job consumer (job.worker.ts)
│       └── package.json
│
├── packages/
│   ├── ui/                      # Shared React design system (shadcn / Radix)
│   ├── eslint-config/           # Shared ESLint configuration
│   └── typescript-config/       # Shared strict tsconfig bases
│
├── interview_prep/              # Comprehensive technical architecture & interview guides
├── pnpm-workspace.yaml          # Monorepo workspace configuration
├── turbo.json                   # Turborepo task pipeline & build caching
└── package.json                 # Root dependencies and scripts
```

---

## 🛠️ Tech Stack

| Domain | Technology | Purpose |
| :--- | :--- | :--- |
| **Monorepo** | [Turborepo](https://turbo.build/) + [pnpm](https://pnpm.io/) | Workspaces, task pipelining, and fast local caching |
| **Frontend** | [Next.js 15](https://nextjs.org/) (React 19) | Modern App Router, Server Components & Client Dashboards |
| **Interactive Graph** | [@xyflow/react](https://reactflow.dev/) + [Dagre](https://github.com/dagrejs/dagre) | Directed acyclic graph layout for AI mind maps |
| **Backend API** | [Express.js](https://expressjs.com/) (TypeScript) | REST endpoints, authentication middleware & SSE streams |
| **Queue & Broker**| [BullMQ](https://docs.bullmq.io/) + [Redis](https://redis.io/) | Distributed job queue, backpressure buffering & atomic locking |
| **Vector DB (RAG)**| [ChromaDB](https://www.trychroma.com/) | HNSW vector indexing & semantic similarity search |
| **AI LLMs** | [Google Gemini 2.5 Flash](https://deepmind.google/technologies/gemini/) | Fast summarization, JSON classification & assessment generation |
| **Database** | [MongoDB](https://www.mongodb.com/) (Mongoose) | User records, video history, and assessment performance logs |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) + [Framer Motion](https://www.framer.com/motion/) | Slick glassmorphic UI & micro-interactions |

---

## 🚀 Getting Started

### 1. Prerequisites
Ensure you have the following installed:
- **Node.js**: v18.18+ or v20+
- **pnpm**: `npm install -g pnpm`
- **Redis**: Running locally (`localhost:6379`) or via Docker
- **ChromaDB**: Running locally (`localhost:8000`) or via Docker
- **MongoDB**: Running locally (`localhost:27017`) or a MongoDB Atlas URI

> **Tip:** Start Redis and ChromaDB instantly using Docker:
> ```bash
> # Run Redis
> docker run -d -p 6379:6379 --name redis-pulseq redis:7-alpine
> 
> # Run ChromaDB
> docker run -d -p 8000:8000 --name chroma-pulseq chromadb/chroma:latest
> ```

---

### 2. Clone & Install Dependencies
```bash
git clone https://github.com/Kushagra-Dobriyal/PulseQ.git
cd PulseQ
pnpm install
```

---

### 3. Environment Variables Configuration

Create a `.env` file in `apps/PulseQ/.env`:

```env
PORT=4000
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
CHROMA_URL=http://localhost:8000
MONGO_URI=mongodb://localhost:27017/antivido
JWT_SECRET=your_super_secret_jwt_key

RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW=60

# Dedicated Gemini API Key Pools (Comma-separated for auto-rotation)
GEMINI_KEY_CLASSIFY=your_gemini_api_key_here
GEMINI_KEY_SUMMARY=your_gemini_api_key_here
GEMINI_KEY_MINDMAP=your_gemini_api_key_here
GEMINI_KEY_ASSESSMENTS=your_gemini_api_key_here
GEMINI_KEY_RELATED=your_gemini_api_key_here
```

---

### 4. Run Development Servers

Run the entire monorepo (Frontend + API + Worker) in parallel:
```bash
pnpm dev
```

* **Frontend:** [`http://localhost:3000`](http://localhost:3000)
* **Backend API:** [`http://localhost:4000`](http://localhost:4000)
* **ChromaDB:** [`http://localhost:8000`](http://localhost:8000)

---

## 📡 API Reference

### `POST /job`
Enqueues a YouTube video for background processing.
* **Payload:** `{ "url": "https://www.youtube.com/watch?v=..." }`
* **Response:** `202 Accepted`
  ```json
  {
    "source": "queued",
    "jobId": "12",
    "pollAt": "/job/12"
  }
  ```

### `GET /job/:id/progress`
Connects to the **Server-Sent Events (SSE)** stream for real-time progress updates.
* **Event Stream Format:**
  ```text
  data: {"progress": 5, "status": "fetching transcript"}
  data: {"progress": 30, "status": "classifying video"}
  data: {"progress": 48, "status": "completed mind map"}
  data: {"progress": 80, "status": "generating content"}
  data: {"progress": 100, "status": "completed", "result": { ... }}
  ```

### `GET /job/:id`
Polls the final cached output from Redis once processing finishes.

### `POST /rag/ask`
Ask a semantic question about a processed video.
* **Payload:** `{ "jobId": "12", "question": "How does the event loop work in this video?" }`
* **Response:**
  ```json
  {
    "answer": "According to the video, the event loop continuously checks the call stack..."
  }
  ```

---

## 📚 Technical Deep Dives & Interview Documentation

Looking for detailed architectural explanations, failure modes, or interview walkthroughs? Check out the **[`interview_prep/`](./interview_prep/README.md)** directory:
* [5-Minute PulseQ System Pitch](./interview_prep/interview_pitch_pulseq.md)
* [BullMQ & Redis Architecture Deep Dive](./interview_prep/interview_bullmq_and_redis.md)
* [ChromaDB & RAG Pipeline Deep Dive](./interview_prep/interview_rag_deep_dive.md)
* [Event-Driven Architecture & SSE Streaming](./interview_prep/interview_event_driven_and_async.md)
* [Technical Cheat Sheet & Rapid-Fire Q&As](./interview_prep/interview_cheat_sheet.md)

---

## 🤝 Contributing & License

Pull requests and feature suggestions are welcome! Distributed under the **MIT License**.
