<div align="center">

<br />

     ```
      █▀█ █▀█ █▀█ ▄▀█ █   █   █▀▀ █   █▀█ █▀▀ █▀█ ▄▀█ █▀▄ █▀▄ █ █ █ █▀▀
      █▀▀ █▀█ █▀▄ █▀█ █▄▄ █▄▄ ██▄ █▄▄ █▄█ █▄█ █▀▄ █▀█ █▄▀ █▄▀ █ ▀▄▀ ██▄
      ```

### **The Geometry of Infinite Storage**

*Upload once. Shard. Encrypt. Distribute. Retrieve instantly.*

<br />

[![License: MIT](https://img.shields.io/badge/License-MIT-00D9FF.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3B82F6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma)](https://prisma.io/)
[![Clerk](https://img.shields.io/badge/Clerk-Auth-6C47FF?style=for-the-badge)](https://clerk.dev/)

<br />

</div>

---

## What is ParallelogramDrive?

**ParallelogramDrive** is a developer-first distributed storage infrastructure built on top of Telegram's global datacenter network. Instead of paying for S3 or Google Cloud Storage, your files are **AES-GCM-256 encrypted**, **geo-sharded across nodes**, and **served through a developer-grade REST API** — for free, at scale.

> Think Cloudflare R2 × Telegram's infrastructure × developer tooling you'll actually enjoy.

---

## Core Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      CLIENT REQUEST                         │
└──────────────────────────┬──────────────────────────────────┘
                           │
                    ┌──────▼──────┐
                    │  Next.js    │
                    │  App Router │
                    │  /api/v1/*  │
                    └──────┬──────┘
                           │
          ┌────────────────┼────────────────┐
          │                │                │
   ┌──────▼──────┐  ┌──────▼──────┐  ┌──────▼──────┐
   │   AES-GCM   │  │   Prisma    │  │  Clerk Auth  │
   │  Encryption │  │  PostgreSQL │  │   Sessions   │
   └──────┬──────┘  └─────────────┘  └─────────────┘
          │
   ┌──────▼──────────────────────────────────────────┐
   │              TELEGRAM NODE GRID                  │
   │                                                  │
   │  US-East  EU-West  AP-South  SA-East  AP-SE      │
   │    ●──────────●──────────●──────────●──────●     │
   │    │          │          │          │      │     │
   │    └──────────┴──────────┴──────────┴──────┘     │
   │               Shard mesh (34 nodes)               │
   └──────────────────────────────────────────────────┘
```

---

## Features

| Capability | Details |
|---|---|
| 🔐 **Zero-Knowledge Encryption** | AES-GCM-256 applied locally. Server never sees plaintext |
| ⚡ **Parallel Geo-Sharding** | Files split across 6+ nodes simultaneously |
| 🌍 **34 Global Node Clusters** | Sub-15ms average retrieval latency |
| 🔌 **REST API + SDK** | Every action programmatic. CI/CD and CLI ready |
| 📡 **Telegram Backbone** | Leverages Telegram's multi-datacenter CDN infrastructure |
| 🎥 **Native Media Streaming** | HTTP Range requests for video/audio seeking |
| 🔑 **API Key Management** | Scoped production/dev/readonly keys |
| 📊 **Live Dashboard** | Real-time telemetry, node health, bandwidth metrics |
| 🔗 **Public Share Links** | Per-file toggle with instant CDN URLs |
| 🛡️ **Clerk Authentication** | Org-ready auth with social login |

---

## API Reference

### Upload a file

```bash
# Windows (PowerShell) — use curl.exe, not curl
curl.exe -X POST https://parallelogramdrive.com/api/upload `
  -H "Authorization: Bearer pd_live_••••••••••••" `
  -F "file=@dataset.tar.gz"

# Linux / macOS / WSL
curl -X POST https://parallelogramdrive.com/api/upload \
  -H "Authorization: Bearer pd_live_••••••••••••" \
  -F "file=@dataset.tar.gz"
```

**Response:**
```json
{
  "id": "cm_abc123xyz",
  "fileName": "dataset.tar.gz",
  "size": 104857600,
  "mimeType": "application/gzip",
  "isPublic": false,
  "downloadUrl": "https://parallelogramdrive.com/api/files/cm_abc123xyz/download",
  "createdAt": "2025-05-23T11:20:00.000Z"
}
```

### Download a file

```bash
curl.exe -L https://parallelogramdrive.com/api/files/{id}/download `
  -H "Authorization: Bearer pd_live_••••••••••••" `
  -o output.tar.gz
```

### List files

```bash
curl.exe https://parallelogramdrive.com/api/files `
  -H "Authorization: Bearer pd_live_••••••••••••"
```

### Delete a file

```bash
curl.exe -X DELETE https://parallelogramdrive.com/api/files/{id} `
  -H "Authorization: Bearer pd_live_••••••••••••"
```

---

## SDK Usage

### JavaScript / TypeScript

```typescript
import { PDClient } from "@parallelogram/sdk";

const pd = new PDClient({ apiKey: process.env.PD_API_KEY });

// Shard, encrypt & distribute in one call
const file = await pd.upload("./dataset.tar.gz", {
  redundancy: "geo-replicated",
  encrypt: true,
});

console.log(`Distributed across 6 nodes: ${file.id}`);

// Retrieve
const stream = await pd.download(file.id);
```

### Python

```python
from parallelogram import PDClient

pd = PDClient(api_key="pd_live_••••••••••••")

file = pd.upload(
    path="./dataset.tar.gz",
    geo_redundancy=True,
    encrypt=True,
)

print(f"Shards synced across 6 nodes: {file.id}")
```

### Go

```go
import pd "github.com/parallelogram/sdk-go"

client := pd.NewClient("pd_live_••••••••••••")
file, _ := client.Upload(context.Background(),
  "./dataset.tar.gz",
  pd.WithGeoRedundancy(),
)
println("File ID:", file.ID)
```

---

## Getting Started

### Prerequisites

- Node.js >= 20.x
- PostgreSQL database (Supabase, Neon, Railway, etc.)
- Telegram Bot Token + Chat ID (free)
- Clerk account (free tier works)

### 1. Clone

```bash
git clone https://github.com/techxsarwar/ParallelogramDrive.git
cd ParallelogramDrive
```

### 2. Install

```bash
npm install
```

### 3. Environment Variables

Create `.env.local`:

```env
# Clerk Auth
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_••••••••••••
CLERK_SECRET_KEY=sk_live_••••••••••••

# Telegram Storage Backend
TELEGRAM_BOT_TOKEN=••••••••••:••••••••••••••••••••••••••
TELEGRAM_CHAT_ID=-100••••••••••

# Database
DATABASE_URL=postgresql://user:password@host:5432/parallelogram
```

### 4. Database Setup

```bash
npx prisma db push
```

### 5. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) → sign in → upload your first file.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 15 App Router |
| **Language** | TypeScript 5 |
| **Auth** | Clerk (social + email) |
| **Database** | PostgreSQL + Prisma ORM |
| **Storage** | Telegram Bot API |
| **Styling** | Vanilla CSS + CSS Variables |
| **Deployment** | Vercel / any Node.js host |

---

## Use Cases

- 🤖 **Telegram Bot backends** — native datastore inside bot servers
- 🧠 **AI/ML dataset storage** — stream multi-GB model weights
- 🎥 **Media hosting** — serve video/audio without CDN egress costs
- 🔒 **Encrypted backups** — DB exports with zero-readable shard metadata
- 🏗️ **CI/CD artifact storage** — build bundles via cURL
- ☁️ **S3 replacement** — free alternative for personal and small-team projects

---

## Self-Hosting Notes

1. Create a **private Telegram channel** and make your bot an admin.
2. The `TELEGRAM_CHAT_ID` must be the full channel ID (usually starts with `-100`).
3. Each file is stored as a Telegram message with the file attached — there is no storage limit per bot.
4. For production, use a **dedicated bot** per workspace and rotate tokens regularly.

---

## Windows / PowerShell Note

> PowerShell's `curl` is an alias for `Invoke-WebRequest`. Always use `curl.exe` to run real curl commands:

```powershell
# ✅ Correct
curl.exe -X POST http://localhost:3000/api/upload -H "Authorization: Bearer pd_live_..." -F "file=@photo.jpg"

# ❌ Wrong (uses Invoke-WebRequest alias)
curl -X POST ...
```

---

## License

GNU © [Sarwar Altaf Dar](https://github.com/techxsarwar),[Burhan Hamid Dar](https://github.com/burhanhamiddar) & [Parallelogram]

---

<div align="center">

**Built by devs, for devs.**

[Live Demo](https://parallelogramdrive.com) · [Documentation](https://parallelogramdrive.com/docs) · [Report a Bug](https://github.com/techxsarwar/ParallelogramDrive/issues)

</div>
