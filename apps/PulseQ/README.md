# ⚡ PulseQ

PulseQ is a high-performance, asynchronous job-queuing API built with Node.js, TypeScript, Express, and Redis. It is designed to handle heavy, long-running tasks efficiently without blocking the main event loop.

By leveraging **BullMQ** for robust background job processing, built-in **caching**, and **rate limiting**, PulseQ ensures your API remains incredibly fast, secure, and scalable under heavy load.

## ✨ Features

- **🚀 Asynchronous Job Processing:** Offload heavy computational tasks to background workers using BullMQ.
- **🛡️ Rate Limiting:** Built-in fixed-window IP rate limiting (e.g., 10 requests / 60 seconds) to protect against spam and abuse.
- **🧠 Smart Caching:** Automatically hashes request payloads. If a duplicate request is received, the pre-computed result is served instantly from Redis.
- **📊 Metrics & Observability:** Real-time tracking of cache hits/misses, rate limit rejections, and job statuses.
- **🛠️ Fully Typed:** Written entirely in TypeScript for excellent developer experience and safety.

## 🏗️ Architecture Flow

1. **Request Received:** User sends a `POST /job` request with a JSON payload.
2. **Rate Limiter:** Checks if the user's IP has exceeded the allowed request limits.
3. **Cache Check:** Hashes the payload and checks Redis. If the result already exists, it is returned immediately.
4. **Queueing:** If not cached, the payload is pushed to a BullMQ queue, and the user immediately receives a `jobId` and a polling URL (`pollAt`).
5. **Background Worker:** A background worker picks up the job, processes it, saves the result to the cache, and updates the job status to `completed`.
6. **Polling:** The user polls `GET /job/:id` to retrieve their final result.

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- [Redis](https://redis.io/) (Must be running locally or via Docker)

### Installation

1. Clone the repository and navigate to the `api` directory:
   ```bash
   git clone https://github.com/Kushagra-Dobriyal/PulseQ.git
   cd PulseQ/api
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure Environment Variables:
   Create a `.env` file in the root of the `api` folder:
   ```env
   PORT=3000
   RATE_LIMIT_MAX=10
   RATE_LIMIT_WINDOW=60
   ```

4. Start the Development Server:
   ```bash
   npm run dev
   ```

---

## 📡 API Reference

### 1. Submit a Job
**Endpoint:** `POST /job`

Submits a new job to the queue. If the exact payload has been processed recently, it returns the cached result.

**Request Body:**
```json
{
  "priority": "high",
  "data": { "some": "heavy task data" }
}
```

**Response (Queued):** `202 Accepted`
```json
{
  "source": "queued",
  "jobId": "1",
  "pollAt": "/job/1"
}
```

**Response (Cached):** `200 OK`
```json
{
  "source": "cache",
  "result": { ... }
}
```

### 2. Poll Job Status
**Endpoint:** `GET /job/:id`

Check the status of a submitted job using the `jobId` returned from the POST request.

**Response (Pending):** `200 OK`
```json
{
  "status": "pending"
}
```

**Response (Completed):** `200 OK`
```json
{
  "status": "completed",
  "data": { ... }
}
```

### 3. View System Metrics
**Endpoint:** `GET /metrics`

Returns real-time analytics for the system's performance.

**Response:**
```json
{
  "cache_hits": 42,
  "cache_misses": 15,
  "rate_limited_requests": 3
}
```

### 4. Health Check
**Endpoint:** `GET /health`

**Response:**
```json
{
  "Health_Staus": "ok"
}
```

---

## 🧪 Testing

PulseQ comes with a built-in load testing script using `autocannon` to simulate high traffic and test the rate limiter and caching layer.

Ensure your server is running, then in a separate terminal run:
```bash
npm run loadtest
```
This will blast the `/job` endpoint with 100 concurrent connections for 10 seconds. Check the `/metrics` endpoint afterward to see the cache hit rate and rejected requests!

---

## 📜 Scripts

- `npm run dev`: Starts the server in watch mode using Nodemon.
- `npm run build`: Compiles the TypeScript code into the `dist/` folder.
- `npm run start`: Runs the compiled JavaScript code for production.
- `npm run loadtest`: Executes the autocannon load test script.
