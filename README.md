# Frontend – AI Assistant Interface

## 📌 Overview
This is the UI for the AI Assistant platform — inspired by modern chat-based AI apps (ChatGPT, Claude, etc.).

Users can:
- Chat with AI across **13 models**
- View model tooltips with pricing & ideal use case info
- Adjust temperature
- Switch between **dark/light mode**
- Enable **Temporary Chat** (doesn’t save to Redis)
- Enable/disable **RAG**
- Upload PDFs & delete all documents
- Pick embedded PDFs for hybrid search queries
- Use keyword search (optional) + prompt
- Manage sidebar chat history (auto-generated titles)

---

## 🧠 Tech Stack
- **Next.js**
- **TypeScript**
- **MUI Material UI**
- **Axios**
- **ioredis**
- **pg**
- **react-router-dom**
- **react-markdown**
- **streamdown**
- **uuid**
- **remark-gfm**
- **rehype-highlight**

---

## 🚀 Getting Started

### 1. Install dependencies
```bash
npm install
```

### 2. Run development server
```bash
npm run dev
```

Open your browser at:  
👉 **http://localhost:3000**

---

## 🔧 Editing
You can begin editing the UI by modifying:

```
app/page.tsx
```

The page auto-reloads when files are saved.

---

## ⚠️ Known Bug (IMPORTANT)
GitHub sometimes capitalizes the file as:

```
Page.tsx
```

This **breaks Next.js routing**.  
Rename it manually to:

```
page.tsx
```

---

## 🔐 Environment Variables

1. Create `.env` in the project root  
2. Copy all keys from `.env-template`  
3. Replace `<placeholder>` values with real credentials  

Example:

```
# Supabase db
DATABASE_URL=postgresql://<USER>:<PASSWORD>@<HOST>:<PORT>/<DATABASE>?sslmode=require

# Redis
REDIS_HOST=<public-endpoint (without the :port-number on the end)>
REDIS_PORT=<redis-port>
REDIS_PASSWORD=<redis-user-password>

# Python Backend
PY_BACKEND_URL=<backend-url>
```

---

## 🧩 Supabase Schema

### Below is the schema used by the frontend for storing chats & messages.

### Chats Table
```sql
create table public.chats (
  id uuid not null default gen_random_uuid(),
  user_id character varying(255) not null,
  title character varying(500) not null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint chats_pkey primary key (id)
) TABLESPACE pg_default;

create index IF not exists idx_user_chats 
on public.chats using btree (user_id, updated_at desc) 
TABLESPACE pg_default;
```

### Messages Table
```sql
create table public.messages (
  id uuid not null default gen_random_uuid(),
  chat_id uuid not null,
  role character varying(50) not null,
  content text not null,
  created_at timestamp with time zone null default now(),
  constraint messages_pkey primary key (id),
  constraint messages_chat_id_fkey 
    foreign KEY (chat_id) references chats (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists idx_chat_messages 
on public.messages using btree (chat_id, created_at) 
TABLESPACE pg_default;
```

### What these schemas support
- Auto-generated chat titles
- Fast retrieval by user + updated timestamp
- Fast message loading per chat
- Automatic cleanup (messages deleted if chat is deleted)

---

## 📄 Features Summary
### Chat UI / Model Tools
- Agent-like interface  
- Supports 13 AI models  
- Tooltip with model pricing + ideal usage  
- Temperature slider  
- Light/Dark theme toggle  

### RAG
- Enable/disable hybrid RAG  
- Upload PDFs  
- Delete all PDFs  
- Pick a document  
- Query with keyword + prompt  

### Sidebar Chat History
- Saved in Redis  
- Auto-generated conversation titles  
- Temporary chat mode disables saving  

---

## 📝 TODO (Frontend)
- Improve auto-generated chat titles (too similar currently)
- Add ability to delete a single PDF (currently only “delete all”)
- Fix upload date — currently shows “Invalid date”
- Fix dark mode: `h3` / `h6` text colors in chat area
- Fix rewrite email feature (currently erroring)
- Enhance RAG preview for selected PDFs

---

## 🔗 Backend Link
👉 **View the Backend README here:**  

[`https://github.com/your-username/backend-repo`](https://github.com/SebuBergman/AI_assistant_backend)

